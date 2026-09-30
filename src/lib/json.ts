import * as v from "valibot";

export async function readJson<TSchema extends v.GenericSchema>(
  schema: TSchema,
  request: Request,
): Promise<v.InferOutput<TSchema> | null> {
  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    return null;
  }

  const result = v.safeParse(schema, raw);
  return result.success ? result.output : null;
}
