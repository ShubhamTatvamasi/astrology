import type { Place } from './geo';

export interface BirthData {
  /** UTC instant of birth. */
  date: Date;
  /** Local calendar date as entered, YYYY-MM-DD. */
  localDate: string;
  /** Local wall time as entered, HH:MM. */
  localTime: string;
  timeUnknown: boolean;
  latitude: number;
  longitude: number;
  /** IANA zone for city entries, or a readable label for manual offsets. */
  timezone: string;
  tzLabel: string;
  placeLabel: string;
}

export interface BirthInitial {
  date?: string;
  time?: string;
  timeUnknown?: boolean;
  place?: Place;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  placeLabel?: string;
  manual?: boolean;
  utcOffset?: number;
}
