
import { create } from "zustand";

export type NearbyDriver = {
  id?: string;
  lat: number;
  lon: number;
  bearing?: number;
  updatedAt?: number;
};

type NearbyDriverState = {
  drivers: NearbyDriver[];
  supplyCount: number;
  lastFetched?: number;
  setDrivers: (drivers: NearbyDriver[], count?: number) => void;
  clear: () => void;
};

export const useNearbyDriversStore = create<NearbyDriverState>((set) => ({
  drivers: [],
  supplyCount: 0,
  lastFetched: undefined,
  setDrivers: (drivers, count) =>
    set({
      drivers,
      supplyCount: typeof count === "number" ? count : drivers.length,
      lastFetched: Date.now(),
    }),
  clear: () => set({ drivers: [], supplyCount: 0, lastFetched: undefined }),
}));
