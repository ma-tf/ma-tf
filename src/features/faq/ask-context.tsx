import type { AskUnit } from "@features/faq/use-ask";

import { createContext, useContext, type PropsWithChildren } from "react";

type AskContextValue = {
  itemValue: string;
  question: string;
  unit: Exclude<AskUnit, { status: "idle" }>;
  retry: () => void;
};

const AskContext = createContext<AskContextValue | null>(null);

export function AskProvider({ value, children }: PropsWithChildren<{ value: AskContextValue }>) {
  return <AskContext.Provider value={value}>{children}</AskContext.Provider>;
}

export function useAskUnit() {
  const context = useContext(AskContext);
  if (!context) throw new Error("useAskUnit must be used within AskProvider");

  return context;
}
