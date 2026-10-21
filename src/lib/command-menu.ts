export const COMMAND_MENU_OPEN_EVENT = "command-menu:open";

export function openCommandMenu() {
  window.dispatchEvent(new Event(COMMAND_MENU_OPEN_EVENT));
}
