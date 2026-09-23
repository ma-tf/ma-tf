import { atom } from "nanostores";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof localStorage !== "undefined") {
    return localStorage.getItem("theme") === "dark" ? "dark" : "light";
  }
  return "light";
}

export const theme = atom<Theme>(getInitialTheme());

function applyTheme(next: Theme) {
  theme.set(next);
  document.documentElement.classList.toggle("dark", next === "dark");
  localStorage.setItem("theme", next);
}

export function toggleTheme() {
  const next: Theme = theme.get() === "light" ? "dark" : "light";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || typeof document.startViewTransition !== "function") {
    applyTheme(next);
    return;
  }

  document.startViewTransition(() => applyTheme(next));
}
