import type { JobTracker } from "@features/crt/jobs";
import type { CrtReply, CrtRequest, RenderSize } from "@features/crt/protocol";
import type { Transport } from "@features/crt/transport";
import type { RefObject } from "react";

import { createJobTracker } from "@features/crt/jobs";
import { replyKind, replyOutcome } from "@features/crt/protocol";
import { displaySize, exportSize } from "@features/crt/render";
import { createTransport } from "@features/crt/transport";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const RESIZE_DELAY = 150;
const MAX_DENSITY = 2;

type SourceSize = { width: number; height: number };

type LoadedSource = SourceSize & { job: number };

export function baseName(name: string): string {
  return name.replace(/\.[^.]+$/, "") || "image";
}

function density(): number {
  return Math.min(window.devicePixelRatio || 1, MAX_DENSITY);
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function availableSpace(canvas: HTMLCanvasElement) {
  const frame = canvas.closest("[data-slot=crt]");
  const canvasBox = canvas.getBoundingClientRect();
  const below = frame ? frame.getBoundingClientRect().bottom - canvasBox.bottom : 0;
  return {
    width: canvas.parentElement?.clientWidth ?? canvasBox.width,
    height: window.innerHeight - (canvasBox.top + window.scrollY) - below,
  };
}

function preventDrop(event: DragEvent) {
  event.preventDefault();
}

function useResizeTick() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setTick((value) => value + 1), RESIZE_DELAY);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("dragover", preventDrop);
    window.addEventListener("drop", preventDrop);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("dragover", preventDrop);
      window.removeEventListener("drop", preventDrop);
    };
  }, []);
  return tick;
}

function useJobs() {
  const counter = useRef(0);
  const [tracker] = useState(createJobTracker);
  const next = useCallback(
    (kind: "screen" | "export" | "reset") => {
      counter.current += 1;
      if (kind === "reset") tracker.reset(counter.current);
      else tracker.begin(kind, counter.current);
      return counter.current;
    },
    [tracker],
  );
  return { next, tracker };
}

type ReplyHandlers = {
  setSource: (source: LoadedSource) => void;
  settleRender: () => void;
  setSaving: (saving: boolean) => void;
  fileName: () => string;
};

function applyReply(reply: CrtReply, handlers: ReplyHandlers) {
  const outcome = replyOutcome(reply);
  if (outcome.source) handlers.setSource({ ...outcome.source, job: reply.job });
  if (outcome.rendering === false) handlers.settleRender();
  if (outcome.saving === false) handlers.setSaving(false);
  if (outcome.blob) downloadBlob(outcome.blob, `${handlers.fileName()}-crt.png`);
}

function useTransport(tracker: JobTracker, handlers: ReplyHandlers) {
  const transportRef = useRef<Transport | null>(null);
  useEffect(() => {
    const transport = createTransport();
    transport.listen((reply) => {
      if (tracker.isCurrent(replyKind(reply), reply.job)) applyReply(reply, handlers);
    });
    transportRef.current = transport;
    return () => {
      transport.dispose();
      transportRef.current = null;
    };
  }, [tracker, handlers]);
  return transportRef;
}

function fitCanvas(canvas: HTMLCanvasElement, source: SourceSize): RenderSize {
  const display = displaySize(source.width, source.height, availableSpace(canvas));
  const unit = density();
  canvas.style.width = `${display.width}px`;
  canvas.style.height = `${display.height}px`;
  return {
    width: Math.round(display.width * unit),
    height: Math.round(display.height * unit),
    unit,
  };
}

function useRenderStatus(source: LoadedSource | null, tick: number) {
  const requestedKeyRef = useRef<string | null>(null);
  const [renderedKey, setRenderedKey] = useState<string | null>(null);
  const renderKey = source ? `${source.job}:${tick}` : null;
  const settle = useCallback(() => setRenderedKey(requestedKeyRef.current), []);
  return {
    renderKey,
    requestedKeyRef,
    settle,
    rendering: renderKey !== null && renderKey !== renderedKey,
  };
}

type ScreenSync = {
  source: LoadedSource | null;
  renderKey: string | null;
  requestedKeyRef: RefObject<string | null>;
  next: (kind: "screen") => number;
  transportRef: RefObject<Transport | null>;
};

function useScreenSync({ source, renderKey, requestedKeyRef, next, transportRef }: ScreenSync) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const attachedRef = useRef<HTMLCanvasElement | null>(null);
  const displayWidthRef = useRef(1);
  useEffect(() => {
    const canvas = canvasRef.current;
    const transport = transportRef.current;
    if (!source || !canvas || !transport) return;
    if (attachedRef.current !== canvas) transport.attach(canvas);
    attachedRef.current = canvas;
    const size = fitCanvas(canvas, source);
    displayWidthRef.current = size.width / size.unit;
    requestedKeyRef.current = renderKey;
    transport.send({ type: "render", job: next("screen"), size });
  }, [source, renderKey, requestedKeyRef, next, transportRef]);
  return { canvasRef, displayWidthRef };
}

export function useCrt() {
  const fileNameRef = useRef("image");
  const [source, setSource] = useState<LoadedSource | null>(null);
  const [saving, setSaving] = useState(false);
  const tick = useResizeTick();
  const { next, tracker } = useJobs();
  const { renderKey, requestedKeyRef, settle, rendering } = useRenderStatus(source, tick);
  const handlers = useMemo<ReplyHandlers>(
    () => ({ setSource, settleRender: settle, setSaving, fileName: () => fileNameRef.current }),
    [settle],
  );
  const transportRef = useTransport(tracker, handlers);
  const { canvasRef, displayWidthRef } = useScreenSync({
    source,
    renderKey,
    requestedKeyRef,
    next,
    transportRef,
  });

  const send = useCallback(
    (request: CrtRequest) => transportRef.current?.send(request),
    [transportRef],
  );

  const load = useCallback(
    (file: File) => {
      fileNameRef.current = baseName(file.name);
      send({ type: "load", job: next("reset"), file });
    },
    [next, send],
  );

  const clear = useCallback(() => {
    send({ type: "clear", job: next("reset") });
    setSource(null);
    setSaving(false);
  }, [next, send]);

  const save = useCallback(() => {
    if (!source) return;
    const size = exportSize(source.width, source.height);
    setSaving(true);
    send({
      type: "export",
      job: next("export"),
      size: { ...size, unit: size.width / displayWidthRef.current },
    });
  }, [source, next, send, displayWidthRef]);

  return { canvasRef, loaded: source !== null, load, clear, save, saving, rendering };
}
