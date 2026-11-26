export type SynastryCategoryKey =
  | 'attraction'
  | 'emotional'
  | 'communication'
  | 'commitment'
  | 'growth';

export interface SynastryCategory {
  key: SynastryCategoryKey;
  label: string;
  glyph: string;
  color: string;
  blurb: string;
  prompt: string;
  weight: number;
}

export const SYNASTRY_CATEGORIES: SynastryCategory[] = [
  {
    key: 'attraction',
    label: 'Spark & attraction',
    glyph: '♀',
    color: '#f3a7b8',
    blurb: 'Chemistry, desire, and the pleasure of being wanted.',
    prompt: 'What makes you feel wanted, not just desired?',
    weight: 0.2,
  },
  {
    key: 'emotional',
    label: 'Emotional safety',
    glyph: '☽',
    color: '#b79dff',
    blurb: 'How you feel around each other, and whether you can be soft.',
    prompt: 'What do you need in the quiet moments?',
    weight: 0.25,
  },
  {
    key: 'communication',
    label: 'Communication',
    glyph: '☿',
    color: '#8fb8ff',
    blurb: 'How you think, argue, explain, and repair.',
    prompt: 'How do you want to be spoken to when you are hurt?',
    weight: 0.2,
  },
  {
    key: 'commitment',
    label: 'Commitment & stability',
    glyph: '♄',
    color: '#e8c47c',
    blurb: 'Whether you can build a shared life, not just a spark.',
    prompt: 'What does a shared life look like on an ordinary Tuesday?',
    weight: 0.2,
  },
  {
    key: 'growth',
    label: 'Shared direction',
    glyph: '♃',
    color: '#c9a0ff',
    blurb: 'What the relationship asks you to become.',
    prompt: 'What is this relationship asking each of you to become?',
    weight: 0.15,
  },
];

export interface PairMeaning {
  text: string;
  categories: SynastryCategoryKey[];
  weight: number;
}

/** Keys are alphabetically sorted, e.g. "Moon-Sun", "Mars-Venus". */
export const PAIR_MEANINGS: Record<string, PairMeaning> = {
  'Ascendant-Ascendant': {
    text: 'Your first impressions mirror each other. There can be instant recognition — and an equal chance of seeing your own habits reflected back.',
    categories: ['attraction', 'emotional'],
    weight: 0.9,
  },
  'Ascendant-Mars': {
    text: 'Their drive meets your body and first impression. There is energy and heat here; it can feel exciting or combative depending on the day.',
    categories: ['attraction', 'growth'],
    weight: 0.9,
  },
  'Ascendant-Moon': {
    text: 'Their emotional world meets your outward self. You may feel immediately at home — or immediately exposed.',
    categories: ['emotional', 'attraction'],
    weight: 1.1,
  },
  'Ascendant-Saturn': {
    text: 'They meet your body and approach with weight and structure. Commitment is possible; so is the feeling of being evaluated.',
    categories: ['commitment'],
    weight: 0.8,
  },
  'Ascendant-Sun': {
    text: 'Their identity meets your first impression. You tend to recognize each other quickly and take up visible space together.',
    categories: ['attraction', 'emotional'],
    weight: 1.0,
  },
  'Ascendant-Venus': {
    text: 'Their affection meets your body and style. This is a warm, aesthetic, often immediately pleasing contact.',
    categories: ['attraction'],
    weight: 1.1,
  },
  'Jupiter-Moon': {
    text: 'Their optimism meets your emotional world. They can make you feel safer, luckier, and more willing to trust the future.',
    categories: ['emotional', 'growth'],
    weight: 1.0,
  },
  'Jupiter-Saturn': {
    text: 'Growth meets structure. You can build something serious together, but you may disagree about how fast or how cautiously.',
    categories: ['commitment', 'growth'],
    weight: 0.7,
  },
  'Jupiter-Sun': {
    text: 'Their generosity meets your identity. They tend to encourage you to take up more space and believe in a bigger version of yourself.',
    categories: ['growth', 'attraction'],
    weight: 0.9,
  },
  'Jupiter-Venus': {
    text: 'Their warmth meets your taste for pleasure. This is a generous, affectionate, sometimes indulgent contact.',
    categories: ['attraction', 'growth'],
    weight: 0.8,
  },
  'Mars-Mars': {
    text: 'Your drives meet. You may move at the same speed — or discover that you fight for different things in the same language.',
    categories: ['attraction', 'growth'],
    weight: 0.8,
  },
  'Mars-Mercury': {
    text: 'Their words meet your action. Conversation can be sharp, stimulating, and occasionally too quick.',
    categories: ['communication', 'attraction'],
    weight: 0.8,
  },
  'Mars-Moon': {
    text: 'Their drive meets your emotional world. There is passion and emotional courage here, along with a risk of reactivity.',
    categories: ['attraction', 'emotional'],
    weight: 1.1,
  },
  'Mars-Pluto': {
    text: 'Their power meets your desire. This is intense, magnetic, and not always easy to keep in proportion.',
    categories: ['attraction', 'growth'],
    weight: 0.9,
  },
  'Mars-Saturn': {
    text: 'Their discipline meets your drive. You can build endurance together, or feel that one of you is always braking.',
    categories: ['commitment', 'growth'],
    weight: 0.9,
  },
  'Mars-Sun': {
    text: 'Their identity meets your energy. You activate each other; there can be heat, competition, and a lot of life.',
    categories: ['attraction', 'growth'],
    weight: 1.0,
  },
  'Mars-Venus': {
    text: 'Desire meets affection. This is one of the classic chemistry contacts: attraction, flirtation, and physical aliveness.',
    categories: ['attraction'],
    weight: 1.5,
  },
  'Mercury-Mercury': {
    text: 'You share a mental wavelength — or discover that you think in completely different dialects. Conversation is central either way.',
    categories: ['communication'],
    weight: 1.2,
  },
  'Mercury-Moon': {
    text: 'Their words meet your feelings. Naming emotions can be easy and healing, or feel too clinical when you need comfort.',
    categories: ['communication', 'emotional'],
    weight: 1.0,
  },
  'Mercury-Saturn': {
    text: 'Their mind meets your sense of structure. Serious conversations, clear agreements, and occasional criticism live here.',
    categories: ['communication', 'commitment'],
    weight: 0.8,
  },
  'Mercury-Sun': {
    text: 'Their words meet your identity. You tend to understand each other’s self-expression and enjoy thinking out loud together.',
    categories: ['communication', 'attraction'],
    weight: 0.9,
  },
  'Mercury-Venus': {
    text: 'Their mind meets your affection. Flirtation, shared taste, and the pleasure of being understood in conversation.',
    categories: ['communication', 'attraction'],
    weight: 1.0,
  },
  'Midheaven-Saturn': {
    text: 'Their structure meets your public role. They may support your ambitions or represent the pressure to prove yourself.',
    categories: ['commitment'],
    weight: 0.7,
  },
  'Midheaven-Sun': {
    text: 'Their identity meets your public life. You can be visible together; the relationship may shape how you are seen.',
    categories: ['commitment', 'attraction'],
    weight: 0.8,
  },
  'Moon-Moon': {
    text: 'Your emotional languages meet. You may feel instantly soothed — or discover that you need very different things to feel safe.',
    categories: ['emotional'],
    weight: 1.3,
  },
  'Moon-Neptune': {
    text: 'Their dreams meet your feelings. There is empathy, romance, and beauty here; keep a small reality check nearby.',
    categories: ['emotional', 'attraction'],
    weight: 0.7,
  },
  'Moon-Node': {
    text: 'Their growth direction meets your emotional world. The relationship can feel familiar and fated — and asks you to leave an old comfort zone.',
    categories: ['growth', 'emotional'],
    weight: 0.8,
  },
  'Moon-Pluto': {
    text: 'Their depth meets your feelings. Emotional intensity, transformation, and a need for honesty; control is the shadow.',
    categories: ['emotional', 'growth'],
    weight: 0.9,
  },
  'Moon-Saturn': {
    text: 'Their structure meets your feelings. There can be emotional steadiness, but also the feeling of being tested or contained.',
    categories: ['commitment', 'emotional'],
    weight: 1.0,
  },
  'Moon-Sun': {
    text: 'Identity meets emotional need. This is the classic “I see you” axis: recognition, comfort, and a strong sense of home.',
    categories: ['emotional', 'attraction'],
    weight: 1.5,
  },
  'Moon-Uranus': {
    text: 'Their freedom meets your feelings. There is excitement and unpredictability; the bond needs air, not control.',
    categories: ['emotional', 'growth'],
    weight: 0.7,
  },
  'Moon-Venus': {
    text: 'Their tenderness meets your feelings. Warmth, affection, and a simple pleasure in each other’s company.',
    categories: ['emotional', 'attraction'],
    weight: 1.2,
  },
  'Neptune-Venus': {
    text: 'Their imagination meets your love nature. Romance, art, and idealization; clarity is the practice.',
    categories: ['attraction', 'emotional'],
    weight: 0.8,
  },
  'Node-Sun': {
    text: 'Their direction meets your identity. You may feel like you are becoming someone new around each other.',
    categories: ['growth', 'attraction'],
    weight: 0.8,
  },
  'Node-Venus': {
    text: 'Their direction meets your values. The relationship can expand what you love and what you believe you deserve.',
    categories: ['growth', 'attraction'],
    weight: 0.8,
  },
  'Pluto-Sun': {
    text: 'Their power meets your identity. This is a deep, transforming contact; it asks for honesty and shared control.',
    categories: ['growth', 'commitment'],
    weight: 0.8,
  },
  'Pluto-Venus': {
    text: 'Their intensity meets your love nature. Magnetic attraction, emotional depth, and the risk of obsession.',
    categories: ['attraction', 'emotional'],
    weight: 0.9,
  },
  'Saturn-Saturn': {
    text: 'Your structures meet. You share a sense of time and duty, which can make a durable partnership — or a very serious one.',
    categories: ['commitment'],
    weight: 0.9,
  },
  'Saturn-Sun': {
    text: 'Their structure meets your identity. Respect, responsibility, and a serious tone; watch criticism and self-doubt.',
    categories: ['commitment'],
    weight: 1.0,
  },
  'Saturn-Venus': {
    text: 'Their structure meets your affection. Commitment can be real, but affection may need to be spoken, not just proven.',
    categories: ['commitment', 'attraction'],
    weight: 1.0,
  },
  'Sun-Sun': {
    text: 'Your identities meet. You may share a basic style of being alive — or illuminate very different parts of each other.',
    categories: ['attraction', 'commitment'],
    weight: 0.8,
  },
  'Sun-Uranus': {
    text: 'Their freedom meets your identity. Excitement and originality; the bond needs room to surprise you.',
    categories: ['growth', 'attraction'],
    weight: 0.7,
  },
  'Sun-Venus': {
    text: 'Their affection meets your identity. Warmth, appreciation, and the feeling of being liked for who you are.',
    categories: ['attraction', 'emotional'],
    weight: 1.2,
  },
  'Uranus-Venus': {
    text: 'Their freedom meets your affection. An unconventional attraction; it stays alive when it stays honest.',
    categories: ['attraction', 'growth'],
    weight: 0.7,
  },
  'Venus-Venus': {
    text: 'Your love languages meet. Shared taste, affection style, and a similar sense of what is beautiful.',
    categories: ['attraction', 'emotional'],
    weight: 1.0,
  },
};

export const HOUSE_OVERLAY_MEANINGS: Record<number, string> = {
  1: 'body, first impression, and sense of self',
  2: 'values, money, and self-worth',
  3: 'communication, learning, and daily life',
  4: 'home, family, and private life',
  5: 'romance, play, and creativity',
  6: 'work, routine, and health',
  7: 'partnership and marriage',
  8: 'intimacy, shared resources, and transformation',
  9: 'beliefs, travel, and meaning',
  10: 'career, public role, and reputation',
  11: 'friendship, community, and future hopes',
  12: 'private, spiritual, and unconscious life',
};

export const SCORE_BANDS = [
  {
    min: 82,
    label: 'Strong ease',
    blurb: 'A lot of natural support between the charts. The work is to not take the ease for granted.',
  },
  {
    min: 68,
    label: 'Warm potential',
    blurb: 'A real connection with enough friction to keep it honest. Tenderness and effort both matter.',
  },
  {
    min: 54,
    label: 'Mixed weather',
    blurb: 'There is genuine chemistry and genuine difference. The relationship rewards direct conversation.',
  },
  {
    min: 40,
    label: 'Growth-heavy',
    blurb: 'This connection asks a lot of both people. It can be transformative, but it is not a passive match.',
  },
  {
    min: 0,
    label: 'Slow burn',
    blurb: 'Few easy contacts. The bond will need conscious effort, clear agreements, and patience.',
  },
];

export const OVERLAY_HOUSES = [1, 4, 5, 7, 8, 10];
