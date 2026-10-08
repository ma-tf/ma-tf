export const ORBIT_ROTATION_KEY = "ma-tf:orbit-rotation";

function resolveStorage(): Storage | null {
  try {
    return globalThis.sessionStorage ?? null;
  } catch {
    return null;
  }
}

export function readStoredRotation(): number {
  try {
    const storage = resolveStorage();
    if (!storage) return 0;
    const raw = storage.getItem(ORBIT_ROTATION_KEY);
    if (raw === null) return 0;
    const value = Number(raw);
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

export function writeStoredRotation(rotation: number): boolean {
  try {
    const storage = resolveStorage();
    if (!storage) return false;
    storage.setItem(ORBIT_ROTATION_KEY, String(rotation));
  } catch {
    return false;
  }
  return true;
}
