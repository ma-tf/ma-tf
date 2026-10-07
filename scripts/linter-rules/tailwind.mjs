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

function timeoutFor(live) {
  return live.cold ? 15000 : 5000;
}

function awaitAnswer(live, id, flag) {
  const waited = Atomics.wait(flag, 0, 0, timeoutFor(live));
  live.cold = false;
  if (waited === "timed-out") return null;
  const received = receiveMessageOnPort(live.port);
  if (!received) return null;
  if (received.message.id !== id) return null;
  return received.message.answer;
}

function roundTrip(live, cssFile, candidates) {
  const id = live.nextId++;
  const shared = new SharedArrayBuffer(4);
  const flag = new Int32Array(shared);
  live.port.postMessage({ id, cssFile, candidates, shared });
  return awaitAnswer(live, id, flag);
}

function ask(cssFile, candidates) {
  const live = start();
  if (!live) return null;
  const answer = roundTrip(live, cssFile, candidates);
  if (answer === null) return transportFailed();
  restarts = 0;
  return answer;
}

const verdicts = new Map();

function memoFor(cssFile) {
  const memo = verdicts.get(cssFile) ?? new Map();
  verdicts.set(cssFile, memo);
  return memo;
}

function recordVerdicts(memo, unseen, answer) {
  const unknown = new Set(answer);
  for (const token of unseen) memo.set(token, unknown.has(token));
}

function unknownClasses(cssFile, tokens) {
  if (bridge === false) return null;
  const memo = memoFor(cssFile);
  const unseen = tokens.filter((token) => !memo.has(token));
  const answer = unseen.length > 0 ? ask(cssFile, unseen) : [];
  if (!answer) return null;
  recordVerdicts(memo, unseen, answer);
  return tokens.filter((token) => memo.get(token) === true);
}

const projects = new Map();

function readConfig(marker) {
  try {
    return JSON.parse(fs.readFileSync(marker, "utf-8"));
  } catch {
    return null;
  }
}

function tailwindDeclaration(config) {
  return config?.tailwind?.css ?? config?.tailwind?.config;
}

function declaredCss(marker, dir) {
  const declared = tailwindDeclaration(readConfig(marker));
  if (typeof declared !== "string" || !declared) return null;
  return path.resolve(dir, declared);
}

function projectEntry(dir) {
  const marker = path.join(dir, "components.json");
  if (!fs.existsSync(marker)) return undefined;
  if (!projects.has(dir)) projects.set(dir, declaredCss(marker, dir));
  return projects.get(dir);
}

function projectFor(filename) {
  let dir = path.dirname(path.resolve(filename));
  while (true) {
    const found = projectEntry(dir);
    if (found !== undefined) return found;
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

const clusterRoot = /^(group|peer)(\/|$)/;

function isStatic(token) {
  return !clusterRoot.test(token) && !/[{}$<>]/.test(token);
}

function tokensWithIndex(text) {
  const found = [];
  const re = /\S+/g;
  let match;
  while ((match = re.exec(text))) found.push({ token: match[0], index: match.index });
  return found;
}

function isQuote(char) {
  return char === '"' || char === "'" || char === "`";
}

function skipQuoted(source, index, quote) {
  for (let i = index; i < source.length; i++) {
    if (source[i] === "\\") {
      i++;
      continue;
    }
    if (source[i] === quote) return i + 1;
  }
  return source.length;
}

function maskedChars(source) {
  const chars = [...source];
  for (let i = 0; i < chars.length; i++) {
    if (!isQuote(chars[i])) continue;
    const next = skipQuoted(source, i + 1, chars[i]);
    for (let j = i; j < next; j++) chars[j] = " ";
    i = next - 1;
  }
  return chars;
}

function braceStep(depth, char) {
  if (char === "{") return depth + 1;
  if (char !== "}") return depth;
  const next = depth - 1;
  if (next === 0) return null;
  return next;
}

function matchBrace(source, start) {
  const chars = maskedChars(source);
  let depth = 0;
  for (let i = start; i < chars.length; i++) {
    depth = braceStep(depth, chars[i]);
    if (depth === null) return i;
  }
  return -1;
}

function firstCapture(match) {
  return match[1] ?? match[2] ?? match[3] ?? "";
}

function captureIndex(match, value) {
  return match.index + (match[0].indexOf(value || match[0][0]) || 0);
}

function stringEntry(match) {
  const value = firstCapture(match);
  const at = captureIndex(match, value);
  return { value, offset: match[0][0] === value ? match.index : at };
}

function stringsIn(text) {
  const found = [];
  const re = /"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g;
  let match;
  while ((match = re.exec(text))) found.push(stringEntry(match));
  return found;
}

function staticTokensIn(text, base) {
  const results = [];
  for (const { token, index } of tokensWithIndex(text)) {
    if (isStatic(token)) results.push({ token, index: base + index });
  }
  return results;
}

function quotedCandidates(source, cursor, char) {
  const close = source.indexOf(char, cursor + 1);
  if (close === -1) return null;
  return {
    items: staticTokensIn(source.slice(cursor + 1, close), cursor + 1),
    next: close + 1,
  };
}

function expressionCandidates(source, cursor) {
  const close = matchBrace(source, cursor);
  if (close === -1) return null;
  const expression = source.slice(cursor + 1, close);
  const items = [];
  for (const string of stringsIn(expression)) {
    items.push(...staticTokensIn(string.value, cursor + 1 + string.offset));
  }
  return { items, next: close + 1 };
}

function classAttribute(source, cursor) {
  const char = source[cursor];
  if (char === '"' || char === "'") return quotedCandidates(source, cursor, char);
  if (char === "{") return expressionCandidates(source, cursor);
  return null;
}

function classCandidates(source) {
  const results = [];
  const re = /\bclass(?::list)?\s*=\s*/g;
  let match;
  while ((match = re.exec(source))) {
    const cursor = match.index + match[0].length;
    const found = classAttribute(source, cursor);
    if (!found) continue;
    results.push(...found.items);
    re.lastIndex = found.next;
  }
  return results;
}

function contextFilename(context) {
  return context.filename ?? context.physicalFilename ?? "";
}

function readTemplate(filename) {
  try {
    return fs.readFileSync(path.resolve(filename), "utf-8");
  } catch {
    return null;
  }
}

function uniqueCandidates(source) {
  const seen = new Set();
  const pending = [];
  for (const candidate of classCandidates(source)) {
    if (seen.has(candidate.token)) continue;
    seen.add(candidate.token);
    pending.push(candidate);
  }
  return pending;
}

function templateCandidates(filename) {
  const source = readTemplate(filename);
  if (source === null) return [];
  return uniqueCandidates(source.slice(templateStart(source)));
}

function relativeCss(context, cssFile) {
  return path.relative(context.cwd ?? process.cwd(), cssFile);
}

function reportUnknownClasses(context, node, cssFile, pending) {
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
        file: relativeCss(context, cssFile),
      },
    });
  }
}

function astroCss(filename) {
  if (!filename.endsWith(".astro")) return null;
  return projectFor(filename);
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
        const filename = contextFilename(context);
        const cssFile = astroCss(filename);
        if (!cssFile) return;
        const pending = templateCandidates(filename);
        if (pending.length === 0) return;
        reportUnknownClasses(context, node, cssFile, pending);
      },
    };
  },
};

function sourceRelative(context, filename) {
  return path.relative(context.cwd ?? process.cwd(), path.resolve(filename));
}

function isSourceFile(context, filename) {
  return sourceRelative(context, filename).startsWith(`src${path.sep}`);
}

function maxMdVariants(source) {
  const found = source.match(/max-md:[^\s"'`]+/g);
  if (!found) return null;
  return [...new Set(found)].join(", ");
}

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
        const filename = contextFilename(context);
        if (!isSourceFile(context, filename)) return;
        const source = readTemplate(filename);
        if (source === null) return;
        const variants = maxMdVariants(source);
        if (!variants) return;
        context.report({ node, messageId: "maxMd", data: { variants } });
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
