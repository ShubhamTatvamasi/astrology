import type { BirthData } from './types';

const KEY = 'astra-birth-chart-v1';

interface StoredBirth {
  v: 1;
  date: string;
  localDate: string;
  localTime: string;
  timeUnknown: boolean;
  latitude: number;
  longitude: number;
  timezone: string;
  tzLabel: string;
  placeLabel: string;
  savedAt: string;
}

export function saveBirthData(data: BirthData): boolean {
  if (typeof window === 'undefined') return false;
  const stored: StoredBirth = {
    v: 1,
    date: data.date.toISOString(),
    localDate: data.localDate,
    localTime: data.localTime,
    timeUnknown: data.timeUnknown,
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    tzLabel: data.tzLabel,
    placeLabel: data.placeLabel,
    savedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(stored));
    return true;
  } catch {
    return false;
  }
}

export function loadBirthData(): BirthData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Partial<StoredBirth>;
    if (
      stored.v !== 1 ||
      !stored.date ||
      !stored.localDate ||
      !stored.localTime ||
      typeof stored.latitude !== 'number' ||
      typeof stored.longitude !== 'number'
    ) {
      return null;
    }
    const date = new Date(stored.date);
    if (Number.isNaN(date.getTime())) return null;
    return {
      date,
      localDate: stored.localDate,
      localTime: stored.localTime,
      timeUnknown: Boolean(stored.timeUnknown),
      latitude: stored.latitude,
      longitude: stored.longitude,
      timezone: stored.timezone || 'UTC',
      tzLabel: stored.tzLabel || 'UTC',
      placeLabel: stored.placeLabel || 'Saved chart',
    };
  } catch {
    return null;
  }
}

export function clearBirthData(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function hasBirthData(): boolean {
  return loadBirthData() !== null;
}
