import { CDN_BASE } from "@lib/cdn";
import { isSfxMuted } from "@lib/sfx";

const CAMERA_SELECTOR = "[data-camera]";
const SHAKE_CLASS = "animate-bird-shake";
const AUDIO_SRC = `${CDN_BASE}/photography/camera.ogg`;

export function startCameras(root: ParentNode = document) {
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>(CAMERA_SELECTOR));
  if (buttons.length === 0) return;

  const audio = new Audio(AUDIO_SRC);
  audio.preload = "auto";
  audio.preservesPitch = false;

  for (const button of buttons) {
    button.addEventListener("click", () => {
      audio.currentTime = 0;
      audio.playbackRate = Number(button.dataset.playbackRate ?? 1);
      if (!isSfxMuted()) void audio.play().catch(() => {});

      const image = button.querySelector("img");
      if (!image) return;
      image.classList.remove(SHAKE_CLASS);
      void image.offsetWidth;
      image.classList.add(SHAKE_CLASS);
    });
  }
}
