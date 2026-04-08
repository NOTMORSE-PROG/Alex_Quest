import { createContext, useContext } from "react";
import type { SharedValue } from "react-native-reanimated";

const MapScrollContext = createContext<SharedValue<number> | null>(null);

export const MapScrollProvider = MapScrollContext.Provider;

export function useMapScroll(): SharedValue<number> {
  const ctx = useContext(MapScrollContext);
  if (!ctx) throw new Error("useMapScroll must be inside MapScrollProvider");
  return ctx;
}
