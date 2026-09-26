#!/bin/sh
# Launch the Oxfmt LSP through Vite+ so the editor and `vp fmt` share one
# binary and one config (vite.config.ts). Referenced by .vscode/settings.json.
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd) || exit 1
cd "$root" || exit 1
exec "$root/node_modules/.bin/vp" fmt "$@"
