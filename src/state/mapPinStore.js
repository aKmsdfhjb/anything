import { create } from 'zustand';

const normalizePin = pin => ({
  ...pin,
  latitude: Number(pin.latitude ?? pin.lat),
  longitude: Number(pin.longitude ?? pin.lng ?? pin.lon),
});

export const useMapPinStore = create((set, get) => ({
  pins: [],
  activeCategory: 'all',
  viewportKey: null,
  setPins: (pins, viewportKey = null) => set({
    pins: (pins || []).map(normalizePin).filter(p =>
      Number.isFinite(p.latitude) &&
      Number.isFinite(p.longitude) &&
      p.latitude >= -90 && p.latitude <= 90 &&
      p.longitude >= -180 && p.longitude <= 180
    ),
    viewportKey,
  }),
  setActiveCategory: activeCategory => set({ activeCategory }),
  visiblePins: () => {
    const { pins, activeCategory } = get();
    return activeCategory === 'all'
      ? pins
      : pins.filter(pin => String(pin.category || 'general').toLowerCase() === activeCategory);
  },
  clearPins: () => set({ pins: [], viewportKey: null }),
}));
