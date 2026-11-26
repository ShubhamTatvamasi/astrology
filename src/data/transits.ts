import type { PlanetKey } from './planets';

export type LifeAreaKey = 'love' | 'career' | 'mind' | 'wellbeing' | 'growth';

export interface LifeArea {
  key: LifeAreaKey;
  label: string;
  short: string;
  glyph: string;
  color: string;
  question: string;
  prompt: string;
}

export const LIFE_AREAS: LifeArea[] = [
  {
    key: 'love',
    label: 'Love & connection',
    short: 'Closeness, warmth, and the truth between people.',
    glyph: '♀',
    color: '#f3a7b8',
    question: 'Where is closeness asking for more honesty?',
    prompt: 'Name one need you have been hoping someone would guess.',
  },
  {
    key: 'career',
    label: 'Work & direction',
    short: 'Vocation, effort, and the shape of your public life.',
    glyph: '♄',
    color: '#e8c47c',
    question: 'What deserves your focused effort right now?',
    prompt: 'Choose the task that future-you will thank you for.',
  },
  {
    key: 'mind',
    label: 'Mind & voice',
    short: 'Thought, conversation, learning, and decisions.',
    glyph: '☿',
    color: '#8fb8ff',
    question: 'What needs to be said, written, or learned?',
    prompt: 'Write the thought down before you argue with it.',
  },
  {
    key: 'wellbeing',
    label: 'Body & wellbeing',
    short: 'Energy, rest, emotional weather, and daily rhythm.',
    glyph: '☽',
    color: '#b79dff',
    question: 'What does your body need before your schedule does?',
    prompt: 'Protect one hour of unproductive rest.',
  },
  {
    key: 'growth',
    label: 'Growth & meaning',
    short: 'The next stretch, the bigger story, and the long game.',
    glyph: '♃',
    color: '#c9a0ff',
    question: 'What is the next honest stretch?',
    prompt: 'Take the small risk that is actually within reach.',
  },
];

export const lifeAreaByKey = (key: LifeAreaKey): LifeArea =>
  LIFE_AREAS.find((area) => area.key === key)!;

export interface TransitProfile {
  /** The theme the transiting planet activates. */
  theme: string;
  /** What to lean into. */
  gift: string;
  /** What to watch without fear. */
  watch: string;
  /** How the planet relates to the natal point. */
  verb: string;
  /** Areas this transit tends to touch. */
  areas: LifeAreaKey[];
}

export const TRANSIT_PROFILES: Record<Exclude<PlanetKey, 'Node'>, TransitProfile> = {
  Sun: {
    theme: 'vitality, identity, and visibility',
    gift: 'Put your energy where you want to be seen. Let one thing be simple and bright.',
    watch: 'Mistaking urgency for importance, or performing a self you do not actually want.',
    verb: 'spotlights',
    areas: ['career', 'wellbeing'],
  },
  Moon: {
    theme: 'emotion, instinct, and home',
    gift: 'Tend to what needs care. Notice the feeling before you fix the situation.',
    watch: 'Reacting before you have named the need underneath the reaction.',
    verb: 'moves through',
    areas: ['wellbeing', 'love'],
  },
  Mercury: {
    theme: 'thought, speech, and information',
    gift: 'Ask the clarifying question. Write it down. Say the true thing in plain language.',
    watch: 'Overthinking, scattering your attention, or agreeing before you actually mean it.',
    verb: 'sharpens',
    areas: ['mind', 'career'],
  },
  Venus: {
    theme: 'love, values, beauty, and money',
    gift: 'Make the warm gesture. Beautify something. Ask for what you actually want.',
    watch: 'People-pleasing, or spending to avoid a feeling that needs attention.',
    verb: 'softens',
    areas: ['love', 'career'],
  },
  Mars: {
    theme: 'drive, courage, and desire',
    gift: 'Take the direct action. Train, build, set the boundary, start the difficult conversation.',
    watch: 'Pushing through exhaustion, or turning frustration into a fight with the nearest person.',
    verb: 'energizes',
    areas: ['career', 'wellbeing'],
  },
  Jupiter: {
    theme: 'growth, opportunity, and meaning',
    gift: 'Say yes to the bigger room. Learn the thing. Ask for more than you usually would.',
    watch: 'Overpromising, or confusing expansion with escape.',
    verb: 'expands',
    areas: ['growth', 'career', 'love'],
  },
  Saturn: {
    theme: 'structure, responsibility, and time',
    gift: 'Commit to the smaller, real version. Build the container before you fill it.',
    watch: 'Fear disguised as realism, or treating overwork as proof of worth.',
    verb: 'tests',
    areas: ['career', 'growth'],
  },
  Uranus: {
    theme: 'change, freedom, and surprise',
    gift: 'Experiment. Break the stale pattern. Let the plot twist teach you something.',
    watch: 'Disrupting what you actually want to keep, just because it feels familiar.',
    verb: 'destabilizes',
    areas: ['growth', 'mind'],
  },
  Neptune: {
    theme: 'imagination, compassion, and rest',
    gift: 'Create, forgive, sleep, and listen to the dream. Choose tenderness over performance.',
    watch: 'Escaping the practical conversation, or idealizing a person into a fantasy.',
    verb: 'dissolves',
    areas: ['wellbeing', 'love', 'growth'],
  },
  Pluto: {
    theme: 'power, depth, and transformation',
    gift: 'Go to the root. Release control where it has become fear. Tell the truth you have been circling.',
    watch: 'Control, obsession, or mistaking intensity for intimacy.',
    verb: 'intensifies',
    areas: ['growth', 'love'],
  },
};

export interface NatalDomain {
  phrase: string;
  areas: LifeAreaKey[];
}

export const NATAL_DOMAINS: Record<string, NatalDomain> = {
  Sun: { phrase: 'identity, vitality, and purpose', areas: ['wellbeing', 'career'] },
  Moon: { phrase: 'emotional needs, instinct, and home', areas: ['wellbeing', 'love'] },
  Mercury: { phrase: 'mind, communication, and decisions', areas: ['mind', 'career'] },
  Venus: { phrase: 'love, values, and pleasure', areas: ['love', 'career'] },
  Mars: { phrase: 'drive, desire, and courage', areas: ['career', 'wellbeing'] },
  Jupiter: { phrase: 'growth, belief, and opportunity', areas: ['growth', 'career'] },
  Saturn: { phrase: 'work, structure, and responsibility', areas: ['career', 'growth'] },
  Uranus: { phrase: 'freedom, change, and originality', areas: ['growth', 'mind'] },
  Neptune: { phrase: 'dreams, spirituality, and compassion', areas: ['wellbeing', 'growth'] },
  Pluto: { phrase: 'power, transformation, and depth', areas: ['growth', 'love'] },
  Ascendant: { phrase: 'body, first impressions, and approach', areas: ['wellbeing', 'love'] },
  Midheaven: { phrase: 'career, reputation, and public role', areas: ['career', 'growth'] },
  Node: { phrase: 'growth direction and unfamiliar territory', areas: ['growth', 'career'] },
};

export const ASPECT_TRANSIT_GUIDANCE: Record<
  string,
  { verb: string; tone: 'ease' | 'growth' | 'intensity'; guidance: string }
> = {
  conjunction: {
    verb: 'meets',
    tone: 'intensity',
    guidance: 'What starts now is loud. Give it a container so it can become something rather than everything.',
  },
  sextile: {
    verb: 'supports',
    tone: 'ease',
    guidance: 'An opening is available, but it rewards the first move. Take the small yes.',
  },
  square: {
    verb: 'presses on',
    tone: 'growth',
    guidance: 'Resistance is information. Adjust the plan, not your worth.',
  },
  trine: {
    verb: 'flows with',
    tone: 'ease',
    guidance: 'Use the ease. Talent becomes real when it is practiced, not just felt.',
  },
  opposition: {
    verb: 'faces',
    tone: 'growth',
    guidance: 'Two real needs are asking for balance. Do not make the other person the whole problem.',
  },
};

export const HOUSE_LIFE_AREAS: Record<number, LifeAreaKey[]> = {
  1: ['wellbeing', 'love'],
  2: ['career', 'growth'],
  3: ['mind', 'growth'],
  4: ['love', 'wellbeing'],
  5: ['love', 'growth'],
  6: ['wellbeing', 'career'],
  7: ['love', 'career'],
  8: ['love', 'growth'],
  9: ['growth', 'mind'],
  10: ['career', 'growth'],
  11: ['growth', 'career'],
  12: ['wellbeing', 'growth'],
};

export const WEATHER_LABELS: Record<'ease' | 'growth' | 'intensity' | 'reflect' | 'quiet', string> = {
  ease: 'Open',
  growth: 'In motion',
  intensity: 'Charged',
  reflect: 'Reflective',
  quiet: 'Quiet',
};

export const EVENT_KIND_LABELS = {
  aspect: 'Exact transit',
  station: 'Station',
  ingress: 'Ingress',
  moon: 'Moon phase',
} as const;
