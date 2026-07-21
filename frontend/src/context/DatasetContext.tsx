import { createContext, ReactNode, useContext, useMemo, useState } from "react";

import { Dataset } from "../types";

interface DatasetContextValue {
  activeDataset: Dataset | null;
  setActiveDataset: (dataset: Dataset | null) => void;
}

const DatasetContext = createContext<DatasetContextValue | undefined>(undefined);

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [activeDataset, setActiveDataset] = useState<Dataset | null>(() => {
    const raw = sessionStorage.getItem("veridian_active_dataset");
    return raw ? (JSON.parse(raw) as Dataset) : null;
  });

  const updateActiveDataset = (dataset: Dataset | null) => {
    if (dataset) sessionStorage.setItem("veridian_active_dataset", JSON.stringify(dataset));
    else sessionStorage.removeItem("veridian_active_dataset");
    setActiveDataset(dataset);
  };

  const value = useMemo(() => ({ activeDataset, setActiveDataset: updateActiveDataset }), [activeDataset]);

  return <DatasetContext.Provider value={value}>{children}</DatasetContext.Provider>;
}

export function useDataset(): DatasetContextValue {
  const ctx = useContext(DatasetContext);
  if (!ctx) throw new Error("useDataset must be used within a DatasetProvider");
  return ctx;
}
