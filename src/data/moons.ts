export interface MoonPhaseInfo {
  key: string;
  name: string;
  glyph: string;
  range: [number, number];
  meaning: string;
  invitation: string;
}

/** Elongation bins, starting at the new moon. */
export const MOON_PHASES: MoonPhaseInfo[] = [
  {
    key: 'new',
    name: 'New Moon',
    glyph: '🌑',
    range: [337.5, 22.5],
    meaning:
      'The Moon and Sun meet at the same degree. The sky is dark and the cycle resets. New Moons are for beginnings that do not need an audience yet.',
    invitation: 'Plant one intention. Keep it small enough to survive the week.',
  },
  {
    key: 'waxing-crescent',
    name: 'Waxing Crescent',
    glyph: '🌒',
    range: [22.5, 67.5],
    meaning:
      'A thin light returns. The vision is still fragile, and momentum matters more than perfection. This is the phase of the first brave, awkward step.',
    invitation: 'Make the first move before you feel ready. Momentum is the medicine.',
  },
  {
    key: 'first-quarter',
    name: 'First Quarter',
    glyph: '🌓',
    range: [67.5, 112.5],
    meaning:
      'Half the Moon is lit and the first real resistance appears. The idea meets the world, and the world pushes back. This is a crisis of action, not of faith.',
    invitation: 'Choose the hard, useful action. Adjust the plan, not the purpose.',
  },
  {
    key: 'waxing-gibbous',
    name: 'Waxing Gibbous',
    glyph: '🌔',
    range: [112.5, 157.5],
    meaning:
      'Almost full, almost there. The work of refinement begins: editing, rehearsing, and noticing what the project is becoming rather than what you imagined.',
    invitation: 'Refine the thing. Do not abandon it for a shinier new thing.',
  },
  {
    key: 'full',
    name: 'Full Moon',
    glyph: '🌕',
    range: [157.5, 202.5],
    meaning:
      'The Moon opposes the Sun and the whole disc is illuminated. Full Moons reveal, culminate, and overexpose. They are dramatic because they are meant to be seen.',
    invitation: 'Let the truth be visible. Release what cannot survive the light.',
  },
  {
    key: 'waning-gibbous',
    name: 'Waning Gibbous',
    glyph: '🌖',
    range: [202.5, 247.5],
    meaning:
      'The light begins to recede, but there is still plenty of it. This is the phase of sharing, teaching, and turning experience into something useful for someone else.',
    invitation: 'Teach what you just learned. Gratitude is a form of transmission.',
  },
  {
    key: 'last-quarter',
    name: 'Last Quarter',
    glyph: '🌗',
    range: [247.5, 292.5],
    meaning:
      'Half the Moon is lit again, but the light is disappearing. This is the phase of reckoning: forgiving, cutting, and closing the loop on what the cycle taught you.',
    invitation: 'End the thing. Forgive the version of yourself who did not know better.',
  },
  {
    key: 'waning-crescent',
    name: 'Waning Crescent',
    glyph: '🌘',
    range: [292.5, 337.5],
    meaning:
      'The last sliver of light before the dark. The cycle is nearly complete. Waning Crescent energy is for rest, surrender, and making room for the next beginning.',
    invitation: 'Do less. Empty space is not a failure; it is a threshold.',
  },
];

export function phaseForElongation(elongation: number): MoonPhaseInfo {
  const e = ((elongation % 360) + 360) % 360;
  if (e >= 337.5 || e < 22.5) return MOON_PHASES[0]!;
  return MOON_PHASES.find((p) => e >= p.range[0] && e < p.range[1]) ?? MOON_PHASES[0]!;
}
