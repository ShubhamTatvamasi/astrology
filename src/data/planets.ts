export type PlanetKey =
  | 'Sun'
  | 'Moon'
  | 'Mercury'
  | 'Venus'
  | 'Mars'
  | 'Jupiter'
  | 'Saturn'
  | 'Uranus'
  | 'Neptune'
  | 'Pluto'
  | 'Node';

export interface Planet {
  key: PlanetKey;
  name: string;
  glyph: string;
  rules: string;
  keyword: string;
  question: string;
  cycle: string;
  description: string;
  retrograde: string;
  color: string;
}

export const PLANETS: Planet[] = [
  {
    key: 'Sun',
    name: 'Sun',
    glyph: '☉',
    rules: 'Leo',
    keyword: 'Identity',
    question: 'Who am I becoming?',
    cycle: '1 year',
    description:
      'The Sun is the center of the chart and the core of the self: vitality, purpose, and the thing you are here to express. Its sign describes the style of your identity; its house describes where you shine.',
    retrograde: 'The Sun never appears retrograde from Earth; it is the fixed reference point around which the other cycles move.',
    color: '#f2c56b',
  },
  {
    key: 'Moon',
    name: 'Moon',
    glyph: '☽',
    rules: 'Cancer',
    keyword: 'Emotion',
    question: 'What do I need to feel safe?',
    cycle: '29.5 days',
    description:
      'The Moon is the inner life: emotion, instinct, memory, and the body\u2019s need for comfort. Its sign describes how you feel; its house describes where you go to recharge.',
    retrograde: 'The Moon never turns retrograde; it moves through all twelve signs roughly every month.',
    color: '#d8d6ef',
  },
  {
    key: 'Mercury',
    name: 'Mercury',
    glyph: '☿',
    rules: 'Gemini & Virgo',
    keyword: 'Mind',
    question: 'How do I think and communicate?',
    cycle: '88 days',
    description:
      'Mercury rules language, learning, and the movement of information. Its sign describes your thinking style; its house describes the conversations and subjects you keep returning to.',
    retrograde:
      'Mercury retrograde is a symbolic invitation to review, revise, and listen. In practice, it is a good season for editing, backups, and slowing down the confident email.',
    color: '#9fc7ff',
  },
  {
    key: 'Venus',
    name: 'Venus',
    glyph: '♀',
    rules: 'Taurus & Libra',
    keyword: 'Love',
    question: 'What do I value, and how do I connect?',
    cycle: '225 days',
    description:
      'Venus rules love, beauty, pleasure, and the values that shape your taste. Its sign describes what you find attractive; its house describes where you seek harmony and delight.',
    retrograde:
      'Venus retrograde turns the focus inward: old relationships, old values, and the question of what you actually want versus what you have been told to want.',
    color: '#f3a7b8',
  },
  {
    key: 'Mars',
    name: 'Mars',
    glyph: '♂',
    rules: 'Aries',
    keyword: 'Drive',
    question: 'How do I act, desire, and defend?',
    cycle: '687 days',
    description:
      'Mars is the engine: courage, desire, anger, and the will to act. Its sign describes your fighting style; its house describes where you are most motivated to compete or build.',
    retrograde:
      'Mars retrograde is frustration with a purpose. The old strategies stop working; the task is to find a cleaner source of motivation rather than push harder.',
    color: '#ff6b4a',
  },
  {
    key: 'Jupiter',
    name: 'Jupiter',
    glyph: '♃',
    rules: 'Sagittarius',
    keyword: 'Growth',
    question: 'Where do I expand and find meaning?',
    cycle: '12 years',
    description:
      'Jupiter is expansion, faith, luck, and the search for meaning. Its sign describes your philosophy; its house describes the area of life where you are invited to take up more space.',
    retrograde:
      'Jupiter retrograde turns growth inward: the big external opportunity becomes a private question about what you actually believe.',
    color: '#c9a0ff',
  },
  {
    key: 'Saturn',
    name: 'Saturn',
    glyph: '♄',
    rules: 'Capricorn',
    keyword: 'Structure',
    question: 'What must I build, and what must I learn?',
    cycle: '29.5 years',
    description:
      'Saturn is time, limit, responsibility, and mastery. Its sign describes your relationship to authority and discipline; its house describes where you are asked to grow up and do the work.',
    retrograde:
      'Saturn retrograde reviews the structures you have inherited. It is a season for renegotiating duty, not for abandoning it.',
    color: '#8d99ae',
  },
  {
    key: 'Uranus',
    name: 'Uranus',
    glyph: '♅',
    rules: 'Aquarius',
    keyword: 'Awakening',
    question: 'Where must I break free?',
    cycle: '84 years',
    description:
      'Uranus is the disruptor: sudden change, originality, and the part of you that refuses the script. Its sign describes how a generation rebels; its house describes where your own life insists on freedom.',
    retrograde:
      'Uranus retrograde makes rebellion internal. The lightning still strikes; it just rearranges your private assumptions first.',
    color: '#59d3e8',
  },
  {
    key: 'Neptune',
    name: 'Neptune',
    glyph: '♆',
    rules: 'Pisces',
    keyword: 'Imagination',
    question: 'Where do I dissolve, dream, or escape?',
    cycle: '165 years',
    description:
      'Neptune is imagination, compassion, spirituality, and the fog where boundaries disappear. Its sign describes a generation\u2019s dream life; its house describes where you are most inspired and most vulnerable to illusion.',
    retrograde:
      'Neptune retrograde reels the dream back inward. It is a useful season for asking which fantasy is feeding you and which one is draining you.',
    color: '#73c9c4',
  },
  {
    key: 'Pluto',
    name: 'Pluto',
    glyph: '♇',
    rules: 'Scorpio',
    keyword: 'Transformation',
    question: 'What must die so something truer can live?',
    cycle: '248 years',
    description:
      'Pluto is power, depth, and irreversible change. Its sign describes a generational underworld; its house describes where you are asked to face what cannot be controlled.',
    retrograde:
      'Pluto retrograde is an inside job: the power struggle becomes internal, and the transformation asks to be felt rather than performed.',
    color: '#a33a5b',
  },
  {
    key: 'Node',
    name: 'North Node',
    glyph: '☊',
    rules: '\u2014',
    keyword: 'Direction',
    question: 'Where is growth asking me to go?',
    cycle: '18.6 years',
    description:
      'The North Node is not a planet but a point where the Moon\u2019s orbit crosses the ecliptic. It marks the direction of growth in this lifetime; the South Node, opposite it, marks the familiar ground you are asked to leave.',
    retrograde: 'The nodes move retrograde through the zodiac, tracing a path back toward the unfamiliar.',
    color: '#e8c47c',
  },
];

export const planetByKey = (key: string): Planet | undefined => PLANETS.find((p) => p.key === key);
