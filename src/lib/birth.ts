import type { Place } from './geo';
import { offsetLabel, offsetTimeToUtc, formatOffset, zonedTimeToUtc } from './time';
import type { BirthData, BirthInitial } from './types';

/** Resolve a parsed initial record into a concrete UTC birth moment. */
export function resolveBirth(initial: BirthInitial): BirthData | null {
  if (!initial.date) return null;
  const clock = initial.timeUnknown ? '12:00' : initial.time || '12:00';
  const manual = Boolean(initial.manual || !initial.place);
  const latitude = Number(initial.latitude ?? initial.place?.latitude);
  const longitude = Number(initial.longitude ?? initial.place?.longitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    return null;
  }

  let date: Date;
  let tzLabel: string;
  let timezone: string;
  let placeLabel: string;

  if (manual) {
    const offset = Number(initial.utcOffset ?? 0);
    if (!Number.isFinite(offset) || offset < -14 || offset > 14) return null;
    date = offsetTimeToUtc(initial.date, clock, offset);
    tzLabel = formatOffset(offset);
    timezone = initial.timezone || tzLabel;
    placeLabel = initial.placeLabel || 'Custom coordinates';
  } else {
    const place = initial.place!;
    if (!place.timezone) return null;
    try {
      date = zonedTimeToUtc(initial.date, clock, place.timezone);
      tzLabel = offsetLabel(date, place.timezone);
    } catch {
      return null;
    }
    timezone = place.timezone;
    placeLabel = initial.placeLabel || [place.name, place.admin1, place.country].filter(Boolean).join(', ');
  }

  if (Number.isNaN(date.getTime())) return null;

  return {
    date,
    localDate: initial.date,
    localTime: clock,
    timeUnknown: Boolean(initial.timeUnknown),
    latitude,
    longitude,
    timezone,
    tzLabel,
    placeLabel,
  };
}

export function offsetHoursFromBirth(data: BirthData): number {
  const [y, m, d] = data.localDate.split('-').map(Number);
  const [hh, mm] = data.localTime.split(':').map(Number);
  const local = Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1, hh ?? 12, mm ?? 0);
  return Math.round(((local - data.date.getTime()) / 3600_000) * 100) / 100;
}

export function searchFromBirth(data: BirthData, houseSystem: string): string {
  return new URLSearchParams({
    d: data.localDate,
    t: data.localTime,
    lat: String(Number(data.latitude.toFixed(4))),
    lon: String(Number(data.longitude.toFixed(4))),
    tz: data.timezone,
    place: data.placeLabel,
    u: data.timeUnknown ? '1' : '0',
    off: String(offsetHoursFromBirth(data)),
    hs: houseSystem,
  }).toString();
}

/** Read a shareable chart URL into the same shape the birth form uses. */
export function initialFromSearch(search: string): BirthInitial | null {
  const params = new URLSearchParams(search);
  const date = params.get('d');
  const latParam = params.get('lat');
  const lonParam = params.get('lon');
  if (!date || latParam === null || lonParam === null) return null;
  const latitude = Number(latParam);
  const longitude = Number(lonParam);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    return null;
  }

  const time = params.get('t') || '12:00';
  const timeUnknown = params.get('u') === '1';
  const tz = params.get('tz') || '';
  const offset = Number(params.get('off'));
  const placeLabel = params.get('place') || 'Custom coordinates';
  const manual = !tz.includes('/');

  const place: Place | undefined = manual
    ? undefined
    : {
        id: 0,
        name: placeLabel,
        country: '',
        latitude,
        longitude,
        timezone: tz,
      };

  return {
    date,
    time,
    timeUnknown,
    latitude,
    longitude,
    timezone: tz || (Number.isFinite(offset) ? formatOffset(offset) : 'UTC+00:00'),
    placeLabel,
    place,
    manual,
    utcOffset: Number.isFinite(offset) ? offset : 0,
  };
}

export function houseSystemFromSearch(search: string): 'whole' | 'equal' {
  const params = new URLSearchParams(search);
  return params.get('hs') === 'equal' ? 'equal' : 'whole';
}
