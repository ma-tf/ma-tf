type SfxToken = "hover" | "focus" | "click" | "leave";
type SfxName = "default" | "up" | "down";

const SOUND_URLS: Record<SfxName, string> = {
  default: "/menu2.ogg",
  up: "/menu3up.ogg",
  down: "/menu3down.ogg",
};

const MIN_INTERVAL_MS = 80;
const SAMPLE_RATE = 16_000;
const VOLUME = 0.1;
const MUTED_KEY = "sfx-muted";
const FADE_S = 0.04;

let context: AudioContext | null = null;
const lastPlayed = new Map<SfxName, number>();
const startedRoots = new WeakSet<EventTarget>();
const hovered = new WeakSet<Element>();
const focused = new WeakSet<Element>();
const buffers = new Map<SfxName, AudioBuffer>();
let lastHover: { host: Element; x: number; y: number } | null = null;

async function loadSound(name: SfxName) {
  if (typeof window.OfflineAudioContext !== "function") return;

  try {
    const response = await fetch(SOUND_URLS[name]);
    if (!response.ok) return;
    const decoder = new window.OfflineAudioContext(1, 1, SAMPLE_RATE);
    buffers.set(name, await decoder.decodeAudioData(await response.arrayBuffer()));
  } catch {
    return;
  }
}

type Voice = { source: AudioBufferSourceNode; gain: GainNode };

let voice: Voice | null = null;

function fadeOut(current: Voice, audio: AudioContext) {
  const at = audio.currentTime;
  current.gain.gain.setValueAtTime(current.gain.gain.value, at);
  current.gain.gain.linearRampToValueAtTime(0, at + FADE_S);
  current.source.stop(at + FADE_S);
}

function play(audio: AudioContext, sound: AudioBuffer) {
  if (voice) fadeOut(voice, audio);

  const source = audio.createBufferSource();
  source.buffer = sound;
  const gain = audio.createGain();
  gain.gain.value = VOLUME;
  source.connect(gain);
  gain.connect(audio.destination);
  const next = { source, gain };
  voice = next;
  source.onended = () => {
    if (voice === next) voice = null;
  };
  source.start();
}

export function isSfxMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTED_KEY) === "true";
  } catch {
    return false;
  }
}

export function setSfxMuted(muted: boolean): void {
  try {
    if (muted) window.localStorage.setItem(MUTED_KEY, "true");
    else window.localStorage.removeItem(MUTED_KEY);
  } catch {
    return;
  }
}

export function playSfx(name: SfxName = "default") {
  if (typeof window === "undefined" || typeof window.AudioContext !== "function") return;
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
  if (isSfxMuted()) return;

  const now = performance.now();
  if (now - (lastPlayed.get(name) ?? Number.NEGATIVE_INFINITY) < MIN_INTERVAL_MS) return;

  try {
    context ??= new window.AudioContext();
    if (context.state !== "running") {
      void context.resume().catch(() => {});
      return;
    }
    const buffer = buffers.get(name);
    if (!buffer) return;
    play(context, buffer);
    lastPlayed.set(name, now);
  } catch {
    return;
  }
}

function sfxHost(target: EventTarget | null, token: SfxToken): Element | null {
  return target instanceof Element ? target.closest(`[data-sfx~="${token}"]`) : null;
}

function enteredHost(event: PointerEvent | FocusEvent, token: SfxToken): Element | null {
  const host = sfxHost(event.target, token);
  if (!host) return null;
  if (event.relatedTarget instanceof Node && host.contains(event.relatedTarget)) return null;
  return host;
}

function soundOf(host: Element, direction: "enter" | "leave"): SfxName {
  const name = host.getAttribute(`data-sfx-${direction}`);
  return name === "up" || name === "down" ? name : "default";
}

function leftHost(event: PointerEvent | FocusEvent): Element | null {
  const host = sfxHost(event.target, "leave");
  if (!host) return null;
  if (event.relatedTarget instanceof Node && host.contains(event.relatedTarget)) return null;
  return host;
}

function enterDelay(host: Element): number {
  if (!host.hasAttribute("data-sfx-settle")) return 0;
  const raw = window.getComputedStyle(document.documentElement).getPropertyValue("--open-delay");
  const delay = Number.parseFloat(raw);
  return Number.isFinite(delay) ? delay : 0;
}

function playEntering(host: Element) {
  const name = soundOf(host, "enter");
  const delay = enterDelay(host);
  if (delay <= 0) {
    playSfx(name);
    return;
  }
  window.setTimeout(() => {
    if (hovered.has(host) || focused.has(host)) playSfx(name);
  }, delay);
}

function onPointerOver(event: Event) {
  const pointer = event as PointerEvent;
  if (pointer.pointerType === "touch") return;
  const host = enteredHost(pointer, "hover");
  if (!host) return;
  hovered.add(host);
  const { clientX: x, clientY: y } = pointer;
  const stationary = lastHover?.host === host && lastHover.x === x && lastHover.y === y;
  lastHover = { host, x, y };
  if (!stationary) playEntering(host);
}

function onPointerOut(event: Event) {
  const pointer = event as PointerEvent;
  if (pointer.pointerType === "touch") return;
  const host = leftHost(pointer);
  if (!host || !hovered.delete(host)) return;
  playSfx(soundOf(host, "leave"));
}

function onFocusIn(event: Event) {
  if (!(event.target instanceof Element) || !event.target.matches(":focus-visible")) return;
  const host = enteredHost(event as FocusEvent, "focus");
  if (!host) return;
  focused.add(host);
  playEntering(host);
}

function onFocusOut(event: Event) {
  const host = leftHost(event as FocusEvent);
  if (!host || !focused.delete(host)) return;
  playSfx(soundOf(host, "leave"));
}

function onClick(event: Event) {
  if (sfxHost(event.target, "click")) playSfx();
}

export function startSfx(root: Document | HTMLElement = document) {
  if (startedRoots.has(root)) return;
  startedRoots.add(root);
  for (const name of Object.keys(SOUND_URLS) as SfxName[]) void loadSound(name);

  root.addEventListener("pointerover", onPointerOver, true);
  root.addEventListener("pointerout", onPointerOut, true);
  root.addEventListener("focusin", onFocusIn, true);
  root.addEventListener("focusout", onFocusOut, true);
  root.addEventListener("click", onClick, true);
}
