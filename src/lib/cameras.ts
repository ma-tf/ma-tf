import { CDN_BASE } from "@lib/cdn";

const CAMERA_SELECTOR = "[data-camera]";
const SHAKE_CLASS = "animate-bird-shake";
const AUDIO_SRC = `${CDN_BASE}/photograph/camera.ogg`;

export function startCameras(root: ParentNode = document) {
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>(CAMERA_SELECTOR));
  if (buttons.length === 0) return;

  const audio = new Audio(AUDIO_SRC);
  audio.preload = "auto";

  for (const button of buttons) {
    button.addEventListener("click", () => {
      audio.currentTime = 0;
      void audio.play().catch(() => {});

      const image = button.querySelector("img");
      if (!image) return;
      image.classList.remove(SHAKE_CLASS);
      void image.offsetWidth;
      image.classList.add(SHAKE_CLASS);
    });
  }
}
