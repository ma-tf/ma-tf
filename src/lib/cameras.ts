const CAMERA_SELECTOR = "[data-camera]";
const SHAKE_CLASS = "animate-bird-shake";

export function startCameras(root: ParentNode = document) {
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>(CAMERA_SELECTOR));

  for (const button of buttons) {
    button.addEventListener("click", () => {
      const image = button.querySelector("img");
      if (!image) return;
      image.classList.remove(SHAKE_CLASS);
      void image.offsetWidth;
      image.classList.add(SHAKE_CLASS);
    });
  }
}
