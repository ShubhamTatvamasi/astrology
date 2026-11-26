export type AspectKey = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';

export interface Aspect {
  key: AspectKey;
  name: string;
  glyph: string;
  angle: number;
  orb: number;
  tone: 'harmonious' | 'dynamic' | 'neutral';
  color: string;
  description: string;
  invitation: string;
}

export const ASPECTS: Aspect[] = [
  {
    key: 'conjunction',
    name: 'Conjunction',
    glyph: '☌',
    angle: 0,
    orb: 8,
    tone: 'neutral',
    color: '#e8c47c',
    description:
      'Two planets in the same place in the sky. Their energies fuse, intensify, and become difficult to tell apart. A conjunction is a spotlight, not a verdict.',
    invitation: 'Notice where these two drives act as one — and where one is doing all the talking.',
  },
  {
    key: 'sextile',
    name: 'Sextile',
    glyph: '⚹',
    angle: 60,
    orb: 5,
    tone: 'harmonious',
    color: '#7fcf9d',
    description:
      'A supportive angle of opportunity. The two planets cooperate easily, but the gift is optional: a sextile rewards the effort you make to use it.',
    invitation: 'Take the opening. This is a door that opens only when you turn the handle.',
  },
  {
    key: 'square',
    name: 'Square',
    glyph: '□',
    angle: 90,
    orb: 7,
    tone: 'dynamic',
    color: '#ff8a9b',
    description:
      'A friction point between two planets that want different things. Squares create tension, and tension creates the energy that makes people build, train, and change.',
    invitation: 'Stop trying to resolve the contradiction by choosing one side. Let the friction teach you a third way.',
  },
  {
    key: 'trine',
    name: 'Trine',
    glyph: '△',
    angle: 120,
    orb: 7,
    tone: 'harmonious',
    color: '#9fc7ff',
    description:
      'An easy flow of energy between two planets in compatible elements. Trines are natural talents, but they can also be taken for granted.',
    invitation: 'Use the ease. Talent that is never practiced becomes a pleasant rumor about yourself.',
  },
  {
    key: 'opposition',
    name: 'Opposition',
    glyph: '☍',
    angle: 180,
    orb: 8,
    tone: 'dynamic',
    color: '#c9a0ff',
    description:
      'Two planets facing each other across the chart. An opposition is a relationship: it creates projection, negotiation, and the possibility of balance.',
    invitation: 'The other person is not the problem. The other person is showing you the half of the conversation you have been avoiding.',
  },
];

export const aspectByKey = (key: string): Aspect | undefined => ASPECTS.find((a) => a.key === key);
