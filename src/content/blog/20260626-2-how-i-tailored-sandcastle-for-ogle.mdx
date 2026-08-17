---
title: "How I Tailored Sandcastle for Ogle"
slug: "20260626-2-how-i-tailored-sandcastle-for-ogle"
pubDate: 2026-06-26
description: "Taking Sandcastle's parallel-planner-with-review template and tailoring it to a Go project's specific needs - custom Docker image, phase-specific models, Go-specific prompts, and the scrivener documentation audit."
author: "Matt F"
tags: ["ai", "tools", "open-source", "programming"]
---

In my last post I introduced Sandcastle, the agent orchestration library from Matt Pocock. Today I want to show how I actually use it on a real project called Ogle, a Docker Compose TUI written in Go.

Sandcastle ships with scaffold templates. The `parallel-planner-with-review` template provides a powerful workflow out of the box - for a Typescript project. Tailoring prompts, infrastructure, and models to a Go project - is where my time went.

## The Pipeline

Ogle's Sandcastle workflow runs a 3-phase loop, up to 10 iterations, so newly unblocked issues get picked up after each round of merges:

1. **Plan** - A pro model (`deepseek-v4-pro`) reads open issues tagged `Sandcastle`, builds a dependency graph, and outputs a `<plan>` JSON listing unblocked issues with branch names in `sandcastle/issue-{id}-{slug}` format.
2. **Execute + Scrivener + Review** - Each issue gets a dedicated sandbox on its own branch. The implementer runs first (flash model, up to 100 iterations). If it produces commits, a scrivener agent audits documentation, then a reviewer refines the code. All issue pipelines run concurrently via `Promise.allSettled` - one failure doesn't cancel the others.
3. **Merge** - A single agent merges all completed branches into the base branch, resolves conflicts, runs tests, and closes issues via `gh`.

Edge cases handled: if an implementer makes no changes (already completed), the branch is skipped and the issue closed. If the scrivener fails (network issue, `gh` auth), the review still runs - it's non-fatal.

## Infrastructure

Sandcastle's Docker sandbox is the default provider. Ogle needed more inside the container: Go 1.26.3, the GitHub CLI, and the OpenCode CLI. The Dockerfile adds all of those plus UID/GID alignment so bind-mounted files share ownership with the host user.

```dockerfile
FROM node:22-bookworm

RUN apt-get update && apt-get install -y git curl jq ca-certificates

RUN curl -fsSL https://cli.github.com/packages/... \
  && apt-get install -y gh

ARG AGENT_UID=1000 ARG AGENT_GID=1000
RUN groupmod -g $AGENT_GID node && usermod -u $AGENT_UID -g $AGENT_GID -d /home/agent -m -l agent node

RUN curl -fsSL https://go.dev/dl/go1.26.3.linux-amd64.tar.gz | tar -C /usr/local -xz
RUN npm install -g opencode-ai@latest

USER ${AGENT_UID}:${AGENT_GID}
ENV GOPATH="/home/agent/go" \
    PATH="/usr/local/go/bin:/home/agent/go/bin:/home/agent/.local/bin:$PATH"
WORKDIR /home/agent
ENTRYPOINT ["sleep", "infinity"]
```

Sandcastle hooks run before the agent starts inside the sandbox. Ogle's hooks install dependencies and regenerate mocks:

```ts
const hooks = {
  sandbox: {
    onSandboxReady: [{ command: "npm install && go mod tidy && make generate" }],
  },
};
```

The `copyToWorktree` option avoids a full `npm install` from scratch each time - it copies `node_modules` from the host into the worktree before the sandbox starts, and the hook handles platform-specific binaries.

## Phase-Specific Models

Not one model to rule them all. Each phase uses a different OpenCode model:

| Phase       | Model               | Rationale                                                            |
| ----------- | ------------------- | -------------------------------------------------------------------- |
| Planner     | `deepseek-v4-pro`   | Deeper reasoning for dependency analysis                             |
| Implementer | `deepseek-v4-flash` | Faster iterations, `OPENCODE_PERMISSION=allow` for autonomous writes |
| Reviewer    | `mimo-v2.5-pro`     | Quality judgment for code review                                     |
| Merger      | `deepseek-v4-flash` | Simple merge operations, doesn't need the pro model                  |

The implementer is configured with `OPENCODE_PERMISSION=allow` so it can write files without asking permission each time.

## Prompt Design

Prompt quality matters more than orchestration plumbing. Here's how each phase's prompt is structured.

**Plan prompt** uses a `!` shell expression to pull open issues directly:

```
<issues-json>
!`gh issue list --state open --label Sandcastle --json number,title,body,labels,comments`
</issues-json>
```

The agent analyzes blocking dependencies between issues and outputs a `<plan>` JSON block. Only unblocked issues are included.

**Implement prompt** drives the RGR cycle with Go-specific conventions baked in:

- RED: write one test (black-box, table-driven, `t.Parallel()`)
- GREEN: write the implementation
- REFACTOR: clean up
- `make lint && make test` before every commit
- Commit messages end with `[RALPH]` so human-authored and agent-authored commits are distinguishable

**Review prompt** loads `@.sandcastle/CODING_STANDARDS.md` which encodes Ogle's Go conventions: import order, error wrapping (`fmt.Errorf("…: %w", err)`), no package-level globals except in `cmd/root.go`, `log/slog` instead of `log`, and mockery-generated mocks.

**Merge prompt** merges each completed branch in sequence, resolves conflicts intelligently, runs `make lint && make test` after each merge, and closes the corresponding GitHub issue via `gh issue close`.

## The Scrivener Phase

This is the non-standard addition. After an implementer finishes but before the review, Ogle runs a scrivener agent that audits project documentation against the code changes on that branch.

It follows the scrivener skill methodology - 7 audit categories: STALE, GAP, CONFLICT, AMBIGUOUS, STRUCTURAL, POLISH, UNWIELDY. If it finds discrepancies, it either appends a report to an existing documentation issue or creates a new one tagged `scrivener-discovered`.

The skip logic prevents circularity: if the current issue was _itself_ created by a previous scrivener run, the scrivener phase is skipped entirely. No one wants an infinite loop of "documentation audit found a docs issue → create the issue → next iteration audits that issue too."

## Conclusion

Sandcastle's `parallel-planner-with-review` template gave me a solid foundation. The real work was tailoring it to Ogle's specific needs: a custom Docker image with Go tooling, phase-specific model selection, detailed prompts encoding Go conventions, and the scrivener documentation audit phase.

Hundreds of execution logs, tens of branches, and countless `[RALPH]` commits later, the pipeline runs entirely AFK - set it up, walk away, come back to merged, reviewed, documented changes. Documentation being a particularly bothersome issue that I no longer need to worry about.

The templates give you the skeleton. The prompts, the models, and the infrastructure decisions are what make it work for your project.

### The data

I introduced sandcastle to the project with commit `f398f5e` and v0.3.0 is the current release of ogle.

| Category                    | Commits |
| --------------------------- | ------- |
| Sandcastle (marked [RALPH]) | 107     |
| Merge                       | 67      |
| Human                       | 82      |

I find this acceptable. Given I can implement many bitesize github issues in parallel, fixing a few misimplemented issues myself is still an increase in productivity. Having used GPT 5.4 as well as Sonnet 4.6 and Opus 4.6 - Deepseek v4 Flash is a sufficient model that costs pennies for features. But with a stronger model like GPT or Sonnet, I have no doubt the code quality issues would be reduced further. Overall, this is a great method to increase output without sacrificing code quality.
