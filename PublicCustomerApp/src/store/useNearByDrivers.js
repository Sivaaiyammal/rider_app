import { create } from 'zustand';

const normalizeType = (type) => (type || '').toLowerCase().replace(/\s+/g, '_');
const getId = (d) => d?.id ?? d?._id;

const buildByType = (driversArray) => {
    const byType = {};
    driversArray.forEach((d) => {
        const t = normalizeType(d.vehicleType);
        if (!byType[t]) byType[t] = [];
        byType[t].push(d);
    });
    return byType;
};

const useNearbyDrivers = create((set, get) => ({
    driversAll: [],
    driversByType: {},
    setDrivers: (newDrivers = []) =>
        set(() => {
            const unique = [];
            const seen = new Set();
            newDrivers.forEach((d) => {
                const id = getId(d);
                if (d && id != null && !seen.has(id)) {
                    seen.add(id);
                    unique.push(d);
                }
            });
            return {
                driversAll: unique,
                driversByType: buildByType(unique),
            };
        }),
    addDriver: (driver) =>
        set((state) => {
            const id = getId(driver);
            if (!driver || id == null) return state;
            if (state.driversAll.some((d) => getId(d) === id)) return state;
            const driversAll = [...state.driversAll, driver];
            return {
                driversAll,
                driversByType: buildByType(driversAll),
            };
        }),
    updateDriver: (idOrObj, partial) =>
        set((state) => {
            // allow id or object with id/_id
            const targetId = typeof idOrObj === 'object' ? getId(idOrObj) : idOrObj;
            const driversAll = state.driversAll.map((d) =>
                getId(d) === targetId ? { ...d, ...(partial ?? {}) } : d
            );
            return {
                driversAll,
                driversByType: buildByType(driversAll),
            };
        }),
    removeDriver: (idOrObj) =>
        set((state) => {
            const targetId = typeof idOrObj === 'object' ? getId(idOrObj) : idOrObj;
            const driversAll = state.driversAll.filter((d) => getId(d) !== targetId);
            return {
                driversAll,
                driversByType: buildByType(driversAll),
            };
        }),
    getDriversByType: (type) => {
        const key = normalizeType(type);
        return get().driversByType[key] || [];
    },
    getAutoDrivers: () => get().getDriversByType('AUTO'),
    getElectricAutoDrivers: () => get().getDriversByType('ELECTRIC_AUTO'),
    getSuvDrivers: () => get().getDriversByType('SUV'),
    getElectricSuvDrivers: () => get().getDriversByType('ELECTRIC_SUV'),
    getElectricBikeDrivers: () => get().getDriversByType('ELECTRIC_BIKE'),
    getSedanDrivers: () => get().getDriversByType('SEDAN'),
    getElectricSedanDrivers: () => get().getDriversByType('ELECTRIC_SEDAN'),
    getBikeDrivers: () => get().getDriversByType('BIKE'),
    getHatchbackDrivers: () => get().getDriversByType('HATCHBACK'),
    getElectricHatchbackDrivers: () => get().getDriversByType('ELECTRIC_HATCHBACK'),
}));

export default useNearbyDrivers;
