/**
 * Convert a wall-clock birth time in an IANA time zone to a real UTC instant.
 * Uses the browser's time-zone database, including historical daylight saving rules.
 */
export function timeZoneOffsetMs(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const parts: Record<string, number> = {};
  for (const part of dtf.formatToParts(date)) {
    if (part.type !== 'literal') parts[part.type] = Number(part.value);
  }
  const asUtc = Date.UTC(
    parts.year ?? 1970,
    (parts.month ?? 1) - 1,
    parts.day ?? 1,
    parts.hour ?? 0,
    parts.minute ?? 0,
    parts.second ?? 0,
  );
  return asUtc - date.getTime();
}

export function zonedTimeToUtc(dateStr: string, timeStr: string, timeZone: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  const guess = Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1, hour ?? 12, minute ?? 0, 0);
  let ts = guess - timeZoneOffsetMs(new Date(guess), timeZone);
  for (let i = 0; i < 3; i++) {
    const next = guess - timeZoneOffsetMs(new Date(ts), timeZone);
    if (next === ts) break;
    ts = next;
  }
  return new Date(ts);
}

export function offsetTimeToUtc(dateStr: string, timeStr: string, offsetHours: number): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  return new Date(
    Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1, hour ?? 12, minute ?? 0, 0) -
      offsetHours * 3600_000,
  );
}

/** Offset of a time zone at a given instant, as a readable UTC+05:30 string. */
export function offsetLabel(date: Date, timeZone: string): string {
  const offset = timeZoneOffsetMs(date, timeZone) / 3600_000;
  return formatOffset(offset);
}

export function formatOffset(offsetHours: number): string {
  const sign = offsetHours >= 0 ? '+' : '−';
  const abs = Math.abs(offsetHours);
  const hours = Math.floor(abs);
  const minutes = Math.round((abs - hours) * 60);
  return `UTC${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function isValidLatitude(value: number): boolean {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

export function isValidLongitude(value: number): boolean {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}
