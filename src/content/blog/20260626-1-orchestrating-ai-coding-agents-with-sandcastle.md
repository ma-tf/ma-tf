---
title: "Orchestrating AI coding agents with Sandcastle"
slug: "20260626-1-orchestrating-ai-coding-agents-with-sandcastle"
pubDate: 2026-06-26
description: "Sandcastle is a TypeScript library and CLI for orchestrating AI coding agents across 6 providers and 4 sandbox runtimes."
author: "Matt F"
tags: ["ai", "tools", "open-source", "programming"]
---

AI coding agents are powerful, but they're also synchronous and limited by the human its converses with. You open a chat, type a prompt, watch code stream in, review diffs, copy-paste, commit. Every interaction is a conversation you have to sit through.

What if you could treat an agent like a function call instead?

```ts
const result = await run({
  agent: "claude",
  sandbox: "docker",
  prompt: "Add input validation to the API layer",
});
```

That's what Sandcastle does.

## What is Sandcastle?

Sandcastle is a TypeScript library and CLI for orchestrating AI coding agents built by Matt Pocock.

It plugs into multiple providers - Claude Code, Codex, Cursor, OpenCode, Copilot, etc - and it can run in different sandboxes - Docker, Podman etc. One API, many backends.

Behind the scenes, Sandcastle manages the full lifecycle: spin up a sandbox, create a git worktree, invoke the agent, collect commits, and merge results back. You don't wrangle Docker commands or git plumbing. You just call `run()`.

## The Core API

`run()` is the main event. You tell it which agent to use, where to run it, and what to do. It handles the rest.

```ts
import { run } from "@ai-hero/sandcastle";

const result = await run({
  agent: "claude",
  sandbox: "docker",
  prompt: "Refactor the auth module to use JWT",
});

console.log(result.commits);
```

Need to work interactively? `interactive()` launches the agent in TUI mode inside the sandbox.

Need more control? `createSandbox()` gives you a long-lived sandbox for multi-step workflows. `createWorktree()` creates an independent git worktree separate from any sandbox.

Three branch strategies give you flexibility:

- **`head`** - agent writes directly to the working directory
- **`branch`** - commits land on a named branch, survives re-runs
- **`merge-to-head`** - agent works on a temp branch, changes merged back automatically

## Provider Abstraction

Different agents, different CLIs, different session formats; Sandcastle normalises all of them behind a single interface and handles all of this so your orchestration code doesn't have to. You can swap from Claude Code to Codex by changing one string:

```ts
const result = await run({
  agent: "codex", // was "claude"
  sandbox: "podman", // was "docker"
  prompt: "Fix the failing tests",
});
```

The same goes for sandboxes. Docker for local development, Vercel Firecracker for production isolation, Daytona for remote environments. Your orchestration script stays the same.

## Multi-Agent Workflows

One agent is useful. Several agents working in parallel is where things get interesting.

Sandcastle ships with 5 scaffold templates that demonstrate multi-agent patterns. The most powerful is `parallel-planner`:

1. An **orchestrator agent** analyses the work and splits it into tasks
2. **Parallel agents** each pick a task and work on separate git branches
3. A **reviewer agent** checks each branch
4. A **merger agent** brings everything together

This isn't theoretical. Sandcastle uses this exact pattern - its own `.sandcastle/run.ts` orchestrates parallel agents to develop Sandcastle itself in CI.

## Conclusion

AI coding agents are incredibly capable, but they've been stuck in a chat-first paradigm. Sandcastle treats them as programmable units - you compose them, parallelise them, and run them AFK.

It's the most comprehensive open-source take on agent orchestration I've seen. `sandcastle run` is all you need to get started.
