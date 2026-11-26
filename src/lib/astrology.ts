import {
  Body,
  GeoVector,
  Illumination,
  MakeTime,
  MoonPhase,
  RotateVector,
  Rotation_EQJ_ECT,
  SearchMoonPhase,
  SiderealTime,
} from 'astronomy-engine';
import type { AstroTime } from 'astronomy-engine';

import { ASPECTS, type Aspect } from '../data/aspects';
import { PLANETS, type PlanetKey } from '../data/planets';
import { SIGNS, type Sign } from '../data/signs';
import { phaseForElongation, type MoonPhaseInfo } from '../data/moons';

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

export const BODY_KEYS: PlanetKey[] = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
];

export type HouseSystem = 'whole' | 'equal';

export interface BodyPosition {
  key: PlanetKey;
  name: string;
  glyph: string;
  color: string;
  longitude: number;
  signIndex: number;
  sign: Sign;
  degree: number;
  degreeText: string;
  house: number;
  retrograde: boolean;
  speed: number;
}

export interface ChartAspect {
  a: BodyPosition;
  b: BodyPosition;
  aspect: Aspect;
  orb: number;
  strength: number;
  label: string;
}

export interface Chart {
  date: Date;
  latitude: number;
  longitude: number;
  houseSystem: HouseSystem;
  positions: BodyPosition[];
  ascendant: { longitude: number; sign: Sign; degreeText: string };
  midheaven: { longitude: number; sign: Sign; degreeText: string };
  cusps: number[];
  aspects: ChartAspect[];
  balances: {
    elements: { name: string; count: number; pct: number; color: string }[];
    modalities: { name: string; count: number; pct: number }[];
  };
  dominantElement: string;
  dominantModality: string;
}

export const norm360 = (deg: number): number => ((deg % 360) + 360) % 360;

export const norm180 = (deg: number): number => {
  const d = norm360(deg);
  return d > 180 ? d - 360 : d;
};

export const angularSeparation = (a: number, b: number): number => {
  const d = Math.abs(norm360(a - b));
  return d > 180 ? 360 - d : d;
};

export function signAt(longitude: number): Sign {
  const index = Math.floor(norm360(longitude) / 30) % 12;
  return SIGNS[index]!;
}

export function degreeText(longitude: number): string {
  const lon = norm360(longitude);
  const deg = lon % 30;
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d}° ${String(m).padStart(2, '0')}′`;
}

/** Apparent geocentric ecliptic longitude of date (tropical zodiac). */
export function bodyLongitude(body: Body, time: AstroTime): number {
  if (body === Body.Moon) {
    // GeoVector + ECT is accurate for the Moon here; EclipticGeoMoon gives the same result.
    const vec = GeoVector(body, time, true);
    const ect = RotateVector(Rotation_EQJ_ECT(time), vec);
    return norm360(Math.atan2(ect.y, ect.x) * DEG);
  }
  const vec = GeoVector(body, time, true);
  const ect = RotateVector(Rotation_EQJ_ECT(time), vec);
  return norm360(Math.atan2(ect.y, ect.x) * DEG);
}

/** Mean lunar node (the North Node used by most modern astrologers). */
export function meanNode(date: Date): number {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;
  return norm360(
    125.0445479 -
      1934.1362891 * T +
      0.0020754 * T * T +
      (T * T * T) / 467441 -
      (T * T * T * T) / 60616000,
  );
}

function meanObliquity(date: Date): number {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;
  const seconds = 84381.448 - 46.815 * T - 0.00059 * T * T + 0.001813 * T * T * T;
  return seconds / 3600;
}

export function ascendantAndMC(date: Date, latitude: number, longitude: number) {
  const gast = SiderealTime(MakeTime(date)); // Greenwich apparent sidereal time, hours
  const lst = ((gast + longitude / 15) % 24 + 24) % 24;
  const ramc = lst * 15;
  const eps = meanObliquity(date) * RAD;
  const phi = latitude * RAD;
  const ramcRad = ramc * RAD;
  const asc =
    norm360(
      Math.atan2(
        Math.cos(ramcRad),
        -(Math.sin(ramcRad) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)),
      ) * DEG,
    ) || 0;
  const mc =
    norm360(Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(eps)) * DEG) || 0;
  return { asc, mc, lst };
}

export function houseFor(longitude: number, asc: number, houseSystem: HouseSystem): number {
  if (houseSystem === 'equal') {
    return (Math.floor(norm360(longitude - asc) / 30) % 12) + 1;
  }
  const ascSign = Math.floor(norm360(asc) / 30);
  const sign = Math.floor(norm360(longitude) / 30);
  return ((sign - ascSign + 12) % 12) + 1;
}

export function computeChart(input: {
  date: Date;
  latitude: number;
  longitude: number;
  houseSystem?: HouseSystem;
}): Chart {
  const { date, latitude, longitude } = input;
  const houseSystem = input.houseSystem ?? 'whole';
  const time = MakeTime(date);
  const { asc, mc } = ascendantAndMC(date, latitude, longitude);

  const positions: BodyPosition[] = BODY_KEYS.map((key) => {
    const meta = PLANETS.find((p) => p.key === key)!;
    const lon = bodyLongitude(Body[key as keyof typeof Body], time);
    const speed = norm180(bodyLongitude(Body[key as keyof typeof Body], time.AddDays(1)) - lon);
    const sign = signAt(lon);
    return {
      key,
      name: meta.name,
      glyph: meta.glyph,
      color: meta.color,
      longitude: lon,
      signIndex: Math.floor(lon / 30) % 12,
      sign,
      degree: lon % 30,
      degreeText: degreeText(lon),
      house: houseFor(lon, asc, houseSystem),
      retrograde: key !== 'Sun' && key !== 'Moon' ? speed < 0 : false,
      speed,
    };
  });

  // The mean North Node is always retrograde and sits opposite the South Node.
  const nodeMeta = PLANETS.find((p) => p.key === 'Node')!;
  const nodeLon = meanNode(date);
  const nodeSign = signAt(nodeLon);
  positions.push({
    key: 'Node',
    name: nodeMeta.name,
    glyph: nodeMeta.glyph,
    color: nodeMeta.color,
    longitude: nodeLon,
    signIndex: Math.floor(nodeLon / 30) % 12,
    sign: nodeSign,
    degree: nodeLon % 30,
    degreeText: degreeText(nodeLon),
    house: houseFor(nodeLon, asc, houseSystem),
    retrograde: true,
    speed: -0.0529,
  });

  const cusps: number[] = [];
  if (houseSystem === 'whole') {
    const ascSign = Math.floor(asc / 30);
    for (let i = 0; i < 12; i++) cusps.push(norm360((ascSign + i) * 30));
  } else {
    for (let i = 0; i < 12; i++) cusps.push(norm360(asc + i * 30));
  }

  const aspectBodies = positions.filter((p) => p.key !== 'Node');
  const aspects: ChartAspect[] = [];
  for (let i = 0; i < aspectBodies.length; i++) {
    for (let j = i + 1; j < aspectBodies.length; j++) {
      const a = aspectBodies[i]!;
      const b = aspectBodies[j]!;
      const sep = angularSeparation(a.longitude, b.longitude);
      for (const aspect of ASPECTS) {
        const orb = Math.abs(sep - aspect.angle);
        if (orb <= aspect.orb) {
          aspects.push({
            a,
            b,
            aspect,
            orb,
            strength: 1 - orb / aspect.orb,
            label: `${a.name} ${aspect.name.toLowerCase()} ${b.name}`,
          });
          break;
        }
      }
    }
  }
  aspects.sort((x, y) => x.orb - y.orb);

  const elements = [
    { name: 'Fire', color: '#ff8a5c' },
    { name: 'Earth', color: '#7fcf9d' },
    { name: 'Air', color: '#8fb8ff' },
    { name: 'Water', color: '#b79dff' },
  ].map((el) => {
    const count = aspectBodies.filter((p) => p.sign.element === el.name).length;
    return { ...el, count, pct: Math.round((count / aspectBodies.length) * 100) };
  });

  const modalities = ['Cardinal', 'Fixed', 'Mutable'].map((name) => {
    const count = aspectBodies.filter((p) => p.sign.modality === name).length;
    return { name, count, pct: Math.round((count / aspectBodies.length) * 100) };
  });

  const dominantElement = [...elements].sort((a, b) => b.count - a.count)[0]!.name;
  const dominantModality = [...modalities].sort((a, b) => b.count - a.count)[0]!.name;

  return {
    date,
    latitude,
    longitude,
    houseSystem,
    positions,
    ascendant: { longitude: asc, sign: signAt(asc), degreeText: degreeText(asc) },
    midheaven: { longitude: mc, sign: signAt(mc), degreeText: degreeText(mc) },
    cusps,
    aspects,
    balances: { elements, modalities },
    dominantElement,
    dominantModality,
  };
}

export function currentPositions(date = new Date()): BodyPosition[] {
  const time = MakeTime(date);
  return BODY_KEYS.map((key) => {
    const meta = PLANETS.find((p) => p.key === key)!;
    const lon = bodyLongitude(Body[key as keyof typeof Body], time);
    const speed = norm180(bodyLongitude(Body[key as keyof typeof Body], time.AddDays(1)) - lon);
    const sign = signAt(lon);
    return {
      key,
      name: meta.name,
      glyph: meta.glyph,
      color: meta.color,
      longitude: lon,
      signIndex: Math.floor(lon / 30) % 12,
      sign,
      degree: lon % 30,
      degreeText: degreeText(lon),
      house: 0,
      retrograde: key !== 'Sun' && key !== 'Moon' ? speed < 0 : false,
      speed,
    };
  });
}

export interface MoonNow {
  elongation: number;
  phase: MoonPhaseInfo;
  illumination: number;
  ageDays: number;
  nextNew: Date | null;
  nextFull: Date | null;
}

export function moonNow(date = new Date()): MoonNow {
  const time = MakeTime(date);
  const elongation = MoonPhase(time);
  const phase = phaseForElongation(elongation);
  const illumination = Illumination(Body.Moon, time).phase_fraction * 100;
  const nextNew = SearchMoonPhase(0, time, 40);
  const nextFull = SearchMoonPhase(180, time, 40);
  return {
    elongation,
    phase,
    illumination,
    ageDays: (elongation / 360) * 29.530588,
    nextNew: nextNew ? nextNew.date : null,
    nextFull: nextFull ? nextFull.date : null,
  };
}

export function sunSign(date = new Date()): Sign {
  return signAt(bodyLongitude(Body.Sun, MakeTime(date)));
}

export function moonSign(date = new Date()): Sign {
  return signAt(bodyLongitude(Body.Moon, MakeTime(date)));
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]!);
}

export function formatDate(date: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone,
  }).format(date);
}

export function formatDateTime(date: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
    timeZoneName: 'short',
  }).format(date);
}
