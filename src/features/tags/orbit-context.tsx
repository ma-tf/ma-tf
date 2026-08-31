import { createContext, useContext } from "react";

const DEG = Math.PI / 180;

type OrbitContextValue<T> = {
  startAngle: number;
  arcSize: number;
  step: number;
  items: T[];
  getKey: (item: T, index: number) => string | number;
  initialRotation: number;
};

const OrbitContext = createContext<OrbitContextValue<unknown> | null>(null);

export function useOrbit<T>(): OrbitContextValue<T> {
  const ctx = useContext(OrbitContext);
  if (!ctx) throw new Error("useOrbit must be used within <OrbitProvider>");
  return ctx as OrbitContextValue<T>;
}

export function OrbitProvider<T>({
  startAngle,
  endAngle,
  stepAngle,
  items,
  getKey,
  initialRotation,
  children,
}: {
  startAngle: number;
  endAngle: number;
  stepAngle: number;
  items: T[];
  getKey: (item: T, index: number) => string | number;
  initialRotation: number;
  children: React.ReactNode;
}) {
  const startRad = startAngle * DEG;
  const arcSize = (endAngle - startAngle) * DEG;
  const step = stepAngle * DEG;

  return (
    <OrbitContext.Provider
      value={
        {
          startAngle: startRad,
          arcSize,
          step,
          items,
          getKey,
          initialRotation,
        } as OrbitContextValue<unknown>
      }
    >
      {children}
    </OrbitContext.Provider>
  );
}
