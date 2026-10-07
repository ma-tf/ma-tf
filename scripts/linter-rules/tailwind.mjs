import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MessageChannel, Worker, receiveMessageOnPort } from "node:worker_threads";

const WORKER = fileURLToPath(new URL("./tailwind-worker.mjs", import.meta.url));

let bridge;
let restarts = 0;

function stop() {
  bridge?.worker.terminate();
  bridge = undefined;
}

function transportFailed() {
  stop();
  if (restarts++ >= 1) bridge = false;
  return null;
}

function start() {
  if (bridge) return bridge;
  if (bridge === false) return null;
  try {
    const channel = new MessageChannel();
    const worker = new Worker(WORKER, {
      workerData: { port: channel.port2 },
      transferList: [channel.port2],
    });
    worker.on("error", () => {
      if (bridge && bridge.worker === worker) transportFailed();
    });
    worker.on("exit", () => {
      if (bridge && bridge.worker === worker) stop();
    });
    worker.unref();
    channel.port1.unref();
    bridge = { worker, port: channel.port1, nextId: 1, cold: true };
    return bridge;
  } catch {
    return transportFailed();
  }
}

function ask(cssFile, candidates) {
  const live = start();
  if (!live) return null;
  const id = live.nextId++;
  const shared = new SharedArrayBuffer(4);
  const flag = new Int32Array(shared);
  live.port.postMessage({ id, cssFile, candidates, shared });
  const waited = Atomics.wait(flag, 0, 0, live.cold ? 15000 : 5000);
  live.cold = false;
  if (waited === "timed-out") return transportFailed();
  const received = receiveMessageOnPort(live.port);
  if (!received || received.message.id !== id) return transportFailed();
  restarts = 0;
  return received.message.answer;
}

const verdicts = new Map();

function unknownClasses(cssFile, tokens) {
  if (bridge === false) return null;
  const memo = verdicts.get(cssFile) ?? new Map();
  verdicts.set(cssFile, memo);
  const unseen = tokens.filter((token) => !memo.has(token));
  if (unseen.length > 0) {
    const answer = ask(cssFile, unseen);
    if (!answer) return null;
    const unknown = new Set(answer);
    for (const token of unseen) memo.set(token, unknown.has(token));
  }
  return tokens.filter((token) => memo.get(token) === true);
}

const projects = new Map();

function projectFor(filename) {
  let dir = path.dirname(path.resolve(filename));
  while (true) {
    const marker = path.join(dir, "components.json");
    if (fs.existsSync(marker)) {
      if (!projects.has(dir)) {
        let css = null;
        try {
          const config = JSON.parse(fs.readFileSync(marker, "utf-8"));
          const declared = config?.tailwind?.css ?? config?.tailwind?.config;
          if (typeof declared === "string" && declared) {
            css = path.resolve(dir, declared);
          }
        } catch {}
        projects.set(dir, css);
      }
      return projects.get(dir);
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function templateStart(source) {
  const frontmatter = source.match(/^---[^\S\n]*\r?\n/);
  if (!frontmatter) return 0;
  const close = source.indexOf("\n---", frontmatter[0].length);
  if (close === -1) return 0;
  const after = source.indexOf("\n", close + 1);
  return after === -1 ? source.length : after + 1;
}

function isStatic(token) {
  if (token === "group" || token === "peer") return false;
  if (token.startsWith("group/") || token.startsWith("peer/")) return false;
  return !/[{}$<>]/.test(token);
}

function tokensWithIndex(text) {
  const found = [];
  const re = /\S+/g;
  let match;
  while ((match = re.exec(text))) found.push({ token: match[0], index: match.index });
  return found;
}

function matchBrace(source, start) {
  let depth = 0;
  let quote = null;
  for (let i = start; i < source.length; i++) {
    const char = source[i];
    if (quote) {
      if (char === "\\") {
        i++;
        continue;
      }
      if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "{") depth++;
    else if (char === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function stringsIn(text) {
  const found = [];
  const re = /"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g;
  let match;
  while ((match = re.exec(text))) {
    const value = match[1] ?? match[2] ?? match[3] ?? "";
    const offset = match.index + (match[0].indexOf(value || match[0][0]) || 0);
    found.push({ value, offset: match[0][0] === value ? match.index : offset });
  }
  return found;
}

function classCandidates(source) {
  const results = [];
  const re = /\bclass(?::list)?\s*=\s*/g;
  let match;
  while ((match = re.exec(source))) {
    const cursor = match.index + match[0].length;
    const char = source[cursor];
    if (char === '"' || char === "'") {
      const close = source.indexOf(char, cursor + 1);
      if (close === -1) continue;
      const value = source.slice(cursor + 1, close);
      for (const { token, index } of tokensWithIndex(value)) {
        if (isStatic(token)) results.push({ token, index: cursor + 1 + index });
      }
      re.lastIndex = close + 1;
      continue;
    }
    if (char === "{") {
      const close = matchBrace(source, cursor);
      if (close === -1) continue;
      const expression = source.slice(cursor + 1, close);
      for (const string of stringsIn(expression)) {
        for (const { token, index } of tokensWithIndex(string.value)) {
          if (isStatic(token)) {
            results.push({
              token,
              index: cursor + 1 + string.offset + index,
            });
          }
        }
      }
      re.lastIndex = close + 1;
    }
  }
  return results;
}

const noUnknownClasses = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow Tailwind utility classes in .astro markup that generate no CSS.",
    },
    messages: {
      unknownClass:
        '"{{className}}" is not a class this project\'s Tailwind knows, so no CSS is generated for it. Fix the spelling, or declare it with @utility in {{file}}.',
    },
  },
  createOnce(context) {
    return {
      Program(node) {
        const filename = context.filename ?? context.physicalFilename ?? "";
        if (!filename.endsWith(".astro")) return;
        const cssFile = projectFor(filename);
        if (!cssFile) return;
        let source = "";
        try {
          source = fs.readFileSync(path.resolve(filename), "utf-8");
        } catch {
          return;
        }
        const start = templateStart(source);
        const seen = new Set();
        const pending = [];
        for (const candidate of classCandidates(source.slice(start))) {
          if (seen.has(candidate.token)) continue;
          seen.add(candidate.token);
          pending.push(candidate);
        }
        if (pending.length === 0) return;
        const unknown = unknownClasses(
          cssFile,
          pending.map((candidate) => candidate.token),
        );
        if (!unknown) return;
        const bad = new Set(unknown);
        for (const candidate of pending) {
          if (!bad.has(candidate.token)) continue;
          context.report({
            node,
            messageId: "unknownClass",
            data: {
              className: candidate.token,
              file: path.relative(context.cwd ?? process.cwd(), cssFile),
            },
          });
        }
      },
    };
  },
};

const noMaxMd = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow max-md: variant classes in favour of mobile-first md: variants.",
    },
    messages: {
      maxMd:
        'Write mobile-first: use the base classes for the small-screen layout and layer "md:" variants over them, not "max-md:" (found {{variants}}). See docs/conventions.md.',
    },
  },
  createOnce(context) {
    return {
      Program(node) {
        const filename = context.filename ?? context.physicalFilename ?? "";
        const relative = path.relative(context.cwd ?? process.cwd(), path.resolve(filename));
        if (!relative.startsWith(`src${path.sep}`)) return;
        let source = "";
        try {
          source = fs.readFileSync(path.resolve(filename), "utf-8");
        } catch {
          return;
        }
        const found = source.match(/max-md:[^\s"'`]+/g);
        if (!found) return;
        context.report({
          node,
          messageId: "maxMd",
          data: { variants: [...new Set(found)].join(", ") },
        });
      },
    };
  },
};

export default {
  meta: { name: "tailwind" },
  rules: {
    "no-unknown-classes": noUnknownClasses,
    "no-max-md": noMaxMd,
  },
};
