#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import { closeSync, existsSync, openSync, readFileSync, statSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../..");
const STATE_DIR = path.join(ROOT, ".scratch/verify-m4t");
const SESSION_FILE = path.join(STATE_DIR, "session.json");
const SERVER_FILE = path.join(STATE_DIR, "server.json");
const SERVER_LOG = path.join(STATE_DIR, "dev-server.log");
const DAEMON_LOG = path.join(STATE_DIR, "session.log");
const DEFAULT_EVIDENCE = path.join(STATE_DIR, "evidence");
const DEFAULT_BASE = process.env.M4T_BASE ?? "http://localhost:4321";
const IDENTITY = 'aria-label="m4t.tf home"';
const IDLE_MS = 10 * 60 * 1000;

const HELP = `control-m4t.mjs — drive the real m4t.tf site and capture proof.

Readiness
  doctor                       read-only verdict on the instance at --base
  launch                       reuse a running server, or start \`vp run dev\`
  status                       server, browser session and evidence state
  stop                         stop a server this CLI started (never another)
  cleanup                      stop the session and any server this CLI started

Drive a page (starts a headless Chromium session on demand)
  goto <path> [--viewport=WxH] [--reduced-motion] [--theme=light|dark] [--wait=ms]
  snapshot [selector]          ARIA snapshot of the page or element
  screenshot <file> [--full] [--selector=SEL]
  click <selector>              or --text=TEXT, or --role=ROLE --name=NAME
  hover <selector>
  fill <selector> <value>
  type <text>
  press <key>                  for example Control+k, Escape, Enter
  scroll [<selector>]          scroll an element into view, or
  scroll [--y=N]               scroll the window, or
  scroll --pane=SEL [--y=N]    set an inner pane's scrollTop
  wait [--selector=SEL] [--text=TEXT] [--ms=N] [--settle]
  text <selector>
  count <selector>
  attr <selector> <name>
  eval <expression>            run in the page, prints the JSON result
  console [--clear]            console messages and page errors
  requests [--clear]           responses, newest last
  viewport <WxH>
  media <reduced|default>
  theme <light|dark>

Options
  --base=URL        site base, default ${DEFAULT_BASE} (env M4T_BASE)
  --evidence=DIR    evidence root, default .scratch/verify-m4t/evidence
  --timeout=MS      per-action timeout, default 10000
  --help            print this text

Exit codes: 0 success, 1 command failed, 2 doctor found the instance unfit.
Every command prints one JSON object; failures carry \`error\` and \`hint\`.`;

class CliError extends Error {
  constructor(message, hint) {
    super(message);
    this.hint = hint;
  }
}

function parseArgv(argv) {
  const positionals = [];
  const flags = {};
  for (const arg of argv) {
    if (!arg.startsWith("--")) {
      positionals.push(arg);
      continue;
    }
    const [name, ...rest] = arg.slice(2).split("=");
    flags[name] = rest.length > 0 ? rest.join("=") : true;
  }
  return { positionals, flags };
}

function numberFlag(flags, name, fallback) {
  if (flags[name] === undefined || flags[name] === true) return fallback;
  const value = Number(flags[name]);
  if (!Number.isFinite(value)) throw new CliError(`--${name} must be a number, got "${flags[name]}"`);
  return value;
}

function baseUrl(flags) {
  const value = typeof flags.base === "string" ? flags.base : DEFAULT_BASE;
  try {
    return new URL(value).origin;
  } catch {
    throw new CliError(`--base must be an absolute URL, got "${value}"`, "Try --base=http://localhost:4321");
  }
}

function evidenceRoot(flags) {
  return typeof flags.evidence === "string" ? path.resolve(ROOT, flags.evidence) : DEFAULT_EVIDENCE;
}

function evidencePath(flags, file) {
  const root = evidenceRoot(flags);
  return path.isAbsolute(file) ? file : path.join(root, file);
}

function emit(data) {
  process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
}

function fail(error, hint) {
  emit({ ok: false, error, hint });
  process.exit(1);
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return null;
  }
}

async function devServerState() {
  const state = await readJson(path.join(ROOT, ".astro/dev.json"));
  return state && typeof state.pid === "number" ? state : null;
}

function parseViewport(value) {
  const match = /^(\d+)x(\d+)$/.exec(value ?? "");
  if (!match) throw new CliError(`viewport must look like 390x844, got "${value ?? ""}"`);
  return { width: Number(match[1]), height: Number(match[2]) };
}

function pidAlive(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function commandLine(pid) {
  try {
    return readFileSync(`/proc/${pid}/cmdline`, "utf8").replaceAll("\0", " ").trim();
  } catch {
    return "";
  }
}

async function siteGet(base, route) {
  try {
    const response = await fetch(new URL(route, base), { redirect: "follow" });
    return { status: response.status, body: await response.text(), headers: response.headers };
  } catch (error) {
    return { status: 0, body: "", error: String(error) };
  }
}

async function probeServer(base) {
  const home = await siteGet(base, "/");
  const reachable = home.status === 200;
  const identity = reachable && home.body.includes(IDENTITY);
  return { base, reachable, identity, status: home.status };
}

async function doctor(base, flags) {
  const server = await probeServer(base);
  const checks = [];
  checks.push({
    name: "server",
    ok: server.reachable,
    detail: server.reachable ? `GET / -> ${server.status}` : `GET / -> ${server.status || "unreachable"}`,
  });
  checks.push({
    name: "identity",
    ok: server.identity,
    detail: server.identity ? `found ${IDENTITY}` : `no ${IDENTITY} in the served HTML`,
  });

  if (server.identity) {
    const vite = await siteGet(base, "/@vite/client");
    checks.push({
      name: "mode",
      ok: true,
      detail: vite.status === 200 ? "dev server (HMR)" : "built output (no HMR)",
    });
    const ask = await siteGet(base, "/.well-known/mcp/server-card.json");
    checks.push({
      name: "ask",
      ok: true,
      detail:
        ask.status === 200
          ? "enabled (ask tool and /ask are published)"
          : ask.status === 404
            ? "disabled (PUBLIC_ASK_ENABLED is off in this instance)"
            : `server card -> ${ask.status}`,
    });
    const llms = await siteGet(base, "/llms.txt");
    checks.push({ name: "discovery", ok: llms.status === 200, detail: `GET /llms.txt -> ${llms.status}` });
  }

  const session = await sessionState();
  checks.push({
    name: "session",
    ok: true,
    detail: session ? `chromium session on port ${session.port} (pid ${session.pid})` : "no browser session (starts on first drive command)",
  });
  const owner = await readJson(SERVER_FILE);
  checks.push({
    name: "server-owner",
    ok: true,
    detail: owner && pidAlive(owner.pid) ? `started by this CLI (pid ${owner.pid})` : "not started by this CLI; it will be left running",
  });
  checks.push({
    name: "secrets",
    ok: true,
    detail: existsSync(path.join(process.env.HOME ?? "", ".config/age/keys.txt"))
      ? "age identity present; `vp run dev` can decrypt"
      : "age identity missing; `vp run dev` cannot decrypt, attach to an already running server",
  });

  const healthy = server.reachable && server.identity;
  emit({
    ok: healthy,
    base,
    verdict: healthy ? "healthy" : server.reachable ? "wrong application on this port" : "nothing listening",
    checks,
    evidence: evidenceRoot(flags),
    hint: healthy
      ? undefined
      : "Run `control-m4t.mjs launch` to start `vp run dev`, or pass --base=<url> for the instance you meant.",
  });
  process.exit(healthy ? 0 : 2);
}

async function launch(base, flags) {
  const probe = await probeServer(base);
  if (probe.identity) {
    emit({ ok: true, attached: true, base, detail: "reused the server already listening" });
    return;
  }
  if (probe.reachable) {
    throw new CliError(
      `${base} answers but is not m4t.tf`,
      "Pass --base=<url> for the instance you meant. This CLI never stops a server it did not start.",
    );
  }
  if (base !== new URL(DEFAULT_BASE).origin) {
    throw new CliError(
      `nothing answers at ${base}`,
      "This CLI only starts the dev server at its default base. Start your preview server yourself, then rerun with --base.",
    );
  }
  if (!existsSync(path.join(process.env.HOME ?? "", ".config/age/keys.txt"))) {
    throw new CliError(
      "cannot start the dev server without the age identity",
      "Create ~/.config/age/keys.txt, or start `vp run dev` yourself and rerun with --base.",
    );
  }

  await mkdir(STATE_DIR, { recursive: true });
  const log = openSync(SERVER_LOG, "w");
  const child = spawn("vp", ["run", "dev"], {
    cwd: ROOT,
    detached: true,
    stdio: ["ignore", log, log],
    env: { ...process.env, SECRETSPEC_REASON: "verify-m4t browser verification" },
  });
  closeSync(log);
  child.unref();
  await writeFile(
    SERVER_FILE,
    JSON.stringify({ pid: child.pid, base, startedAt: new Date().toISOString(), daemon: false }, null, 2),
  );

  const deadline = Date.now() + numberFlag(flags, "timeout", 240000);
  while (Date.now() < deadline) {
    if ((await probeServer(base)).identity) {
      let daemon = await devServerState();
      if (!daemon && !pidAlive(child.pid)) {
        for (let attempt = 0; attempt < 20 && !daemon; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          daemon = await devServerState();
        }
      }
      const record = {
        pid: daemon?.pid ?? child.pid,
        base,
        startedAt: new Date().toISOString(),
        daemon: Boolean(daemon),
      };
      await writeFile(SERVER_FILE, JSON.stringify(record, null, 2));
      emit({
        ok: true,
        attached: false,
        base,
        pid: record.pid,
        daemon: record.daemon,
        log: path.relative(ROOT, SERVER_LOG),
      });
      return;
    }
    if (!pidAlive(child.pid)) {
      const daemon = await devServerState();
      if (!daemon) {
        await rm(SERVER_FILE, { force: true });
        throw new CliError(
          `\`vp run dev\` exited before ${base} answered`,
          `Read ${path.relative(ROOT, SERVER_LOG)} for the failure.`,
        );
      }
      await writeFile(
        SERVER_FILE,
        JSON.stringify({ pid: daemon.pid, base, startedAt: new Date().toISOString(), daemon: true }, null, 2),
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new CliError(
    `${base} did not become ready in time`,
    `The process is still running (pid ${child.pid}). Check ${path.relative(ROOT, SERVER_LOG)}, or run cleanup.`,
  );
}

async function stopServer() {
  const owner = await readJson(SERVER_FILE);
  if (!owner) return { ok: true, stopped: false, detail: "no server was started by this CLI" };
  if (owner.daemon) {
    const daemon = await devServerState();
    if (!daemon || daemon.pid !== owner.pid) {
      await rm(SERVER_FILE, { force: true });
      return { ok: true, stopped: false, detail: "the recorded dev server had already stopped" };
    }
    const line = commandLine(owner.pid);
    if (!/astro/.test(line)) {
      throw new CliError(
        `pid ${owner.pid} no longer looks like the dev server (${line || "unknown"})`,
        "Refusing to stop it. Inspect the process, then delete .scratch/verify-m4t/server.json.",
      );
    }
    const result = spawnSync("vpx", ["astro", "dev", "stop"], { cwd: ROOT, encoding: "utf8" });
    await rm(SERVER_FILE, { force: true });
    if (result.status !== 0) {
      throw new CliError(
        `\`vpx astro dev stop\` exited with ${result.status}`,
        (result.stderr || result.stdout || "").trim() || "Inspect the dev server by hand.",
      );
    }
    return { ok: true, stopped: true, pid: owner.pid, detail: "stopped the background dev server this CLI started" };
  }
  if (!pidAlive(owner.pid)) {
    await rm(SERVER_FILE, { force: true });
    return { ok: true, stopped: false, detail: "the recorded server had already exited" };
  }
  const line = commandLine(owner.pid);
  if (!/astro|vp/.test(line)) {
    throw new CliError(
      `pid ${owner.pid} no longer looks like the dev server (${line || "unknown"})`,
      "Refusing to kill it. Inspect the process, then delete .scratch/verify-m4t/server.json.",
    );
  }
  process.kill(-owner.pid, "SIGTERM");
  await rm(SERVER_FILE, { force: true });
  return { ok: true, stopped: true, pid: owner.pid, detail: "sent SIGTERM to the process group this CLI started" };
}

async function sessionState() {
  const state = await readJson(SESSION_FILE);
  if (!state || !pidAlive(state.pid)) return null;
  try {
    if (state.scriptMtime !== statSync(fileURLToPath(import.meta.url)).mtimeMs) return null;
  } catch {
    return null;
  }
  return state;
}

async function retireStaleSession() {
  const state = await readJson(SESSION_FILE);
  if (!state || !pidAlive(state.pid)) return;
  let current;
  try {
    current = statSync(fileURLToPath(import.meta.url)).mtimeMs;
  } catch {
    return;
  }
  if (state.scriptMtime === current) return;
  try {
    await sessionSend(state.port, "shutdown", {});
  } catch {
    process.kill(state.pid, "SIGTERM");
  }
  await rm(SESSION_FILE, { force: true });
}

async function sessionSend(port, cmd, args) {
  const response = await fetch(`http://127.0.0.1:${port}/command`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ cmd, args }),
  });
  const data = await response.json();
  if (!data.ok) throw new CliError(data.error ?? `session failed with ${response.status}`, data.hint);
  return data;
}

async function ensureSession(flags) {
  const state = await sessionState();
  if (state) return state.port;

  await retireStaleSession();

  await mkdir(STATE_DIR, { recursive: true });
  const log = openSync(DAEMON_LOG, "w");
  const child = spawn(process.execPath, [fileURLToPath(import.meta.url), "__daemon"], {
    cwd: ROOT,
    detached: true,
    stdio: ["ignore", log, log],
  });
  closeSync(log);
  child.unref();

  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    const next = await sessionState();
    if (next && next.pid === child.pid) return next.port;
    if (!pidAlive(child.pid)) {
      throw new CliError("the browser session exited during start-up", `Read ${path.relative(ROOT, DAEMON_LOG)}.`);
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new CliError("the browser session did not report a port", `Read ${path.relative(ROOT, DAEMON_LOG)}.`);
}

async function drive(cmd, args, flags) {
  const port = await ensureSession(flags);
  return sessionSend(port, cmd, args);
}

async function status(base, flags) {
  const server = await probeServer(base);
  const session = await sessionState();
  const owner = await readJson(SERVER_FILE);
  emit({
    ok: server.identity,
    base,
    server: {
      reachable: server.reachable,
      identity: server.identity,
      startedByThisCli: Boolean(owner && pidAlive(owner.pid)),
      pid: owner?.pid ?? null,
    },
    session: session ? { port: session.port, pid: session.pid, startedAt: session.startedAt } : null,
    evidence: evidenceRoot(flags),
  });
  process.exit(server.identity ? 0 : 2);
}

async function cleanup(base, flags) {
  const report = { ok: true, session: null, server: null, evidence: evidenceRoot(flags) };
  const session = await readJson(SESSION_FILE);
  if (session && pidAlive(session.pid)) {
    try {
      await sessionSend(session.port, "shutdown", {});
      report.session = { stopped: true, pid: session.pid };
    } catch {
      process.kill(session.pid, "SIGTERM");
      report.session = { stopped: true, pid: session.pid, detail: "sent SIGTERM" };
    }
    await rm(SESSION_FILE, { force: true });
  }
  report.server = await stopServer();
  emit(report);
}

function daemonLog(file) {
  try {
    return readFileSync(file, "utf8").trim().split("\n").slice(-8).join("\n");
  } catch {
    return "";
  }
}

async function runDaemon() {
  let browser;
  let context;
  let page;
  const consoleEntries = [];
  const responses = [];
  let theme = null;
  let viewport = { width: 1280, height: 900 };
  let idle;

  const resetIdle = () => {
    clearTimeout(idle);
    idle = setTimeout(() => shutdown(0), IDLE_MS);
  };

  const shutdown = async (code) => {
    clearTimeout(idle);
    await rm(SESSION_FILE, { force: true });
    await browser?.close().catch(() => {});
    process.exit(code);
  };

  const getPage = async () => {
    if (!context) {
      browser = await chromium.launch();
      context = await browser.newContext({ viewport, permissions: ["clipboard-read", "clipboard-write"] });
    }
    if (!page) {
      page = await context.newPage();
      page.on("console", (message) => consoleEntries.push({ type: message.type(), text: message.text() }));
      page.on("pageerror", (error) => consoleEntries.push({ type: "pageerror", text: String(error) }));
      page.on("response", (response) =>
        responses.push({
          status: response.status(),
          method: response.request().method(),
          url: response.url(),
          contentType: response.headers()["content-type"] ?? null,
        }),
      );
    }
    return page;
  };

  const settle = async (target) => {
    await target.waitForLoadState("domcontentloaded").catch(() => {});
    await target.evaluate(() => document.fonts.ready).catch(() => {});
    await target
      .waitForFunction(
        () => {
          const control = document.querySelector("[data-motion-control]");
          const entrance = !control || control.getAttribute("data-mode") !== "skip";
          return entrance && !document.documentElement.classList.contains("parallax-active");
        },
        null,
        { timeout: 8000 },
      )
      .catch(() => {});
    await target
      .waitForFunction(
        () =>
          [...document.querySelectorAll('astro-island[client="load"]')].every((island) =>
            island.hasAttribute("client-render-time"),
          ),
        null,
        { timeout: 8000 },
      )
      .catch(() => {});
    await target.waitForTimeout(250);
  };

  const hydrated = (target, selector) =>
    target
      .waitForFunction(
        (sel) => {
          const islands = document.querySelectorAll("astro-island");
          if (islands.length === 0) return true;
          const island = (sel ? document.querySelector(sel)?.closest("astro-island") : null) ?? islands[0];
          return island.hasAttribute("client-render-time") || !island.hasAttribute("ssr");
        },
        selector ?? null,
        { timeout: 8000 },
      )
      .catch(() => {});

  const locate = (target, args, action) => {
    if (args.selector) return target.locator(args.selector).first();
    if (args.role) return target.getByRole(args.role, args.name ? { name: args.name } : {}).first();
    if (args.text) return target.getByText(args.text, { exact: Boolean(args.exact) }).first();
    throw new CliError(`${action} needs a selector, --text, or --role`, "For example: click 'button[aria-label=\"Toggle theme\"]'");
  };

  const handlers = {
    async goto(args) {
      const target = await getPage();
      if (args.viewport) {
        viewport = args.viewport;
        await target.setViewportSize(viewport);
      }
      if (args.theme) {
        theme = args.theme;
        await target.addInitScript((value) => {
          try {
            localStorage.setItem("theme", value);
          } catch {}
        }, theme);
      }
      if (args.reducedMotion !== undefined) {
        await target.emulateMedia({ reducedMotion: args.reducedMotion ? "reduce" : "no-preference" });
      }
      const response = await target.goto(args.url, { waitUntil: "load", timeout: args.timeout });
      await hydrated(target, null);
      if (args.wait > 0) await target.waitForTimeout(args.wait);
      await settle(target);
      return { ok: true, url: target.url(), title: await target.title(), status: response?.status() ?? null };
    },

    async snapshot(args) {
      const target = await getPage();
      const selector = args.selector ?? "body";
      const locator = target.locator(selector).first();
      if ((await locator.count()) === 0) {
        throw new CliError(`nothing matches ${selector}`, "Run `snapshot` with no selector to read the whole page first.");
      }
      return { ok: true, selector, snapshot: await locator.ariaSnapshot() };
    },

    async screenshot(args) {
      const target = await getPage();
      await mkdir(path.dirname(args.path), { recursive: true });
      if (args.selector) {
        const locator = target.locator(args.selector).first();
        await locator.screenshot({ path: args.path });
      } else {
        await target.screenshot({ path: args.path, fullPage: Boolean(args.full) });
      }
      return { ok: true, path: args.path };
    },

    async click(args) {
      const target = await getPage();
      const locator = locate(target, args, "click");
      await locator.scrollIntoViewIfNeeded({ timeout: args.timeout });
      await hydrated(target, args.selector ?? null);
      await locator.click({ timeout: args.timeout });
      await target.waitForTimeout(args.settleAfter ?? 150);
      return { ok: true, clicked: args.selector ?? args.name ?? args.text, url: target.url() };
    },

    async hover(args) {
      const target = await getPage();
      const locator = locate(target, args, "hover");
      await locator.hover({ timeout: args.timeout });
      await target.waitForTimeout(args.settleAfter ?? 150);
      return { ok: true, hovered: args.selector ?? args.name ?? args.text };
    },

    async fill(args) {
      const target = await getPage();
      const locator = locate(target, args, "fill");
      await locator.scrollIntoViewIfNeeded({ timeout: args.timeout });
      await hydrated(target, args.selector ?? null);
      await locator.fill(args.value, { timeout: args.timeout });
      await target.waitForTimeout(100);
      return { ok: true, filled: args.selector ?? args.name, value: await locator.inputValue().catch(() => null) };
    },

    async type(args) {
      const target = await getPage();
      await target.keyboard.type(args.text);
      return { ok: true, typed: args.text };
    },

    async press(args) {
      const target = await getPage();
      await settle(target);
      await target.keyboard.press(args.key);
      await target.waitForTimeout(args.settleAfter ?? 150);
      return { ok: true, pressed: args.key };
    },

    async scroll(args) {
      const target = await getPage();
      if (args.pane) {
        const next = await target.locator(args.pane).first().evaluate((element, y) => {
          element.scrollTop = y ?? element.scrollHeight;
          return element.scrollTop;
        }, args.y);
        return { ok: true, pane: args.pane, scrollTop: next };
      }
      if (args.selector) {
        await target.locator(args.selector).first().scrollIntoViewIfNeeded({ timeout: args.timeout });
        return { ok: true, scrolledIntoView: args.selector };
      }
      const next = await target.evaluate((y) => {
        window.scrollTo(0, y ?? window.scrollY + window.innerHeight);
        return window.scrollY;
      }, args.y);
      return { ok: true, scrolled: "window", scrollY: next };
    },

    async wait(args) {
      const target = await getPage();
      if (args.selector) {
        await target.locator(args.selector).first().waitFor({ state: "visible", timeout: args.timeout });
        return { ok: true, waited: args.selector, state: "visible" };
      }
      if (args.text) {
        await target.getByText(args.text).first().waitFor({ state: "visible", timeout: args.timeout });
        return { ok: true, waited: args.text, state: "visible" };
      }
      if (args.ms) {
        await target.waitForTimeout(args.ms);
        return { ok: true, waitedMs: args.ms };
      }
      await settle(target);
      return { ok: true, waited: "settled", url: target.url() };
    },

    async text(args) {
      const target = await getPage();
      const locator = locate(target, args, "text");
      return { ok: true, text: await locator.innerText({ timeout: args.timeout }) };
    },

    async count(args) {
      const target = await getPage();
      return { ok: true, selector: args.selector, count: await target.locator(args.selector).count() };
    },

    async attr(args) {
      const target = await getPage();
      return { ok: true, selector: args.selector, name: args.name, value: await target.locator(args.selector).first().getAttribute(args.name) };
    },

    async eval(args) {
      const target = await getPage();
      return { ok: true, result: await target.evaluate(args.expression) };
    },

    async console(args) {
      if (args.clear) consoleEntries.length = 0;
      return { ok: true, entries: consoleEntries.slice() };
    },

    async requests(args) {
      if (args.clear) responses.length = 0;
      return { ok: true, entries: responses.slice(-200) };
    },

    async viewport(args) {
      const target = await getPage();
      viewport = args.viewport;
      await target.setViewportSize(viewport);
      return { ok: true, viewport };
    },

    async media(args) {
      const target = await getPage();
      await target.emulateMedia({ reducedMotion: args.reduced ? "reduce" : "no-preference" });
      return { ok: true, reducedMotion: Boolean(args.reduced) };
    },

    async theme(args) {
      theme = args.theme;
      const target = await getPage();
      await target.addInitScript((value) => {
        try {
          localStorage.setItem("theme", value);
        } catch {}
      }, theme);
      await target.evaluate((value) => {
        document.documentElement.classList.toggle("dark", value === "dark");
        localStorage.setItem("theme", value);
      }, theme);
      await target.waitForTimeout(400);
      return { ok: true, theme };
    },

    async url() {
      const target = await getPage();
      return { ok: true, url: target.url(), title: await target.title() };
    },

    async shutdown() {
      setImmediate(() => shutdown(0));
      return { ok: true };
    },
  };

  await mkdir(STATE_DIR, { recursive: true });
  const server = createServer(async (request, response) => {
    resetIdle();
    let body = "";
    for await (const chunk of request) body += chunk;
    try {
      const { cmd, args = {} } = JSON.parse(body || "{}");
      const handler = handlers[cmd];
      if (!handler) throw new CliError(`unknown session command "${cmd}"`);
      const data = await handler(args);
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(data));
    } catch (error) {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ ok: false, error: error.message, hint: error.hint, stack: error.stack?.split("\n")[0] }));
    }
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  await writeFile(
    SESSION_FILE,
    JSON.stringify({ port, pid: process.pid, startedAt: new Date().toISOString(), scriptMtime: statSync(fileURLToPath(import.meta.url)).mtimeMs }, null, 2),
  );
  resetIdle();

  for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => shutdown(0));
  process.on("uncaughtException", (error) => {
    console.error(error);
    shutdown(1);
  });
}

async function main() {
  const { positionals, flags } = parseArgv(process.argv.slice(2));
  const [command, ...rest] = positionals;

  if (!command || command === "help" || flags.help) {
    process.stdout.write(`${HELP}\n`);
    return;
  }

  if (command === "__daemon") {
    await runDaemon();
    return;
  }

  const base = baseUrl(flags);
  const timeout = numberFlag(flags, "timeout", 10000);

  switch (command) {
    case "doctor":
      await doctor(base, flags);
      return;
    case "launch":
      await launch(base, flags);
      return;
    case "status":
      await status(base, flags);
      return;
    case "stop":
      emit(await stopServer());
      return;
    case "cleanup":
      await cleanup(base, flags);
      return;
    case "goto": {
      const target = rest[0] ?? "/";
      emit(
        await drive(
          "goto",
          {
            url: new URL(target, base).href,
            viewport: flags.viewport ? parseViewport(flags.viewport) : undefined,
            theme: typeof flags.theme === "string" ? flags.theme : undefined,
            reducedMotion: flags["reduced-motion"] ? true : undefined,
            wait: numberFlag(flags, "wait", 0),
            timeout,
          },
          flags,
        ),
      );
      return;
    }
    case "snapshot":
      emit(await drive("snapshot", { selector: rest[0], timeout }, flags));
      return;
    case "screenshot": {
      if (!rest[0]) throw new CliError("screenshot needs a file path", "For example: screenshot home.png --full");
      emit(await drive("screenshot", { path: evidencePath(flags, rest[0]), full: Boolean(flags.full), selector: flags.selector }, flags));
      return;
    }
    case "click":
      emit(
        await drive(
          "click",
          {
            selector: typeof flags.selector === "string" ? flags.selector : rest[0],
            text: typeof flags.text === "string" ? flags.text : undefined,
            role: typeof flags.role === "string" ? flags.role : undefined,
            name: typeof flags.name === "string" ? flags.name : undefined,
            exact: flags.exact,
            timeout,
          },
          flags,
        ),
      );
      return;
    case "hover":
      emit(
        await drive(
          "hover",
          {
            selector: typeof flags.selector === "string" ? flags.selector : rest[0],
            text: typeof flags.text === "string" ? flags.text : undefined,
            role: typeof flags.role === "string" ? flags.role : undefined,
            name: typeof flags.name === "string" ? flags.name : undefined,
            timeout,
          },
          flags,
        ),
      );
      return;
    case "fill":
      emit(
        await drive(
          "fill",
          {
            selector: typeof flags.selector === "string" ? flags.selector : rest[0],
            value: rest[1] ?? "",
            role: typeof flags.role === "string" ? flags.role : undefined,
            name: typeof flags.name === "string" ? flags.name : undefined,
            timeout,
          },
          flags,
        ),
      );
      return;
    case "type":
      if (!rest[0]) throw new CliError("type needs text", "For example: type \"hello\"");
      emit(await drive("type", { text: rest.join(" ") }, flags));
      return;
    case "press":
      if (!rest[0]) throw new CliError("press needs a key", "For example: press Control+k");
      emit(await drive("press", { key: rest[0] }, flags));
      return;
    case "scroll":
      emit(
        await drive(
          "scroll",
          {
            y: flags.y === undefined ? undefined : numberFlag(flags, "y", 0),
            selector: typeof flags.selector === "string" ? flags.selector : rest[0],
            pane: typeof flags.pane === "string" ? flags.pane : undefined,
            timeout,
          },
          flags,
        ),
      );
      return;
    case "wait":
      emit(
        await drive(
          "wait",
          {
            selector: flags.selector,
            text: flags.text,
            ms: flags.ms === undefined ? undefined : numberFlag(flags, "ms", 0),
            settle: true,
            timeout,
          },
          flags,
        ),
      );
      return;
    case "text":
      emit(await drive("text", { selector: rest[0], role: flags.role, name: flags.name, timeout }, flags));
      return;
    case "count":
      if (!rest[0]) throw new CliError("count needs a selector");
      emit(await drive("count", { selector: rest[0] }, flags));
      return;
    case "attr":
      if (rest.length < 2) throw new CliError("attr needs a selector and an attribute name");
      emit(await drive("attr", { selector: rest[0], name: rest[1] }, flags));
      return;
    case "eval":
      if (!rest[0]) throw new CliError("eval needs an expression", "For example: eval 'document.title'");
      emit(await drive("eval", { expression: rest.join(" ") }, flags));
      return;
    case "console":
      emit(await drive("console", { clear: Boolean(flags.clear) }, flags));
      return;
    case "requests":
      emit(await drive("requests", { clear: Boolean(flags.clear) }, flags));
      return;
    case "viewport":
      if (!rest[0]) throw new CliError("viewport needs WxH", "For example: viewport 390x844");
      emit(await drive("viewport", { viewport: parseViewport(rest[0]) }, flags));
      return;
    case "media":
      emit(await drive("media", { reduced: rest[0] !== "default" }, flags));
      return;
    case "theme":
      if (!["light", "dark"].includes(rest[0])) throw new CliError("theme needs light or dark");
      emit(await drive("theme", { theme: rest[0] }, flags));
      return;
    default:
      throw new CliError(`unknown command "${command}"`, "Run `control-m4t.mjs --help` for the command list.");
  }
}

main().catch((error) => {
  if (error instanceof CliError) fail(error.message, error.hint);
  fail(error.message ?? String(error), daemonLog(DAEMON_LOG) || "Re-run with --help to check the command shape.");
});
