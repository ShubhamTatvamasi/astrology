import type { Chart } from './astrology';
import { norm360 } from './astrology';
import {
  GANA_MATRIX,
  KOOTAS,
  NAKSHATRAS,
  PLANET_FRIENDSHIP,
  RASHIS,
  TARA_FAVOURABLE,
  TARA_NAMES,
  VARNA_RANK,
  VASHYA_MATRIX,
  VEDIC_SCORE_BANDS,
  YONI_ANIMALS,
  YONI_MATRIX,
  type Gana,
  type Nadi,
  type RashiInfo,
  type Varna,
  type Vashya,
  type Yoni,
} from '../data/vedic';

export type VedicRoleOrder = 'a-bride' | 'b-bride';

export interface VedicProfile {
  moonTropical: number;
  ayanamsa: number;
  siderealMoon: number;
  rashi: RashiInfo;
  nakshatra: (typeof NAKSHATRAS)[number];
  nakshatraIndex: number;
  pada: number;
  degreeInRashi: number;
  varna: Varna;
  vashya: Vashya;
  gana: Gana;
  nadi: Nadi;
  yoni: Yoni;
}

export interface VedicKoota {
  key: string;
  label: string;
  max: number;
  score: number;
  ratio: number;
  checks: string;
  detail: string;
}

export interface VedicMatch {
  bride: VedicProfile;
  groom: VedicProfile;
  order: VedicRoleOrder;
  total: number;
  max: number;
  band: (typeof VEDIC_SCORE_BANDS)[number];
  kootas: VedicKoota[];
  doshas: string[];
  strongest: VedicKoota;
  weakest: VedicKoota;
  summary: string;
}

export function lahiriAyanamsa(date: Date): number {
  const year = date.getUTCFullYear();
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  const fraction = (date.getTime() - start) / (end - start);
  return 23.85 + 0.013972 * (year - 2000 + fraction);
}

export function vashyaFor(rashiIndex: number, degreeInRashi: number): Vashya {
  switch (rashiIndex) {
    case 0:
    case 1:
      return 'Chatushpada';
    case 2:
    case 5:
    case 6:
    case 10:
      return 'Manav';
    case 3:
    case 11:
      return 'Jalchar';
    case 4:
      return 'Vanchar';
    case 7:
      return 'Keet';
    case 8:
      return degreeInRashi < 15 ? 'Manav' : 'Chatushpada';
    case 9:
      return degreeInRashi < 15 ? 'Chatushpada' : 'Jalchar';
    default:
      return 'Manav';
  }
}

export function vedicProfile(chart: Chart, date: Date): VedicProfile {
  const moon = chart.positions.find((position) => position.key === 'Moon')!;
  const ayanamsa = lahiriAyanamsa(date);
  const siderealMoon = norm360(moon.longitude - ayanamsa);
  const rashiIndex = Math.floor(siderealMoon / 30) % 12;
  const rashi = RASHIS[rashiIndex]!;
  const degreeInRashi = siderealMoon % 30;
  const nakshatraIndex = Math.floor(siderealMoon / (360 / 27)) % 27;
  const nakshatra = NAKSHATRAS[nakshatraIndex]!;
  const nakshatraSpan = 360 / 27;
  const pada = Math.floor((siderealMoon % nakshatraSpan) / (nakshatraSpan / 4)) + 1;

  return {
    moonTropical: moon.longitude,
    ayanamsa,
    siderealMoon,
    rashi,
    nakshatra,
    nakshatraIndex,
    pada,
    degreeInRashi,
    varna: rashi.varna,
    vashya: vashyaFor(rashiIndex, degreeInRashi),
    gana: nakshatra.gana as Gana,
    nadi: nakshatra.nadi as Nadi,
    yoni: nakshatra.yoni as Yoni,
  };
}

function taraNumber(from: number, to: number): number {
  const count = ((to - from + 27) % 27) + 1;
  return count % 9 || 9;
}

function bhakootScore(bride: VedicProfile, groom: VedicProfile): { score: number; detail: string } {
  const brideRashi = bride.rashi.index;
  const groomRashi = groom.rashi.index;
  const forward = ((groomRashi - brideRashi + 12) % 12) + 1;
  const reverse = ((brideRashi - groomRashi + 12) % 12) + 1;
  const pair = [forward, reverse].sort((a, b) => a - b);
  const dosha =
    (pair[0] === 2 && pair[1] === 12) ||
    (pair[0] === 5 && pair[1] === 9) ||
    (pair[0] === 6 && pair[1] === 8);
  return {
    score: dosha ? 0 : 7,
    detail: dosha
      ? `${forward}-${reverse} Bhakoot dosha (${bride.rashi.name} / ${groom.rashi.name})`
      : `${forward}-${reverse} Bhakoot (${bride.rashi.name} / ${groom.rashi.name})`,
  };
}

function grahaFriendshipScore(bride: VedicProfile, groom: VedicProfile): { score: number; detail: string } {
  const a = bride.rashi.lord;
  const b = groom.rashi.lord;
  if (a === b) return { score: 5, detail: `Same Moon-sign lord: ${a}` };
  const ab = PLANET_FRIENDSHIP[a]?.[b] ?? 1;
  const ba = PLANET_FRIENDSHIP[b]?.[a] ?? 1;
  const pair = [ab, ba].sort((x, y) => y - x);
  let score = 0;
  if (pair[0] === 2 && pair[1] === 2) score = 5;
  else if (pair[0] === 2 && pair[1] === 1) score = 4;
  else if (pair[0] === 1 && pair[1] === 1) score = 3;
  else if (pair[0] === 2 && pair[1] === 0) score = 1;
  else if (pair[0] === 1 && pair[1] === 0) score = 0.5;
  const relation = (value: number) => (value === 2 ? 'friend' : value === 1 ? 'neutral' : 'enemy');
  return {
    score,
    detail: `${a} (${relation(ab)} to ${b}) / ${b} (${relation(ba)} to ${a})`,
  };
}

export function buildVedicMatch(
  chartA: Chart,
  chartB: Chart,
  dateA: Date,
  dateB: Date,
  order: VedicRoleOrder = 'a-bride',
): VedicMatch {
  const profileA = vedicProfile(chartA, dateA);
  const profileB = vedicProfile(chartB, dateB);
  const bride = order === 'a-bride' ? profileA : profileB;
  const groom = order === 'a-bride' ? profileB : profileA;

  const varnaScore = VARNA_RANK[groom.varna] >= VARNA_RANK[bride.varna] ? 1 : 0;
  const vashyaScore = VASHYA_MATRIX[groom.vashya][bride.vashya];
  const brideToGroom = taraNumber(bride.nakshatraIndex, groom.nakshatraIndex);
  const groomToBride = taraNumber(groom.nakshatraIndex, bride.nakshatraIndex);
  const taraScore =
    (TARA_FAVOURABLE.has(brideToGroom) ? 1.5 : 0) +
    (TARA_FAVOURABLE.has(groomToBride) ? 1.5 : 0);
  const yoniScore = YONI_MATRIX[YONI_ANIMALS.indexOf(groom.yoni)]![YONI_ANIMALS.indexOf(bride.yoni)]!;
  const graha = grahaFriendshipScore(bride, groom);
  const ganaScore = GANA_MATRIX[bride.gana][groom.gana];
  const bhakoot = bhakootScore(bride, groom);
  const nadiScore = bride.nadi === groom.nadi ? 0 : 8;

  const details: Record<string, string> = {
    varna: `Bride ${bride.varna} / groom ${groom.varna}`,
    vashya: `Bride ${bride.vashya} / groom ${groom.vashya}`,
    tara: `${TARA_NAMES[brideToGroom - 1]} → ${TARA_NAMES[groomToBride - 1]}`,
    yoni: `Bride ${bride.yoni} / groom ${groom.yoni}`,
    graha: graha.detail,
    gana: `Bride ${bride.gana} / groom ${groom.gana}`,
    bhakoot: bhakoot.detail,
    nadi: bride.nadi === groom.nadi ? `Both ${bride.nadi} Nadi` : `Bride ${bride.nadi} / groom ${groom.nadi}`,
  };
  const scores: Record<string, number> = {
    varna: varnaScore,
    vashya: vashyaScore,
    tara: taraScore,
    yoni: yoniScore,
    graha: graha.score,
    gana: ganaScore,
    bhakoot: bhakoot.score,
    nadi: nadiScore,
  };

  const kootas: VedicKoota[] = KOOTAS.map((koota) => {
    const score = scores[koota.key] ?? 0;
    return {
      key: koota.key,
      label: koota.label,
      max: koota.max,
      score,
      ratio: score / koota.max,
      checks: koota.checks,
      detail: details[koota.key] ?? '',
    };
  });

  const total = kootas.reduce((sum, koota) => sum + koota.score, 0);
  const band = VEDIC_SCORE_BANDS.find((item) => total >= item.min) ?? VEDIC_SCORE_BANDS[VEDIC_SCORE_BANDS.length - 1]!;
  const strongest = [...kootas].sort((a, b) => b.ratio - a.ratio)[0] ?? kootas[0]!;
  const weakest = [...kootas].sort((a, b) => a.ratio - b.ratio)[0] ?? kootas[0]!;
  const doshas = [
    nadiScore === 0 ? 'Nadi dosha' : '',
    bhakoot.score === 0 ? 'Bhakoot dosha' : '',
    ganaScore === 0 ? 'Gana dosha' : '',
    vashyaScore === 0 ? 'Vashya dosha' : '',
  ].filter(Boolean);

  return {
    bride,
    groom,
    order,
    total: Math.round(total * 10) / 10,
    max: 36,
    band,
    kootas,
    doshas,
    strongest,
    weakest,
    summary: `${bride.nakshatra.name} bride and ${groom.nakshatra.name} groom: ${Math.round(total * 10) / 10}/36 (${band.label}). ${strongest.label} is the strongest factor; ${weakest.label} asks for the most attention.`,
  };
}
