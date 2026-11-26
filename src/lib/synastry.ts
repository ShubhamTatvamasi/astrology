import type { Aspect, AspectKey } from '../data/aspects';
import { ASPECTS } from '../data/aspects';
import { PLANETS } from '../data/planets';
import {
  HOUSE_OVERLAY_MEANINGS,
  OVERLAY_HOUSES,
  PAIR_MEANINGS,
  SCORE_BANDS,
  SYNASTRY_CATEGORIES,
  type SynastryCategoryKey,
} from '../data/synastry';
import { houseFor, ordinal, type Chart } from './astrology';
import { natalPoints, type NatalPoint } from './transits';

export type SynastryTone = 'ease' | 'friction' | 'intense';

const ORBS: Record<AspectKey, number> = {
  conjunction: 7,
  sextile: 5,
  square: 6,
  trine: 6,
  opposition: 7,
};

const BASE_WEIGHTS: Record<string, number> = {
  Sun: 0.9,
  Moon: 1,
  Mercury: 0.7,
  Venus: 0.9,
  Mars: 0.85,
  Jupiter: 0.65,
  Saturn: 0.8,
  Uranus: 0.5,
  Neptune: 0.45,
  Pluto: 0.55,
  Ascendant: 0.85,
  Midheaven: 0.6,
  Node: 0.5,
};

const PLANET_PRIORITY: Record<string, number> = {
  Sun: 8,
  Moon: 10,
  Venus: 9,
  Mars: 7,
  Saturn: 6,
  Jupiter: 5,
  Pluto: 4,
  Node: 3,
  Mercury: 2,
  Uranus: 1,
  Neptune: 1,
};

const ASPECT_GUIDANCE: Record<AspectKey, string> = {
  conjunction: 'The energies merge; protect individuality inside the closeness.',
  sextile: 'A friendly opening — it grows when you actually use it.',
  square: 'Friction that asks for maturity. It is a growth edge, not a verdict.',
  trine: 'Natural ease. Do not take it for granted; keep choosing it.',
  opposition: 'A mirror. Balance two real needs instead of making one person the problem.',
};

const AREA_TO_CATEGORY: Record<string, SynastryCategoryKey[]> = {
  love: ['emotional', 'attraction'],
  career: ['commitment'],
  mind: ['communication'],
  wellbeing: ['emotional'],
  growth: ['growth'],
};

const pairKey = (a: string, b: string) => [a, b].sort().join('-');

export interface SynastryAspect {
  id: string;
  a: NatalPoint;
  b: NatalPoint;
  aspect: Aspect;
  orb: number;
  weight: number;
  tone: SynastryTone;
  categories: SynastryCategoryKey[];
  headline: string;
  body: string;
}

export interface CategoryScore {
  key: SynastryCategoryKey;
  label: string;
  glyph: string;
  color: string;
  blurb: string;
  prompt: string;
  score: number;
  summary: string;
  aspects: SynastryAspect[];
}

export interface HouseOverlay {
  id: string;
  side: 'a-in-b' | 'b-in-a';
  planet: string;
  glyph: string;
  house: number;
  text: string;
  priority: number;
}

export interface SynastryReport {
  overall: number;
  band: (typeof SCORE_BANDS)[number];
  summary: string;
  categories: CategoryScore[];
  aspects: SynastryAspect[];
  strengths: SynastryAspect[];
  growth: SynastryAspect[];
  overlays: HouseOverlay[];
  prompts: string[];
  sameChart: boolean;
  timeUnknown: boolean;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toneFor = (aspect: AspectKey): SynastryTone => {
  if (aspect === 'conjunction') return 'intense';
  if (aspect === 'sextile' || aspect === 'trine') return 'ease';
  return 'friction';
};

const categoriesFor = (a: NatalPoint, b: NatalPoint): SynastryCategoryKey[] => {
  const pair = PAIR_MEANINGS[pairKey(a.name, b.name)];
  if (pair) return pair.categories;
  const result = new Set<SynastryCategoryKey>();
  a.areas.forEach((area) => (AREA_TO_CATEGORY[area] ?? []).forEach((cat) => result.add(cat)));
  b.areas.forEach((area) => (AREA_TO_CATEGORY[area] ?? []).forEach((cat) => result.add(cat)));
  if (result.size === 0) result.add('growth');
  return [...result];
};

const weightFor = (a: NatalPoint, b: NatalPoint): number => {
  const pair = PAIR_MEANINGS[pairKey(a.name, b.name)];
  if (pair) return pair.weight;
  return Math.min(1.1, (BASE_WEIGHTS[a.key] ?? 0.4) * (BASE_WEIGHTS[b.key] ?? 0.4) * 1.35);
};

const aspectBody = (a: NatalPoint, b: NatalPoint, aspect: Aspect): string => {
  const pair = PAIR_MEANINGS[pairKey(a.name, b.name)];
  const base = pair?.text ?? `A contact between your ${a.name} and their ${b.name}.`;
  return `${base} ${ASPECT_GUIDANCE[aspect.key]}`;
};

export function buildSynastry(
  chartA: Chart,
  chartB: Chart,
  options: { timeUnknownA?: boolean; timeUnknownB?: boolean } = {},
): SynastryReport {
  const pointsA = natalPoints(chartA);
  const pointsB = natalPoints(chartB);
  const aspects: SynastryAspect[] = [];

  for (const a of pointsA) {
    for (const b of pointsB) {
      for (const aspect of ASPECTS) {
        const separation = Math.abs(((a.longitude - b.longitude + 540) % 360) - 180);
        const orb = Math.abs(separation - aspect.angle);
        const limit = ORBS[aspect.key];
        if (orb > limit) continue;
        const weight = weightFor(a, b);
        const orbFactor = 1 - orb / limit;
        aspects.push({
          id: `${a.key}-${b.key}-${aspect.key}`,
          a,
          b,
          aspect,
          orb,
          weight: weight * orbFactor,
          tone: toneFor(aspect.key),
          categories: categoriesFor(a, b),
          headline: `Your ${a.name} ${aspect.name.toLowerCase()} their ${b.name}`,
          body: aspectBody(a, b, aspect),
        });
        break;
      }
    }
  }

  aspects.sort((a, b) => b.weight - a.weight);

  const categories: CategoryScore[] = SYNASTRY_CATEGORIES.map((category) => {
    const relevant = aspects.filter((aspect) => aspect.categories.includes(category.key));
    let positive = 0;
    let tension = 0;
    for (const aspect of relevant) {
      if (aspect.tone === 'ease') positive += aspect.weight;
      else if (aspect.tone === 'friction') tension += aspect.weight;
      else {
        positive += aspect.weight * 0.45;
        tension += aspect.weight * 0.3;
      }
    }
    const raw = 50 + 35 * Math.tanh((positive - tension * 0.8) / 1.9);
    const score = Math.round(clamp(raw, 8, 96));
    const top = relevant[0] ?? null;
    const summary = top
      ? `${top.headline}. ${PAIR_MEANINGS[pairKey(top.a.name, top.b.name)]?.text ?? ''} ${ASPECT_GUIDANCE[top.aspect.key]}`
      : 'No major contact in this area. That is not a failure — it is simply a quieter part of the map.';
    return {
      key: category.key,
      label: category.label,
      glyph: category.glyph,
      color: category.color,
      blurb: category.blurb,
      prompt: category.prompt,
      score,
      summary,
      aspects: relevant.slice(0, 3),
    };
  });

  const overall = Math.round(
    categories.reduce((sum, category) => {
      const definition = SYNASTRY_CATEGORIES.find((item) => item.key === category.key)!;
      return sum + category.score * definition.weight;
    }, 0),
  );

  const sortedCategories = [...categories].sort((a, b) => b.score - a.score);
  const topCategory = sortedCategories[0] ?? categories[0]!;
  const lowCategory = sortedCategories[sortedCategories.length - 1] ?? categories[0]!;
  const band = SCORE_BANDS.find((item) => overall >= item.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1]!;
  const signature = aspects[0] ?? null;

  const summary = aspects.length
    ? `Your charts show ${band.label.toLowerCase()}. The strongest thread is ${topCategory.label.toLowerCase()}; the most growth is in ${lowCategory.label.toLowerCase()}. ${signature ? `${signature.headline} is the signature contact.` : ''}`
    : 'No major inter-aspects were found within orb. A quiet chart is not a failed match; it means the connection is not defined by obvious planetary chemistry.';

  const strengths = aspects
    .filter((aspect) => aspect.tone === 'ease')
    .slice(0, 4);
  const growth = aspects
    .filter((aspect) => aspect.tone === 'friction' || aspect.tone === 'intense')
    .slice(0, 4);

  const overlays: HouseOverlay[] = [];
  const addOverlays = (from: Chart, to: Chart, side: HouseOverlay['side']) => {
    const fromLabel = side === 'a-in-b' ? 'Your' : 'Their';
    const toLabel = side === 'a-in-b' ? 'their' : 'your';
    for (const position of from.positions) {
      if (!PLANETS.some((planet) => planet.key === position.key)) continue;
      const house = houseFor(position.longitude, to.ascendant.longitude, to.houseSystem);
      if (!OVERLAY_HOUSES.includes(house)) continue;
      overlays.push({
        id: `${side}-${position.key}`,
        side,
        planet: position.name,
        glyph: position.glyph,
        house,
        text: `${fromLabel} ${position.name} lands in ${toLabel} ${ordinal(house)} house — ${HOUSE_OVERLAY_MEANINGS[house]}.`,
        priority: (PLANET_PRIORITY[position.key] ?? 1) + (house === 7 ? 4 : house === 8 ? 3 : 0),
      });
    }
  };
  addOverlays(chartA, chartB, 'a-in-b');
  addOverlays(chartB, chartA, 'b-in-a');
  overlays.sort((a, b) => b.priority - a.priority);
  const overlayA = overlays.filter((overlay) => overlay.side === 'a-in-b').slice(0, 3);
  const overlayB = overlays.filter((overlay) => overlay.side === 'b-in-a').slice(0, 3);
  const balancedOverlays = [...overlayA, ...overlayB];

  const lowPrompts = sortedCategories
    .slice(-2)
    .reverse()
    .map((category) => category.prompt);

  const sameChart =
    Math.abs(chartA.ascendant.longitude - chartB.ascendant.longitude) < 0.2 &&
    Math.abs((chartA.positions[0]?.longitude ?? 0) - (chartB.positions[0]?.longitude ?? 0)) < 0.2 &&
    Math.abs((chartA.positions[1]?.longitude ?? 0) - (chartB.positions[1]?.longitude ?? 0)) < 0.2;

  return {
    overall,
    band,
    summary,
    categories,
    aspects,
    strengths,
    growth,
    overlays: balancedOverlays,
    prompts: lowPrompts,
    sameChart,
    timeUnknown: Boolean(options.timeUnknownA || options.timeUnknownB),
  };
}
