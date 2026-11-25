import type { TriadGl } from "@features/crt/gl";
import type { JobKind } from "@features/crt/jobs";
import type { CrtReply, CrtRequest, RenderSize } from "@features/crt/protocol";
import type { Density, RenderInput } from "@features/crt/render";
import type { CreateSurface, Surface } from "@features/crt/surface";

import { createJobTracker } from "@features/crt/jobs";
import { DEFAULT_DENSITY, renderCrt } from "@features/crt/render";
import { surfaceToBlob } from "@features/crt/surface";

export type RendererDeps = {
  post: (reply: CrtReply) => void;
  createSurface: CreateSurface;
  decode: (file: Blob) => Promise<ImageBitmap>;
  grain: () => Promise<ImageBitmap | undefined>;
  render?: (target: Surface, input: RenderInput) => Promise<boolean>;
  toBlob?: (surface: Surface) => Promise<Blob | null>;
  createGl?: () => TriadGl | null;
  density?: Density;
};

function failure(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function createRenderer(deps: RendererDeps) {
  const jobs = createJobTracker();
  const render = deps.render ?? renderCrt;
  const toBlob = deps.toBlob ?? surfaceToBlob;
  const grain = deps.grain();
  let canvas: Surface | undefined;
  let gl: TriadGl | null | undefined;
  const glFor = () => {
    gl ??= deps.createGl?.() ?? null;
    return gl;
  };
  let source: ImageBitmap | undefined;

  const draw = async (kind: JobKind, job: number, size: RenderSize, target: Surface) => {
    const current = source;
    if (!current) return false;
    const input = {
      source: current,
      grain: await grain,
      ...size,
      density: deps.density ?? DEFAULT_DENSITY,
      createSurface: deps.createSurface,
      gl: glFor(),
      isStale: () => !jobs.isCurrent(kind, job),
    };
    return !input.isStale() && (await render(target, input)) && !input.isStale();
  };

  const load = async (job: number, file: Blob) => {
    jobs.reset(job);
    const decoded = await deps.decode(file);
    if (!jobs.isCurrent("screen", job)) return decoded.close();
    source?.close();
    source = decoded;
    deps.post({ type: "loaded", job, width: decoded.width, height: decoded.height });
  };

  const renderScreen = async (job: number, size: RenderSize) => {
    jobs.begin("screen", job);
    if (canvas && (await draw("screen", job, size, canvas))) deps.post({ type: "rendered", job });
  };

  const renderExport = async (job: number, size: RenderSize) => {
    jobs.begin("export", job);
    const target = deps.createSurface(size.width, size.height);
    if (!(await draw("export", job, size, target))) return;
    const blob = await toBlob(target);
    if (blob && jobs.isCurrent("export", job)) deps.post({ type: "exported", job, blob });
  };

  const clear = (job: number) => {
    jobs.reset(job);
    source?.close();
    source = undefined;
  };

  const run = async (kind: JobKind, job: number, task: () => Promise<void> | void) => {
    try {
      await task();
    } catch (error) {
      if (jobs.isCurrent(kind, job))
        deps.post({ type: "failed", job, kind, message: failure(error) });
    }
  };

  return (request: CrtRequest): Promise<void> => {
    switch (request.type) {
      case "attach":
        canvas = request.canvas;
        return Promise.resolve();
      case "load":
        return run("screen", request.job, () => load(request.job, request.file));
      case "render":
        return run("screen", request.job, () => renderScreen(request.job, request.size));
      case "export":
        return run("export", request.job, () => renderExport(request.job, request.size));
      case "clear":
        return run("screen", request.job, () => clear(request.job));
    }
  };
}
