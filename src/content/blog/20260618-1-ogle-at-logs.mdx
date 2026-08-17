---
title: "Ogle at logs"
slug: "20260618-1-ogle-at-logs"
pubDate: 2026-06-18
description: "A terminal dashboard for Docker Compose projects."
author: "Matt F"
tags: ["docker", "golang", "programming", "projects", "tools", "tui"]
---

If you work with Docker Compose regularly, you know the dance. One terminal running `docker compose ps` to check if things are alive. Another tailing logs. A third for the occasional restart when something inevitably misbehaves. Multiply that across a few projects and you spend more time managing terminals than actually developing.

I built ogle to fix that.

## What it does

Ogle is a terminal user interface for Docker Compose. Point it at a directory with a `compose.yaml` and you get a full-screen dashboard: live log streams, service states with colour coding, and controls to stop, start, restart, or rebuild any service.

```sh
ogle                    # auto-discovers compose files in cwd
ogle -f path/to/compose.yaml  # explicit path
```

No config files or setup steps. It scans for known compose filenames, parses the file, and shows you what it finds. If there are multiple valid compose files, you get a picker. If there are none, it watches the directory until one appears.

## Under the hood

Ogle is written in Go using the Charm stack, Bubble Tea for the UI framework, Lipgloss for styling, and Bubbles for reusable components like viewports and accordions. Logs stream directly from the Docker Engine API over the Unix socket, so there's no dependency on the `docker` CLI for log tailing. Service actions (stop, start, restart, rebuild) do shell out to `docker compose` since that's the canonical way to run those operations.

It handles the messy bits too. If Docker becomes unreachable, ogle retries automatically with a grace period rather than crashing. If the compose file gets deleted while you're looking at it, it enters a watching state and picks things back up when the file returns. Log streams use exponential backoff on errors and stop gracefully when a container disappears.

## Theming

Eight built-in themes out of the box, solarized, catppuccin variants, light and dark defaults. You can also drop a YAML file in `~/.ogle/themes/` to customise over 40 colour properties. It persists your settings to `~/.ogle/config.yaml` so they survive restarts.

## Check it out

Ogle is open source under AGPL-3.0. The source is on GitHub at [ma-tf/ogle](https://github.com/ma-tf/ogle), with pre-built binaries for Linux, macOS, and Windows via GoReleaser. If you install from source, it's just:

```sh
go install github.com/ma-tf/ogle@latest
```

If you live in `docker compose` all day, give it a try. It won't replace your editor, but it might save you a few terminal tabs.
