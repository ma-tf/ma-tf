const TITLE_SELECTOR = "[data-title]";
const SWITCH_MS = 150;
const started = new WeakSet<Document>();

export function startHomeSwitch(root: Document = document) {
  if (started.has(root)) return;
  started.add(root);

  const html = root.documentElement;
  const open = new Set<Element>();
  let timer: number | undefined;

  const sync = () => {
    if (open.size > 0 || timer !== undefined) html.dataset.switching = "";
    else delete html.dataset.switching;
  };

  const opened = (event: Event) => {
    if ((event as TransitionEvent).propertyName !== "translate") return;
    const title = event.target instanceof Element ? event.target.closest(TITLE_SELECTOR) : null;
    if (!title?.matches(":hover, :focus-within")) return;
    open.add(title);
    sync();
  };

  const closed = (event: Event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const title = target.closest(TITLE_SELECTOR);
    if (!title) return;
    const next = (event as FocusEvent | MouseEvent).relatedTarget;
    if (next instanceof Node && title.contains(next)) return;
    open.delete(title);
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      timer = undefined;
      sync();
    }, SWITCH_MS);
    sync();
  };

  root.addEventListener("transitionrun", opened, true);
  root.addEventListener("pointerout", closed, true);
  root.addEventListener("focusout", closed, true);
}
