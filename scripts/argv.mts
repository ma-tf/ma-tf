export type Option = { name: string; placeholder?: string; description: string };

export type ParsedArgs = {
  flags: ReadonlySet<string>;
  values: ReadonlyMap<string, string[]>;
  positionals: string[];
};

export function formatHelp(usage: string, options: readonly Option[]): string {
  const lines = options.map((option) => {
    const label = option.placeholder ? `${option.name}=${option.placeholder}` : option.name;

    return `  ${label.padEnd(30)} ${option.description}`;
  });

  return [
    `Usage: ${usage}`,
    "",
    "Options:",
    ...lines,
    `  ${"--help".padEnd(30)} Print this message`,
  ].join("\n");
}

export function parseArgs(
  argv: readonly string[],
  options: readonly Option[],
  help: string,
): ParsedArgs {
  const known = new Map(options.map((option) => [option.name, option]));
  const flags = new Set<string>();
  const values = new Map<string, string[]>(options.map((option) => [option.name, []]));
  const positionals: string[] = [];

  for (const arg of argv) {
    if (!arg.startsWith("--")) {
      positionals.push(arg);
      continue;
    }

    const pivot = arg.indexOf("=");
    const name = pivot === -1 ? arg : arg.slice(0, pivot);
    const option = known.get(name);

    if (!option) throw new Error(`Unknown option ${arg}\n\n${help}`);

    if (option.placeholder) {
      const prefix = `${name}=`;

      if (!arg.startsWith(prefix)) throw new Error(`${name} needs a value\n\n${help}`);

      values.get(name)?.push(arg.slice(prefix.length));
    } else if (arg.includes("=")) {
      throw new Error(`${name} takes no value\n\n${help}`);
    } else {
      flags.add(name);
    }
  }

  return { flags, values, positionals };
}

export function readValue(args: ParsedArgs, name: string): string | undefined {
  return args.values.get(name)?.[0];
}

export function readValues(args: ParsedArgs, name: string): string[] {
  return args.values.get(name) ?? [];
}

export function parseNumericFlag(
  value: string | undefined,
  flag: string,
  rule: { fallback: number; minimum: number; whole?: boolean },
): number {
  if (value === undefined) return rule.fallback;

  const parsed = Number(value);

  if (
    !Number.isFinite(parsed) ||
    parsed < rule.minimum ||
    (rule.whole && !Number.isInteger(parsed))
  )
    throw new Error(
      `${flag} needs ${rule.whole ? "a positive whole number" : "a non-negative number"}`,
    );

  return parsed;
}

export function printHelpAndExit(help: string): never {
  console.log(help);
  process.exit(0);
}
