import { atom } from "nanostores";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof localStorage !== "undefined") {
    return localStorage.getItem("theme") === "dark" ? "dark" : "light";
  }
  return "light";
}

export const theme = atom<Theme>(getInitialTheme());

export function toggleTheme() {
  const next: Theme = theme.get() === "light" ? "dark" : "light";
  theme.set(next);
  document.documentElement.classList.toggle("dark", next === "dark");
  localStorage.setItem("theme", next);
}
