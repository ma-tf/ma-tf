import type { CSSProperties } from "react";

import { PauseIcon, PlayIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";

const AUDIO_SRC = "/demo-menu-loop.mp3";
const DEFAULT_VOLUME = 0.7;
const PAUSED_KEY = "audio-paused";
const VOLUME_KEY = "audio-volume";

function readPaused(): boolean {
  try {
    return window.localStorage.getItem(PAUSED_KEY) === "true";
  } catch {
    return false;
  }
}

function writePaused(paused: boolean): void {
  try {
    if (paused) window.localStorage.setItem(PAUSED_KEY, "true");
    else window.localStorage.removeItem(PAUSED_KEY);
  } catch {
    return;
  }
}

function readVolume(): number | null {
  try {
    const raw = window.localStorage.getItem(VOLUME_KEY);
    if (raw === null) return null;
    const stored = Number(raw);
    if (!Number.isFinite(stored)) return null;
    return Math.min(1, Math.max(0, stored));
  } catch {
    return null;
  }
}

function writeVolume(volume: number): void {
  try {
    window.localStorage.setItem(VOLUME_KEY, String(volume));
  } catch {
    return;
  }
}

function useLoopingAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const setVolume = useCallback((next: number) => {
    setVolumeState(next);
    writeVolume(next);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const stored = readVolume();
    if (stored !== null) {
      audio.volume = stored;
      setVolumeState(stored);
    }
    if (readPaused()) return;
    void audio.play().catch(() => {});

    const unlock = (event: Event) => {
      if (!audio.paused || readPaused()) return;
      const target = event.target;
      if (target instanceof Element && target.closest("[data-header-audio]")) return;
      void audio.play().catch(() => {});
    };

    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      writePaused(false);
      void audio.play().catch(() => {
        writePaused(true);
        setPlaying(false);
      });
    } else {
      writePaused(true);
      audio.pause();
    }
  }, []);

  const audio = (
    <audio
      ref={audioRef}
      src={AUDIO_SRC}
      loop
      preload="metadata"
      hidden
      aria-hidden="true"
      onPlay={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
    />
  );

  return { playing, volume, toggle, setVolume, audio };
}

function VolumeSlider({ volume, onChange }: { volume: number; onChange: (value: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    if (rect.width === 0) return;
    const next = (clientX - rect.left) / rect.width;
    onChange(Math.min(1, Math.max(0, next)));
  };

  const nudge = (step: number) => onChange(Math.min(1, Math.max(0, volume + step)));
  const percent = Math.round(volume * 100);

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label="Music volume"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-valuetext={`${percent}%`}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        dragging.current = true;
        setFromClientX(event.clientX);
      }}
      onPointerMove={(event) => {
        if (!dragging.current) return;
        setFromClientX(event.clientX);
      }}
      onPointerUp={(event) => {
        dragging.current = false;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
      onKeyDown={(event) => {
        const steps: Record<string, number> = {
          ArrowLeft: -0.05,
          ArrowDown: -0.05,
          ArrowRight: 0.05,
          ArrowUp: 0.05,
        };
        if (event.key === "Home" || event.key === "End") {
          event.preventDefault();
          onChange(event.key === "Home" ? 0 : 1);
          return;
        }
        const step = steps[event.key];
        if (step === undefined) return;
        event.preventDefault();
        nudge(step);
      }}
      className="relative flex h-4 w-10 cursor-pointer touch-none items-center md:w-16"
      style={{ "--volume": `${volume * 100}%` } as CSSProperties}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-2 h-px bg-foreground/20 dark:bg-background/20"
      />
      <span
        aria-hidden="true"
        className="absolute top-2 left-0 h-px w-(--volume) bg-foreground dark:bg-background"
      />
    </div>
  );
}

export function HeaderAudio() {
  const { playing, volume, toggle, setVolume, audio } = useLoopingAudio();

  return (
    <>
      {audio}
      <div
        data-header-audio
        className="flex h-full items-center justify-center pr-1 md:justify-start md:pr-2"
      >
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause music" : "Play music"}
          className="grid h-full w-6 cursor-pointer place-items-center text-muted-foreground transition-colors duration-150 hover:text-foreground md:w-auto md:px-1 dark:text-background/80 dark:hover:text-background"
        >
          {playing ? (
            <PauseIcon size={12} weight="fill" aria-hidden="true" />
          ) : (
            <PlayIcon size={12} weight="fill" aria-hidden="true" />
          )}
        </button>
        <VolumeSlider volume={volume} onChange={setVolume} />
      </div>
    </>
  );
}
