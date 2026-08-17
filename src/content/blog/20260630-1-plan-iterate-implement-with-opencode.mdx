---
title: "Plan, iterate, then implement with OpenCode"
slug: "20260630-1-plan-iterate-implement-with-opencode"
pubDate: 2026-06-30
description: "A three-phase loop that gets better code out of AI coding agents."
author: "Matt F"
tags: ["ai", "tools", "open-source", "programming"]
---

The default way to use an AI coding agent is to type a prompt and watch it write code. It's fast, but it's not perfect. Sometimes the code is clean and fits your codebase. Sometimes it's a tangle of wrong abstractions that takes longer to undo than to rewrite.

OpenCode has a better way with its two modes: Plan and Build. Switching between them gives you a three-phase loop that catches bad decisions before they become bad code.

## The two modes

Hit Tab. That's it. You toggle between Plan mode and Build mode with a single key. A small indicator in the corner shows which mode you're in.

Plan mode is read-only. The agent can read files, search the codebase, and propose an approach.

\*It cannot write a single line.

Build mode is the agent's default. It reads, writes, runs commands - the full toolbox.

The loop is: plan in one mode, implement in the other.

\*_Sometimes when you aren't looking, the agent will try to obey a suggestion as an imperative. I have seen it try to invoke a python script to concat to a file as a form of editing, even though it was in plan mode._

## Phase 1: Plan

You describe the outcome you want. No implementation details.

> When a user deletes a note, flag it as soft-deleted in the database. Then create a screen that lists recently deleted notes, with options to restore or permanently delete each one.

OpenCode responds with a concrete plan: which files change, what the migration looks like, which components get created, how state flows. It surfaces questions it cannot answer from the codebase alone.

It asks. You answer. This back-and-forth happens before any code is written.

## Phase 2: Iterate

The first plan is rarely the right one. You push back.

> I don't want a separate deleted_notes table. Add a deleted_at nullable timestamp to the existing notes table. Follow the pagination pattern from @components/ArchiveList.tsx.

You can use `@` to fuzzy-search for files and point the agent at existing patterns it should match.

Each round of feedback tightens the plan. You iterate until the approach is something you would approve in a code review.

## Phase 3: Implement

Hit Tab to switch to Build mode.

> Looks good. Go ahead.

The agent works through the plan sequentially. Migration first, then the backend, then the frontend, then tests. You watch each change land and commit as you go.

If a step goes sideways, `/undo` that change, refine the ambiguous part of the plan, and resume. You keep the context and the parts that worked. No need to start over.

## Why this works

LLMs are eager. Without a plan phase they will jump to implementation, picking patterns that might not match your conventions or missing cross-cutting concerns.

Plan mode forces the agent to think before it writes. The iteration phase catches mistakes while they are still cheap - during the conversation rather than in code. By the time you switch to Build mode, the agent has a contract to execute against. When it makes a wrong turn, you both know what right looks like.

## A real example

```
[Tab → Plan mode]

> We need to add rate limiting to all routes in @packages/api.
> Use the middleware pattern from @packages/api/src/middleware/cache.ts.
> Default to 100 requests per minute per IP, configurable per-route.

OpenCode: Here's my proposed plan...
          [details, questions about status codes and auth]

> Return 429. Authenticated users get 1000/hr, anonymous 100/hr.
> Store in Redis — client at @packages/api/src/lib/redis.ts.

OpenCode: Updated — using Redis sliding window. Ready when you are.

[Tab → Build mode]

> Ship it.
```

Four minutes of conversation, then the agent implements to spec.

## A few things that help

Use `@` references liberally. Every file reference anchors the agent to real code. The more context you give, the less it hallucinates.

Run `/init` on new projects. It generates an `AGENTS.md` that captures your conventions. Commit it. The agent reads it automatically.

Use `/share` to send the plan to a teammate for a sanity check before implementing. Lighter than a design doc, more concrete than a Slack thread.

Treat the agent like a junior developer. Specificity is kindness. "Implement JWT refresh rotation" is vague. "When the access token expires, use the refresh token to get a new pair, rotating the refresh token each time. The existing handling is in @lib/auth.ts" is actionable.

## Check it out

OpenCode is open source with 160K+ stars on GitHub. It runs in the terminal, desktop, or IDE, supports any LLM provider, and works with free-tier models. The Plan mode costs one keystroke and saves you from cleaning up after an over-eager agent.

[github.com/anomalyco/opencode](https://github.com/anomalyco/opencode)
