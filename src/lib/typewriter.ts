const SELECTOR = "[data-typewriter]";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const CHAR_INTERVAL = 6;
const START_DELAY = 4100;
const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

export const TYPEWRITER_START_EVENT = "typewriter:start";
export const TYPEWRITER_END_EVENT = "typewriter:end";

function split(node: Node, chars: HTMLElement[]) {
  const current = node;

  if (current.nodeType === TEXT_NODE) {
    const fragment = document.createDocumentFragment();

    for (const character of (current.textContent ?? "").replace(/\s+/g, " ")) {
      const span = document.createElement("span");
      span.className = "typewriter-char";
      span.textContent = character;
      fragment.append(span);
      chars.push(span);
    }

    current.parentNode?.replaceChild(fragment, current);
    return;
  }

  if (current.nodeType === ELEMENT_NODE) {
    for (const child of Array.from(current.childNodes)) {
      split(child, chars);
    }
  }
}

let finishCurrent: (() => void) | null = null;

export function isTypewriterRunning() {
  return finishCurrent !== null;
}

export function finishTypewriter() {
  finishCurrent?.();
}

export function startTypewriter() {
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

  const target = document.querySelector<HTMLElement>(SELECTOR);
  if (!target || target.classList.contains("typewriter-active")) return;

  target.classList.add("typewriter-active");

  const chars: HTMLElement[] = [];
  split(target, chars);

  const caret = document.createElement("span");
  caret.className = "typewriter-caret";

  let index = 0;
  let timer = 0;
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    window.clearTimeout(timer);
    for (let remaining = index; remaining < chars.length; remaining += 1) {
      chars[remaining]?.classList.add("typewriter-char-typed");
    }
    caret.remove();
    finishCurrent = null;
    window.dispatchEvent(new Event(TYPEWRITER_END_EVENT));
  };

  const reveal = () => {
    const character = chars[index];
    if (!character) {
      finish();
      return;
    }
    character.classList.add("typewriter-char-typed");
    character.after(caret);
    index += 1;
    timer = window.setTimeout(reveal, CHAR_INTERVAL);
  };

  finishCurrent = finish;
  window.dispatchEvent(new Event(TYPEWRITER_START_EVENT));
  timer = window.setTimeout(reveal, START_DELAY);
}
