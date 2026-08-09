---
title: "Relentless interviews for your plans, with the grill-me skill"
slug: "20260716-1-grill-me-skill"
pubDate: 2026-07-16
description: "Stress-test your plans and designs before writing code, with a Socratic agent that grills you one question at a time."
author: "Matt F"
tags: ["ai", "tools", "programming"]
---

Every plan looks solid on paper. It's only when you start building that the hidden assumptions surface - the ambiguous edge case, the dependency you didn't know existed, the decision you deferred that now blocks everything.

[`mattpocock/skills`](https://github.com/mattpocock/skills) is a collection of engineering productivity skills for AI coding agents. The `grill-me` skill is designed to surface those holes _before_ you write code.

## What it is

`grill-me` runs a "relentless interview" on your plan or design. You describe what you want to build, and the agent walks down every branch of your decision tree, one question at a time.

It's a thin wrapper that delegates to the `grilling` skill, whose prompt instructs the agent to:

> Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

## The rules

Three constraints keep the grilling productive:

**One question at a time.** Asking multiple questions at once is bewildering. The agent asks one, waits for your answer, then proceeds. This forces real consideration of each tradeoff instead of skimming past a list.

**Look up facts, don't ask.** If the answer lives in the codebase, the agent finds it rather than asking you. What middleware exists, what patterns are already established, what config values are in use - the agent reads the code so you don't have to explain context it can discover.

**Decisions are yours.** The agent provides a recommended answer for each question, but you make the call. You stay in control of the design.

## Why one question at a time

A human reviewer can list ten concerns in a single message. An LLM can vomit up thirty questions in one prompt. Neither is useful with the normal impulse being to answer superficially and move on.

`grilling` is deliberately capped at one question. The result is a gradually enriched context window.

## The family: grill-with-docs

If you want artifacts alongside the interrogation, there's `grill-with-docs`. It runs the same session but also writes ADRs capturing each decision and a glossary of domain terms that emerged during the conversation.

Use `grill-me` for a quick sanity check. Use `grill-with-docs` when you need a written record - handoff, onboarding, or audit trail.

## When to use it

- **Architecture decisions** - The agent forces you to articulate tradeoffs before choosing.
- **API design** - Every endpoint, status code, and auth boundary gets examined.
- **Refactoring plans** - "What depends on this?" is answered by the codebase; "what's the migration strategy?" is answered by you.
- **Cross-team handoffs** - Run a grilling session, then share the output as a spec.

The key insight: you want to make mistakes when they're cheap. A wrong turn in a conversation costs five minutes. A wrong turn in code costs a rewrite.

## The result

But once you have sufficiently grilled the question and have your enriched context window, what then? You can turn it into a specification by using the `to-spec` skills from the same skills repository.

This transforms the long conversation into an actionable set of tasks that you - or an agent - can work on, safe in the knowledge you have done your best to identify edge cases.

## Try it

Load `grill-me` into any agent platform that supports skill loading (OpenCode, Claude Code, etc.) and say "grill me on [your plan]". The agent will start interviewing you.

[github.com/mattpocock/skills](https://github.com/mattpocock/skills)
