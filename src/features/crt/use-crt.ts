import { displaySize, exportSize, renderCrt } from "@features/crt/render";
import { GRAIN_SRC } from "@features/crt/triads";
import { useCallback, useEffect, useRef, useState } from "react";

const RESIZE_DELAY = 150;
const MAX_DENSITY = 2;

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

function useGrain() {
  const [grain, setGrain] = useState<HTMLImageElement>();
  useEffect(() => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => setGrain(image);
    image.src = GRAIN_SRC;
  }, []);
  return grain;
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
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return tick;
}

function useSource() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("image");
  const urlRef = useRef<string | null>(null);

  const release = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
  }, []);

  const load = useCallback(
    (file: File) => {
      release();
      const url = URL.createObjectURL(file);
      urlRef.current = url;
      setFileName(baseName(file.name));
      const next = new Image();
      next.onload = () => {
        if (urlRef.current === url) setImage(next);
      };
      next.src = url;
    },
    [release],
  );

  const clear = useCallback(() => {
    release();
    setImage(null);
  }, [release]);

  useEffect(() => release, [release]);

  return { image, fileName, load, clear };
}

export function useCrt() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const displayWidthRef = useRef(1);
  const [saving, setSaving] = useState(false);
  const grain = useGrain();
  const tick = useResizeTick();
  const { image, fileName, load, clear } = useSource();

  useEffect(() => {
    window.addEventListener("dragover", preventDrop);
    window.addEventListener("drop", preventDrop);
    return () => {
      window.removeEventListener("dragover", preventDrop);
      window.removeEventListener("drop", preventDrop);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!image || !canvas) return;
    const available = availableSpace(canvas);
    const display = displaySize(image.naturalWidth, image.naturalHeight, available);
    const unit = density();
    displayWidthRef.current = display.width;
    canvas.style.width = `${display.width}px`;
    canvas.style.height = `${display.height}px`;
    renderCrt(canvas, {
      source: image,
      grain,
      width: Math.round(display.width * unit),
      height: Math.round(display.height * unit),
      unit,
    });
  }, [image, grain, tick]);

  const save = useCallback(() => {
    if (!image) return;
    setSaving(true);
    window.setTimeout(() => {
      const size = exportSize(image.naturalWidth, image.naturalHeight);
      const target = document.createElement("canvas");
      renderCrt(target, {
        source: image,
        grain,
        ...size,
        unit: size.width / displayWidthRef.current,
      });
      target.toBlob((blob) => {
        setSaving(false);
        if (blob) downloadBlob(blob, `${fileName}-crt.png`);
      }, "image/png");
    }, 30);
  }, [image, grain, fileName]);

  return {
    canvasRef,
    loaded: image !== null,
    load,
    clear,
    save,
    saving,
  };
}
