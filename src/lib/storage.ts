import type { BirthData } from './types';

const KEY = 'astra-birth-chart-v1';
const PARTNER_KEY = 'astra-partner-chart-v1';

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

function encode(data: BirthData): StoredBirth {
  return {
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
}

function decode(raw: string): BirthData | null {
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
}

function saveTo(key: string, data: BirthData): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(encode(data)));
    return true;
  } catch {
    return false;
  }
}

function loadFrom(key: string): BirthData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return decode(raw);
  } catch {
    return null;
  }
}

function clearFrom(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function saveBirthData(data: BirthData): boolean {
  return saveTo(KEY, data);
}

export function loadBirthData(): BirthData | null {
  return loadFrom(KEY);
}

export function clearBirthData(): void {
  clearFrom(KEY);
}

export function savePartnerData(data: BirthData): boolean {
  return saveTo(PARTNER_KEY, data);
}

export function loadPartnerData(): BirthData | null {
  return loadFrom(PARTNER_KEY);
}

export function clearPartnerData(): void {
  clearFrom(PARTNER_KEY);
}

export function hasBirthData(): boolean {
  return loadBirthData() !== null;
}
