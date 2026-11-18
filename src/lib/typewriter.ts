const SELECTOR = "[data-typewriter]";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const CHAR_INTERVAL = 6;
const START_DELAY = 4100;
const TEXT_NODE = 3;
const ELEMENT_NODE = 1;
const CHAR_CLASS = "typewriter-char";
const TYPED_CLASS = "typewriter-char-typed";
const ACTIVE_CLASS = "typewriter-active";
const CARET_CLASS = "typewriter-caret";

export const TYPEWRITER_START_EVENT = "typewriter:start";
export const TYPEWRITER_END_EVENT = "typewriter:end";

export type TypewriterOptions = {
  interval?: number;
  startDelay?: number;
  caret?: boolean;
  onFinish?: () => void;
};

export type TypewriterHandle = {
  finish: () => void;
  cancel: () => void;
};

function splitTextNode(node: Node, chars: HTMLElement[]) {
  const fragment = document.createDocumentFragment();

  for (const character of (node.textContent ?? "").replace(/\s+/g, " ")) {
    const span = document.createElement("span");
    span.className = CHAR_CLASS;
    span.textContent = character;
    fragment.append(span);
    chars.push(span);
  }

  node.parentNode?.replaceChild(fragment, node);
}

function split(node: Node, chars: HTMLElement[]) {
  if (node.nodeType === TEXT_NODE) {
    splitTextNode(node, chars);
    return;
  }

  if (node.nodeType !== ELEMENT_NODE) return;

  for (const child of Array.from(node.childNodes)) split(child, chars);
}

function collectChars(element: HTMLElement) {
  const existing = Array.from(element.querySelectorAll<HTMLElement>(`.${CHAR_CLASS}`));
  if (existing.length > 0) return existing;

  const chars: HTMLElement[] = [];
  split(element, chars);
  return chars;
}

export function finishTypeText(element: HTMLElement) {
  for (const character of Array.from(element.querySelectorAll<HTMLElement>(`.${CHAR_CLASS}`))) {
    character.classList.add(TYPED_CLASS);
  }

  for (const caret of Array.from(element.querySelectorAll(`.${CARET_CLASS}`))) caret.remove();
}

export function typeText(element: HTMLElement, options: TypewriterOptions = {}): TypewriterHandle {
  const interval = options.interval ?? CHAR_INTERVAL;
  const caret = options.caret ?? true;

  element.classList.add(ACTIVE_CLASS);
  const chars = collectChars(element);
  for (const character of chars) character.classList.remove(TYPED_CLASS);

  const caretNode = caret ? document.createElement("span") : null;
  if (caretNode) caretNode.className = CARET_CLASS;

  let index = 0;
  let timer = 0;
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    window.clearTimeout(timer);
    for (let remaining = index; remaining < chars.length; remaining += 1) {
      chars[remaining]?.classList.add(TYPED_CLASS);
    }
    caretNode?.remove();
    options.onFinish?.();
  };

  const cancel = () => {
    if (finished) return;
    finished = true;
    window.clearTimeout(timer);
    caretNode?.remove();
  };

  const reveal = () => {
    const character = chars[index];
    if (!character) {
      finish();
      return;
    }
    character.classList.add(TYPED_CLASS);
    if (caretNode) character.after(caretNode);
    index += 1;
    timer = window.setTimeout(reveal, interval);
  };

  timer = window.setTimeout(reveal, options.startDelay ?? 0);
  return { finish, cancel };
}

let finishCurrent: (() => void) | null = null;

export function isTypewriterRunning() {
  return finishCurrent !== null;
}

export function finishTypewriter() {
  finishCurrent?.();
}

function shouldSkipMotion() {
  return (
    window.matchMedia(REDUCED_MOTION_QUERY).matches ||
    Boolean(document.documentElement.dataset.motion)
  );
}

export function startTypewriter() {
  if (shouldSkipMotion()) return;

  const target = document.querySelector<HTMLElement>(SELECTOR);
  if (!target || target.classList.contains(ACTIVE_CLASS)) return;

  const handle = typeText(target, {
    startDelay: START_DELAY,
    onFinish: () => {
      finishCurrent = null;
      window.dispatchEvent(new Event(TYPEWRITER_END_EVENT));
    },
  });

  finishCurrent = handle.finish;
  window.dispatchEvent(new Event(TYPEWRITER_START_EVENT));
}
