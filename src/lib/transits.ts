import { Body, MakeTime, SearchMoonPhase } from 'astronomy-engine';
import type { Aspect, AspectKey } from '../data/aspects';
import { ASPECTS } from '../data/aspects';
import { HOUSES, type House } from '../data/houses';
import { phaseForElongation } from '../data/moons';
import { PLANETS, type PlanetKey } from '../data/planets';
import type { Sign } from '../data/signs';
import {
  ASPECT_TRANSIT_GUIDANCE,
  HOUSE_LIFE_AREAS,
  LIFE_AREAS,
  NATAL_DOMAINS,
  TRANSIT_PROFILES,
  lifeAreaByKey,
  type LifeAreaKey,
} from '../data/transits';
import {
  angularSeparation,
  bodyLongitude,
  currentPositions,
  houseFor,
  moonNow,
  moonSign,
  norm180,
  norm360,
  ordinal,
  signAt,
  sunSign,
  type BodyPosition,
  type Chart,
  type MoonNow,
} from './astrology';

export type ForecastRange = 1 | 7 | 30;
export type WeatherTone = 'ease' | 'growth' | 'intensity' | 'reflect' | 'quiet';

const DAY = 86_400_000;

const TRANSIT_ORBS: Record<AspectKey, number> = {
  conjunction: 5,
  sextile: 3,
  square: 4,
  trine: 4,
  opposition: 5,
};

const LOOK_ORB = 8;

const PLANET_WEIGHTS: Record<Exclude<PlanetKey, 'Node'>, number> = {
  Sun: 1,
  Moon: 0.55,
  Mercury: 0.7,
  Venus: 0.85,
  Mars: 0.85,
  Jupiter: 0.9,
  Saturn: 0.95,
  Uranus: 0.75,
  Neptune: 0.65,
  Pluto: 0.85,
};

const ASPECT_WEIGHTS: Record<AspectKey, number> = {
  conjunction: 1,
  sextile: 0.6,
  square: 0.85,
  trine: 0.85,
  opposition: 0.9,
};

const SAMPLE_STEP: Record<Exclude<PlanetKey, 'Node'>, number> = {
  Sun: 0.25,
  Moon: 0.25,
  Mercury: 0.25,
  Venus: 0.25,
  Mars: 0.25,
  Jupiter: 1,
  Saturn: 1,
  Uranus: 1,
  Neptune: 1,
  Pluto: 1,
};

export interface NatalPoint {
  key: string;
  name: string;
  glyph: string;
  longitude: number;
  sign: Sign;
  degreeText: string;
  house: number;
  color: string;
  domain: string;
  areas: LifeAreaKey[];
}

export interface TransitAspect {
  id: string;
  transit: BodyPosition;
  natal: NatalPoint;
  aspect: Aspect;
  orb: number;
  applying: boolean;
  upcoming: boolean;
  retrograde: boolean;
  exactDate: Date | null;
  daysToExact: number | null;
  strength: number;
  house: number;
  houseInfo: House;
  tone: 'ease' | 'growth' | 'intensity' | 'reflect';
  headline: string;
  body: string;
  advice: string;
  release: string;
  lifeAreas: LifeAreaKey[];
}

export interface LifeAreaForecast {
  key: LifeAreaKey;
  label: string;
  short: string;
  glyph: string;
  color: string;
  weather: WeatherTone;
  weatherLabel: string;
  signal: number;
  summary: string;
  prompt: string;
  aspects: TransitAspect[];
}

export interface ForecastEvent {
  id: string;
  date: Date;
  kind: 'aspect' | 'station' | 'ingress' | 'moon';
  title: string;
  detail: string;
  glyph: string;
  color: string;
  intensity: number;
}

export interface Forecast {
  chart: Chart;
  now: Date;
  range: ForecastRange;
  moon: MoonNow;
  moonSign: Sign;
  sunSign: Sign;
  retrogrades: BodyPosition[];
  aspects: TransitAspect[];
  lifeAreas: LifeAreaForecast[];
  timeline: ForecastEvent[];
  topAspect: TransitAspect | null;
  headline: string;
  summary: string;
  doThis: string;
  releaseThis: string;
  journal: string;
}

interface Sample {
  date: Date;
  lon: number;
}

interface ExactHit {
  date: Date;
  distance: number;
}

const PLANET_KEYS: Exclude<PlanetKey, 'Node'>[] = [
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

const bodyFor = (key: Exclude<PlanetKey, 'Node'>): Body => Body[key as keyof typeof Body] as Body;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const round = (value: number) => Math.round(value);

const plusDays = (date: Date, days: number) => new Date(date.getTime() + days * DAY);

const shortDate = (date: Date) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);

const dayDistance = (a: Date, b: Date) => (a.getTime() - b.getTime()) / DAY;

const domainFor = (key: string) =>
  NATAL_DOMAINS[key] ?? { phrase: 'an important part of your chart', areas: [] as LifeAreaKey[] };

export function natalPoints(chart: Chart): NatalPoint[] {
  const points: NatalPoint[] = chart.positions.map((position) => {
    const domain = domainFor(position.key);
    return {
      key: position.key,
      name: position.name,
      glyph: position.glyph,
      longitude: position.longitude,
      sign: position.sign,
      degreeText: position.degreeText,
      house: position.house,
      color: position.color,
      domain: domain.phrase,
      areas: domain.areas,
    };
  });

  const ascDomain = domainFor('Ascendant');
  points.push({
    key: 'Ascendant',
    name: 'Ascendant',
    glyph: 'ASC',
    longitude: chart.ascendant.longitude,
    sign: chart.ascendant.sign,
    degreeText: chart.ascendant.degreeText,
    house: 1,
    color: '#e8c47c',
    domain: ascDomain.phrase,
    areas: ascDomain.areas,
  });

  const mcDomain = domainFor('Midheaven');
  points.push({
    key: 'Midheaven',
    name: 'Midheaven',
    glyph: 'MC',
    longitude: chart.midheaven.longitude,
    sign: chart.midheaven.sign,
    degreeText: chart.midheaven.degreeText,
    house: 10,
    color: '#e8c47c',
    domain: mcDomain.phrase,
    areas: mcDomain.areas,
  });

  return points;
}

function sampleSeries(
  key: Exclude<PlanetKey, 'Node'>,
  start: Date,
  horizonDays: number,
): Sample[] {
  const step = SAMPLE_STEP[key];
  const time = MakeTime(start);
  const count = Math.ceil(horizonDays / step);
  const samples: Sample[] = [];
  for (let i = 0; i <= count; i++) {
    const date = plusDays(start, i * step);
    samples.push({ date, lon: bodyLongitude(bodyFor(key), time.AddDays(i * step)) });
  }
  return samples;
}

function nearestExact(
  samples: Sample[],
  natalLongitude: number,
  aspectAngle: number,
): ExactHit | null {
  let best: ExactHit | null = null;
  for (const sample of samples) {
    const distance = Math.abs(angularSeparation(sample.lon, natalLongitude) - aspectAngle);
    if (!best || distance < best.distance) best = { date: sample.date, distance };
  }
  return best && best.distance <= 0.3 ? best : null;
}

function areasFor(
  transitKey: Exclude<PlanetKey, 'Node'>,
  natal: NatalPoint,
  house: number,
): LifeAreaKey[] {
  const scores = new Map<LifeAreaKey, number>();
  const add = (area: LifeAreaKey, weight: number) =>
    scores.set(area, (scores.get(area) ?? 0) + weight);

  TRANSIT_PROFILES[transitKey].areas.forEach((area) => add(area, 2));
  natal.areas.forEach((area) => add(area, 2));
  (HOUSE_LIFE_AREAS[house] ?? []).forEach((area) => add(area, 1));

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([area]) => area);
}

function aspectBody(
  transit: BodyPosition,
  natal: NatalPoint,
  aspect: Aspect,
  houseInfo: House,
  applying: boolean,
  exactDate: Date | null,
  daysToExact: number | null,
): { headline: string; body: string; advice: string; release: string } {
  const profile = TRANSIT_PROFILES[transit.key as Exclude<PlanetKey, 'Node'>];
  const guidance = ASPECT_TRANSIT_GUIDANCE[aspect.key]!;
  const movement = applying
    ? exactDate
      ? `It is applying, with the exact hit around ${shortDate(exactDate)}. The theme is building.`
      : 'It is applying; the theme is building.'
    : exactDate && daysToExact !== null && daysToExact <= 1
      ? `It is at its peak around ${shortDate(exactDate)}. Let the moment land.`
      : exactDate
        ? `It is separating now; the next exact pass is around ${shortDate(exactDate)}. Integrate what has already surfaced.`
        : 'It is separating now; integrate what has already surfaced. The theme is still in the air, but it is no longer building.';

  const retro = transit.retrograde
    ? `${transit.name} is retrograde, so this theme is turned inward: review, revise, and listen before acting.`
    : '';

  return {
    headline: `${transit.name} ${guidance.verb} your natal ${natal.name}`,
    body: [
      `${transit.name} ${guidance.verb} your natal ${natal.name}, bringing ${profile.theme} into ${natal.domain}.`,
      profile.gift,
      `The arena is your ${ordinal(houseInfo.number)} house of ${houseInfo.domain.toLowerCase()}.`,
      guidance.guidance,
      movement,
      retro,
    ]
      .filter(Boolean)
      .join(' '),
    advice: profile.gift,
    release: profile.watch,
  };
}

export function buildForecast(
  chart: Chart,
  now: Date = new Date(),
  range: ForecastRange = 1,
): Forecast {
  const horizon = Math.max(30, range + 2);
  const time = MakeTime(now);
  const transits = currentPositions(now);
  const points = natalPoints(chart);
  const moon = moonNow(now);
  const moonSignNow = moonSign(now);
  const sunSignNow = sunSign(now);

  const series = new Map<Exclude<PlanetKey, 'Node'>, Sample[]>();
  for (const key of PLANET_KEYS) {
    if (key === 'Moon') continue;
    series.set(key, sampleSeries(key, now, horizon));
  }

  const exactHits = new Map<string, ExactHit>();
  for (const transit of transits) {
    const key = transit.key as Exclude<PlanetKey, 'Node'>;
    if (key === 'Moon') continue;
    const samples = series.get(key)!;
    for (const natal of points) {
      for (const aspect of ASPECTS) {
        const hit = nearestExact(samples, natal.longitude, aspect.angle);
        if (hit) exactHits.set(`${transit.key}-${natal.key}-${aspect.key}`, hit);
      }
    }
  }

  const futureStep = (key: Exclude<PlanetKey, 'Node'>) =>
    key === 'Mercury' || key === 'Venus' || key === 'Mars' ? 0.25 : 0.5;

  const aspects: TransitAspect[] = [];
  for (const transit of transits) {
    const key = transit.key as Exclude<PlanetKey, 'Node'>;
    const house = houseFor(transit.longitude, chart.ascendant.longitude, chart.houseSystem);
    const houseInfo = HOUSES[house - 1]!;
    const futureLon = bodyLongitude(bodyFor(key), time.AddDays(futureStep(key)));

    for (const natal of points) {
      for (const aspect of ASPECTS) {
        const separation = angularSeparation(transit.longitude, natal.longitude);
        const orb = Math.abs(separation - aspect.angle);
        const tightOrb = TRANSIT_ORBS[aspect.key];
        const id = `${transit.key}-${natal.key}-${aspect.key}`;
        const hit = exactHits.get(id) ?? null;
        const daysToExact = hit ? dayDistance(hit.date, now) : null;
        const upcoming =
          Boolean(hit) &&
          orb > tightOrb &&
          (daysToExact ?? Number.POSITIVE_INFINITY) >= 0 &&
          (daysToExact ?? Number.POSITIVE_INFINITY) <= range;

        if (orb > tightOrb && !(upcoming && orb <= LOOK_ORB)) continue;

        const futureDistance = Math.abs(
          angularSeparation(futureLon, natal.longitude) - aspect.angle,
        );
        const currentDistance = Math.abs(separation - aspect.angle);
        const applying = futureDistance < currentDistance - 0.00001;
        const orbFactor = clamp(1 - orb / LOOK_ORB, 0, 1);
        const strength = clamp(
          PLANET_WEIGHTS[key] *
            ASPECT_WEIGHTS[aspect.key] *
            orbFactor *
            (applying ? 1.08 : 0.96),
          0,
          1,
        );
        const guidance = ASPECT_TRANSIT_GUIDANCE[aspect.key]!;
        const tone: TransitAspect['tone'] = transit.retrograde ? 'reflect' : guidance.tone;
        const lifeAreas = areasFor(key, natal, house);
        const narrative = aspectBody(
          transit,
          natal,
          aspect,
          houseInfo,
          applying,
          hit?.date ?? null,
          daysToExact,
        );

        aspects.push({
          id,
          transit,
          natal,
          aspect,
          orb,
          applying,
          upcoming,
          retrograde: transit.retrograde,
          exactDate: hit?.date ?? null,
          daysToExact,
          strength,
          house,
          houseInfo,
          tone,
          headline: narrative.headline,
          body: narrative.body,
          advice: narrative.advice,
          release: narrative.release,
          lifeAreas,
        });
      }
    }
  }

  aspects.sort((a, b) => {
    if (a.upcoming !== b.upcoming) return a.upcoming ? 1 : -1;
    if (a.upcoming && b.upcoming) {
      return (a.daysToExact ?? 99) - (b.daysToExact ?? 99);
    }
    return b.strength - a.strength;
  });

  const usedTopAspects = new Set<string>();
  const lifeAreas: LifeAreaForecast[] = LIFE_AREAS.map((area) => {
    const relevant = aspects
      .filter((aspect) => aspect.lifeAreas.includes(area.key))
      .sort((a, b) => b.strength - a.strength);
    const top = relevant.find((aspect) => !usedTopAspects.has(aspect.id)) ?? relevant[0] ?? null;
    if (top) usedTopAspects.add(top.id);
    const ordered = top ? [top, ...relevant.filter((aspect) => aspect.id !== top.id)] : [];
    const second = ordered[1] ?? null;
    const signal = top
      ? round(clamp((top.strength * 0.78 + (second?.strength ?? 0) * 0.22) * 100, 5, 96))
      : 0;
    const weather: WeatherTone = top ? top.tone : 'quiet';
    let summary: string;
    if (top) {
      const prefix = top.upcoming ? 'Building: ' : '';
      const toneLine =
        top.tone === 'ease'
          ? 'Use the opening.'
          : top.tone === 'growth'
            ? 'Let the friction refine the approach.'
            : top.tone === 'intensity'
              ? 'Give it a container so it does not become everything.'
              : 'Turn the volume down and listen before acting.';
      summary = `${prefix}${top.transit.name} ${top.aspect.name.toLowerCase()} your natal ${top.natal.name}. ${top.advice} ${toneLine} Your ${ordinal(top.houseInfo.number)} house of ${top.houseInfo.domain.toLowerCase()} is the arena.`;
    } else {
      summary =
        'No major transit is activating this area in the selected window. That is not bad news — it is space to choose without pressure.';
    }
    return {
      key: area.key,
      label: area.label,
      short: area.short,
      glyph: area.glyph,
      color: area.color,
      weather,
      weatherLabel: weather === 'quiet' ? 'Quiet' : weather === 'ease' ? 'Open' : weather === 'growth' ? 'In motion' : weather === 'intensity' ? 'Charged' : 'Reflective',
      signal,
      summary,
      prompt: area.prompt,
      aspects: ordered.slice(0, 3),
    };
  });

  const timelineHorizon = range === 1 ? 3 : range;
  const timeline: ForecastEvent[] = [];

  for (const [id, hit] of exactHits) {
    const days = dayDistance(hit.date, now);
    if (days < -0.01 || days > timelineHorizon) continue;
    const [transitKey, natalKey, aspectKey] = id.split('-');
    const transit = transits.find((item) => item.key === transitKey);
    const natal = points.find((item) => item.key === natalKey);
    const aspect = ASPECTS.find((item) => item.key === aspectKey);
    if (!transit || !natal || !aspect) continue;
    const house = houseFor(transit.longitude, chart.ascendant.longitude, chart.houseSystem);
    const houseInfo = HOUSES[house - 1]!;
    timeline.push({
      id: `aspect-${id}`,
      date: hit.date,
      kind: 'aspect',
      title: `${transit.name} ${aspect.name.toLowerCase()} natal ${natal.name}`,
      detail: `Brings ${TRANSIT_PROFILES[transitKey as Exclude<PlanetKey, 'Node'>].theme} into ${natal.domain} through your ${ordinal(houseInfo.number)} house.`,
      glyph: transit.glyph,
      color: aspect.color,
      intensity: 2 + clamp(hit.distance, 0, 0.3),
    });
  }

  // Daily series are also used for stations and ingresses.
  const daily = new Map<Exclude<PlanetKey, 'Node'>, number[]>();
  for (const key of PLANET_KEYS) {
    const values: number[] = [];
    for (let i = 0; i <= horizon + 1; i++) {
      values.push(bodyLongitude(bodyFor(key), time.AddDays(i)));
    }
    daily.set(key, values);
  }

  for (const key of ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'] as const) {
    const values = daily.get(key)!;
    for (let i = 1; i < horizon + 1; i++) {
      const days = i;
      if (days > timelineHorizon) break;
      const before = norm180(values[i]! - values[i - 1]!);
      const after = norm180(values[i + 1]! - values[i]!);
      const profile = TRANSIT_PROFILES[key];
      if (before > 0 && after < 0) {
        timeline.push({
          id: `station-retro-${key}-${i}`,
          date: plusDays(now, i),
          kind: 'station',
          title: `${PLANETS.find((p) => p.key === key)!.name} stations retrograde`,
          detail: `The theme turns inward: ${profile.watch}`,
          glyph: PLANETS.find((p) => p.key === key)!.glyph,
          color: '#f3a7b8',
          intensity: 2.4,
        });
      } else if (before < 0 && after > 0) {
        timeline.push({
          id: `station-direct-${key}-${i}`,
          date: plusDays(now, i),
          kind: 'station',
          title: `${PLANETS.find((p) => p.key === key)!.name} stations direct`,
          detail: `The atmosphere begins to move again: ${profile.gift}`,
          glyph: PLANETS.find((p) => p.key === key)!.glyph,
          color: '#7fcf9d',
          intensity: 2.2,
        });
      }
    }
  }

  for (const key of ['Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'] as const) {
    const values = daily.get(key)!;
    for (let i = 1; i < horizon + 1; i++) {
      const days = i;
      if (days > timelineHorizon) break;
      const prevSign = Math.floor(norm360(values[i - 1]!) / 30);
      const nextSign = Math.floor(norm360(values[i]!) / 30);
      if (prevSign !== nextSign) {
        const sign = signAt(values[i]!);
        timeline.push({
          id: `ingress-${key}-${i}`,
          date: plusDays(now, i),
          kind: 'ingress',
          title: `${PLANETS.find((p) => p.key === key)!.name} enters ${sign.name}`,
          detail: `A new tone for ${TRANSIT_PROFILES[key].theme}.`,
          glyph: sign.glyph,
          color: '#e8c47c',
          intensity: 1.8,
        });
      }
    }
  }

  const phaseTargets = [
    { angle: 0, label: 'New Moon' },
    { angle: 90, label: 'First Quarter' },
    { angle: 180, label: 'Full Moon' },
    { angle: 270, label: 'Last Quarter' },
  ];
  for (const target of phaseTargets) {
    const found = SearchMoonPhase(target.angle, time, horizon + 1);
    if (!found) continue;
    const days = dayDistance(found.date, now);
    if (days < -0.01 || days > timelineHorizon) continue;
    const phase = phaseForElongation(target.angle);
    timeline.push({
      id: `moon-${target.angle}-${found.date.toISOString()}`,
      date: found.date,
      kind: 'moon',
      title: target.label,
      detail: phase.invitation,
      glyph: '☽',
      color: '#e8c47c',
      intensity: 2.1,
    });
  }

  timeline.sort((a, b) => a.date.getTime() - b.date.getTime());
  const uniqueTimeline = timeline.filter(
    (event, index, list) => list.findIndex((item) => item.id === event.id) === index,
  );

  const topAspect = aspects[0] ?? null;
  const focusArea = topAspect?.lifeAreas[0] ? lifeAreaByKey(topAspect.lifeAreas[0]) : LIFE_AREAS[0]!;
  const rangeWord = range === 1 ? 'today' : range === 7 ? 'this week' : 'this month';
  const headline = topAspect
    ? `${topAspect.transit.name} ${topAspect.aspect.name.toLowerCase()} your natal ${topAspect.natal.name}`
    : `${moon.phase.name} in ${moonSignNow.name}`;
  const summary = [
    `${moon.phase.name} in ${moonSignNow.name} sets the emotional tone for ${rangeWord}.`,
    topAspect
      ? `${topAspect.transit.name} is ${topAspect.applying ? 'building toward' : 'moving through'} an aspect to your natal ${topAspect.natal.name}, bringing ${TRANSIT_PROFILES[topAspect.transit.key as Exclude<PlanetKey, 'Node'>].theme} into ${topAspect.natal.domain}. The arena is your ${ordinal(topAspect.houseInfo.number)} house of ${topAspect.houseInfo.domain.toLowerCase()}.`
      : 'The sky is relatively quiet for this window, which is an invitation to choose without pressure.',
    topAspect ? '' : moon.phase.invitation,
  ].filter(Boolean).join(' ');

  const retrogrades = transits.filter((transit) => transit.retrograde);

  return {
    chart,
    now,
    range,
    moon,
    moonSign: moonSignNow,
    sunSign: sunSignNow,
    retrogrades,
    aspects,
    lifeAreas,
    timeline: uniqueTimeline.slice(0, 24),
    topAspect,
    headline,
    summary,
    doThis: topAspect?.advice ?? moon.phase.invitation,
    releaseThis:
      topAspect?.release ??
      'Release the need to force a decision before the information arrives.',
    journal: focusArea.prompt,
  };
}
