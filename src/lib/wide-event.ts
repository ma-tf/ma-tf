import { AsyncLocalStorage } from "node:async_hooks";

export type LogFields = Record<string, unknown>;

export type WideEvent = {
  timestamp: string;
  service: string;
  environment: string;
  request_id: string;
  method: string;
  path: string;
  duration_ms?: number;
  status_code?: number;
  outcome?: string;
  error?: LogFields;
} & LogFields;

const storage = new AsyncLocalStorage<WideEvent>();
const starts = new WeakMap<WideEvent, number>();
const deferred = new WeakSet<WideEvent>();

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;

  const prototype = Object.getPrototypeOf(value) as unknown;

  return prototype === Object.prototype || prototype === null;
}

function mergeInto(target: LogFields, source: LogFields): void {
  for (const [key, value] of Object.entries(source)) {
    const existing = target[key];

    if (isPlainObject(existing) && isPlainObject(value)) {
      mergeInto(existing, value);
    } else {
      target[key] = value;
    }
  }
}

function safeString(value: unknown): string {
  try {
    return String(value);
  } catch {
    return "Unserialisable error";
  }
}

function serializeError(error: unknown): LogFields {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }

  if (typeof error === "string") {
    return { message: error };
  }

  if (isPlainObject(error)) {
    const fields: LogFields = {};

    if (typeof error.message === "string") fields.message = error.message;
    if (typeof error.name === "string") fields.name = error.name;

    if (Object.keys(fields).length > 0) return fields;
  }

  return { message: safeString(error) };
}

export function beginRequest(request: Request, route: { path: string; method: string }): WideEvent {
  const event: WideEvent = {
    timestamp: new Date().toISOString(),
    service: "m4t.tf",
    environment: process.env.CONTEXT ?? "development",
    request_id:
      request.headers.get("x-nf-request-id") ??
      request.headers.get("cf-ray") ??
      crypto.randomUUID(),
    method: route.method,
    path: route.path,
  };

  if (process.env.DEPLOY_ID) event.deploy_id = process.env.DEPLOY_ID;
  if (process.env.COMMIT_REF) event.commit_ref = process.env.COMMIT_REF;

  starts.set(event, Date.now());

  return event;
}

export function runWith<T>(event: WideEvent, work: () => T): T {
  return storage.run(event, work);
}

export function current(): WideEvent | undefined {
  return storage.getStore();
}

export function enrich(fields: LogFields, event: WideEvent | undefined = current()): void {
  if (!event) return;

  mergeInto(event, fields);
}

export function captureError(
  error: unknown,
  context: LogFields = {},
  event: WideEvent | undefined = current(),
): void {
  if (!event) return;

  try {
    event.error = { ...context, ...serializeError(error) };
  } catch {
    event.error = { message: "Unserialisable error" };
  }
}

export function deferEmission(): void {
  const event = current();
  if (!event) return;

  deferred.add(event);
}

export function isDeferred(event: WideEvent): boolean {
  return deferred.has(event);
}

export function finish(
  event: WideEvent,
  result: { status_code: number; outcome?: string },
): WideEvent {
  event.status_code = result.status_code;
  if (result.outcome !== undefined) event.outcome = result.outcome;

  const started = starts.get(event);
  if (started !== undefined) event.duration_ms = Date.now() - started;

  return event;
}
