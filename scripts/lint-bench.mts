import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  formatHelp,
  parseArgs,
  parseNumericFlag,
  printHelpAndExit,
  readValue,
  readValues,
} from "@/scripts/argv.mts";

type Options = {
  runs: number;
  files: string[];
  timings: boolean;
  top: number;
};

type Run = {
  ms: number;
  code: number;
  output: string;
};

const root = fileURLToPath(new URL("../", import.meta.url));
const vp = fileURLToPath(new URL("../node_modules/vite-plus/bin/vp", import.meta.url));

const OPTIONS = [
  { name: "--runs", placeholder: "<n>", description: "Runs per mode (default 5)" },
  {
    name: "--file",
    placeholder: "<path>",
    description: "Lint one path instead of the whole repo (repeatable)",
  },
  {
    name: "--timings",
    description: "Add one run with per-rule timings (implies --format=default)",
  },
  {
    name: "--top",
    placeholder: "<n>",
    description: "Rows to show from the timings table (default 15)",
  },
];

const HELP = formatHelp(
  "node --import ./scripts/alias-loader.mjs scripts/lint-bench.mts [--runs=<n>] [--file=<path>]... [--timings] [--top=<n>]",
  OPTIONS,
);

function parseOptions(argv: string[]): Options {
  if (argv.includes("--help")) printHelpAndExit(HELP);

  const args = parseArgs(argv, OPTIONS, HELP);

  return {
    runs: parseNumericFlag(readValue(args, "--runs"), "--runs", {
      fallback: 5,
      minimum: 1,
      whole: true,
    }),
    files: readValues(args, "--file"),
    timings: args.flags.has("--timings"),
    top: parseNumericFlag(readValue(args, "--top"), "--top", {
      fallback: 15,
      minimum: 1,
      whole: true,
    }),
  };
}

function runLint(args: string[]): Promise<Run> {
  return new Promise<Run>((resolve, reject) => {
    const started = performance.now();
    const child = spawn(process.execPath, [vp, "lint", ...args], { cwd: root });
    let output = "";

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => (output += chunk));
    child.stderr.on("data", (chunk: string) => (output += chunk));
    child.once("error", reject);
    child.once("close", (code) =>
      resolve({ ms: performance.now() - started, code: code ?? 1, output }),
    );
  });
}

export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) return sorted[middle] ?? 0;

  return ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
}

function report(label: string, runs: Run[]): boolean {
  const times = runs.map((run) => Math.round(run.ms));
  const failed = runs.map((run, index) => (run.code === 0 ? undefined : index + 1)).filter(Boolean);

  console.log(`vp lint (${label})  ${runs.length} runs`);
  console.log(
    `  min ${Math.min(...times)} ms  median ${Math.round(median(times))} ms  max ${Math.max(...times)} ms`,
  );
  if (failed.length > 0)
    console.log(`  non-zero exit on run${failed.length > 1 ? "s" : ""} ${failed.join(", ")}`);

  return failed.length === 0;
}

export function formatTimings(output: string, top: number): string | undefined {
  const lines = output.split("\n");
  const start = lines.findIndex((line) => line === "Rule timings:");
  if (start === -1) return undefined;

  const rows: string[] = [];
  let index = start + 3;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (line.trim() === "" || line.startsWith("JS plugin runtime:")) break;

    rows.push(line);
    index += 1;
  }

  const table = [...lines.slice(start, start + 3), ...rows.slice(0, top)];
  if (rows.length > top) table.push(`  ... ${rows.length - top} more rows`);

  const runtime = lines.findIndex((line) => line.startsWith("JS plugin runtime:"));
  if (runtime !== -1) table.push("", ...lines.slice(runtime).filter((line) => line.trim() !== ""));

  return table.join("\n");
}

function filesLabel(files: string[]): string {
  return files.length === 0 ? "whole repo" : files.join(" ");
}

async function collectRuns(count: number, files: string[]): Promise<Run[]> {
  const runs: Run[] = [];

  for (let index = 0; index < count; index += 1) runs.push(await runLint(files));

  return runs;
}

function reportTimings(run: Run, top: number): void {
  const table = formatTimings(run.output, top);

  if (table === undefined)
    throw new Error(`vp lint printed no timings table\n\n${run.output}\n\n${HELP}`);

  console.log(table);
}

async function timingsPassed(options: Options): Promise<boolean> {
  if (!options.timings) return true;

  const run = await runLint(["--format=default", "--debug=timings", ...options.files]);

  console.log("");
  console.log(`per-rule timings (one run, ${Math.round(run.ms)} ms; collection adds overhead)`);
  reportTimings(run, options.top);

  return run.code === 0;
}

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));
  const runs = await collectRuns(options.runs, options.files);
  const clean = report(filesLabel(options.files), runs);

  if (!clean || !(await timingsPassed(options))) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
