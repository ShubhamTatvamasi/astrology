export type Varna = 'Brahmin' | 'Kshatriya' | 'Vaishya' | 'Shudra';
export type Vashya = 'Chatushpada' | 'Manav' | 'Jalchar' | 'Vanchar' | 'Keet';
export type Gana = 'Deva' | 'Manushya' | 'Rakshasa';
export type Nadi = 'Adi' | 'Madhya' | 'Antya';
export type Yoni =
  | 'Horse'
  | 'Elephant'
  | 'Sheep'
  | 'Serpent'
  | 'Dog'
  | 'Cat'
  | 'Rat'
  | 'Cow'
  | 'Buffalo'
  | 'Tiger'
  | 'Deer'
  | 'Monkey'
  | 'Mongoose'
  | 'Lion';

export interface RashiInfo {
  index: number;
  name: string;
  western: string;
  lord: string;
  varna: Varna;
}

export const RASHIS: RashiInfo[] = [
  { index: 0, name: 'Mesha', western: 'Aries', lord: 'Mars', varna: 'Kshatriya' },
  { index: 1, name: 'Vrishabha', western: 'Taurus', lord: 'Venus', varna: 'Vaishya' },
  { index: 2, name: 'Mithuna', western: 'Gemini', lord: 'Mercury', varna: 'Shudra' },
  { index: 3, name: 'Karka', western: 'Cancer', lord: 'Moon', varna: 'Brahmin' },
  { index: 4, name: 'Simha', western: 'Leo', lord: 'Sun', varna: 'Kshatriya' },
  { index: 5, name: 'Kanya', western: 'Virgo', lord: 'Mercury', varna: 'Vaishya' },
  { index: 6, name: 'Tula', western: 'Libra', lord: 'Venus', varna: 'Shudra' },
  { index: 7, name: 'Vrischika', western: 'Scorpio', lord: 'Mars', varna: 'Brahmin' },
  { index: 8, name: 'Dhanu', western: 'Sagittarius', lord: 'Jupiter', varna: 'Kshatriya' },
  { index: 9, name: 'Makara', western: 'Capricorn', lord: 'Saturn', varna: 'Vaishya' },
  { index: 10, name: 'Kumbha', western: 'Aquarius', lord: 'Saturn', varna: 'Shudra' },
  { index: 11, name: 'Meena', western: 'Pisces', lord: 'Jupiter', varna: 'Brahmin' },
];

export const NAKSHATRAS = [
  { name: 'Ashwini', lord: 'Ketu', gana: 'Deva', nadi: 'Adi', yoni: 'Horse' },
  { name: 'Bharani', lord: 'Venus', gana: 'Manushya', nadi: 'Madhya', yoni: 'Elephant' },
  { name: 'Krittika', lord: 'Sun', gana: 'Rakshasa', nadi: 'Antya', yoni: 'Sheep' },
  { name: 'Rohini', lord: 'Moon', gana: 'Manushya', nadi: 'Antya', yoni: 'Serpent' },
  { name: 'Mrigashira', lord: 'Mars', gana: 'Deva', nadi: 'Madhya', yoni: 'Serpent' },
  { name: 'Ardra', lord: 'Rahu', gana: 'Manushya', nadi: 'Adi', yoni: 'Dog' },
  { name: 'Punarvasu', lord: 'Jupiter', gana: 'Deva', nadi: 'Adi', yoni: 'Cat' },
  { name: 'Pushya', lord: 'Saturn', gana: 'Deva', nadi: 'Madhya', yoni: 'Sheep' },
  { name: 'Ashlesha', lord: 'Mercury', gana: 'Rakshasa', nadi: 'Antya', yoni: 'Cat' },
  { name: 'Magha', lord: 'Ketu', gana: 'Rakshasa', nadi: 'Antya', yoni: 'Rat' },
  { name: 'Purva Phalguni', lord: 'Venus', gana: 'Manushya', nadi: 'Madhya', yoni: 'Rat' },
  { name: 'Uttara Phalguni', lord: 'Sun', gana: 'Manushya', nadi: 'Adi', yoni: 'Cow' },
  { name: 'Hasta', lord: 'Moon', gana: 'Deva', nadi: 'Adi', yoni: 'Buffalo' },
  { name: 'Chitra', lord: 'Mars', gana: 'Rakshasa', nadi: 'Madhya', yoni: 'Tiger' },
  { name: 'Swati', lord: 'Rahu', gana: 'Deva', nadi: 'Antya', yoni: 'Buffalo' },
  { name: 'Vishakha', lord: 'Jupiter', gana: 'Rakshasa', nadi: 'Antya', yoni: 'Tiger' },
  { name: 'Anuradha', lord: 'Saturn', gana: 'Deva', nadi: 'Madhya', yoni: 'Deer' },
  { name: 'Jyeshtha', lord: 'Mercury', gana: 'Rakshasa', nadi: 'Adi', yoni: 'Deer' },
  { name: 'Mula', lord: 'Ketu', gana: 'Rakshasa', nadi: 'Adi', yoni: 'Dog' },
  { name: 'Purva Ashadha', lord: 'Venus', gana: 'Manushya', nadi: 'Madhya', yoni: 'Monkey' },
  { name: 'Uttara Ashadha', lord: 'Sun', gana: 'Manushya', nadi: 'Antya', yoni: 'Mongoose' },
  { name: 'Shravana', lord: 'Moon', gana: 'Deva', nadi: 'Antya', yoni: 'Monkey' },
  { name: 'Dhanishta', lord: 'Mars', gana: 'Rakshasa', nadi: 'Madhya', yoni: 'Lion' },
  { name: 'Shatabhisha', lord: 'Rahu', gana: 'Rakshasa', nadi: 'Adi', yoni: 'Horse' },
  { name: 'Purva Bhadrapada', lord: 'Jupiter', gana: 'Manushya', nadi: 'Adi', yoni: 'Lion' },
  { name: 'Uttara Bhadrapada', lord: 'Saturn', gana: 'Manushya', nadi: 'Madhya', yoni: 'Cow' },
  { name: 'Revati', lord: 'Mercury', gana: 'Deva', nadi: 'Antya', yoni: 'Elephant' },
] as const;

export const YONI_ANIMALS = [
  'Horse',
  'Elephant',
  'Sheep',
  'Serpent',
  'Dog',
  'Cat',
  'Rat',
  'Cow',
  'Buffalo',
  'Tiger',
  'Deer',
  'Monkey',
  'Mongoose',
  'Lion',
] as const;

/** Standard 14 × 14 Ashtakoota yoni table (0–4). */
export const YONI_MATRIX: number[][] = [
  [4, 2, 2, 3, 2, 2, 2, 1, 0, 1, 1, 3, 2, 1],
  [2, 4, 3, 3, 2, 2, 2, 2, 3, 1, 2, 3, 2, 0],
  [2, 3, 4, 2, 1, 2, 1, 3, 3, 1, 2, 0, 3, 1],
  [3, 3, 2, 4, 2, 1, 1, 1, 1, 2, 2, 2, 0, 2],
  [2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 0, 2, 1, 1],
  [2, 2, 2, 1, 2, 4, 0, 2, 2, 1, 3, 3, 2, 1],
  [2, 2, 1, 1, 1, 0, 4, 2, 2, 2, 2, 2, 1, 2],
  [1, 2, 3, 1, 2, 2, 2, 4, 3, 0, 3, 2, 2, 1],
  [0, 3, 3, 1, 2, 2, 2, 3, 4, 1, 2, 2, 2, 1],
  [1, 1, 1, 2, 1, 1, 2, 0, 1, 4, 1, 1, 2, 1],
  [1, 2, 2, 2, 0, 3, 2, 3, 2, 1, 4, 2, 2, 1],
  [3, 3, 0, 2, 2, 3, 2, 2, 2, 1, 2, 4, 3, 2],
  [2, 2, 3, 0, 1, 2, 1, 2, 2, 2, 2, 3, 4, 2],
  [1, 0, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 2, 4],
];

export const VASHYA_GROUPS: Vashya[] = ['Chatushpada', 'Manav', 'Jalchar', 'Vanchar', 'Keet'];

export const VASHYA_MATRIX: Record<Vashya, Record<Vashya, number>> = {
  Chatushpada: { Chatushpada: 2, Manav: 1, Jalchar: 1, Vanchar: 0, Keet: 1 },
  Manav: { Chatushpada: 1, Manav: 2, Jalchar: 0.5, Vanchar: 0, Keet: 1 },
  Jalchar: { Chatushpada: 1, Manav: 0.5, Jalchar: 2, Vanchar: 0, Keet: 1 },
  Vanchar: { Chatushpada: 0, Manav: 0, Jalchar: 0, Vanchar: 2, Keet: 0 },
  Keet: { Chatushpada: 1, Manav: 1, Jalchar: 1, Vanchar: 0, Keet: 2 },
};

export const GANA_MATRIX: Record<Gana, Record<Gana, number>> = {
  Deva: { Deva: 6, Manushya: 5, Rakshasa: 1 },
  Manushya: { Deva: 5, Manushya: 6, Rakshasa: 0 },
  Rakshasa: { Deva: 1, Manushya: 0, Rakshasa: 6 },
};

export const VARNA_RANK: Record<Varna, number> = {
  Shudra: 1,
  Vaishya: 2,
  Kshatriya: 3,
  Brahmin: 4,
};

export const TARA_NAMES = [
  'Janma',
  'Sampat',
  'Vipat',
  'Kshema',
  'Pratyari',
  'Sadhaka',
  'Vadha',
  'Mitra',
  'Parama Mitra',
];

export const TARA_FAVOURABLE = new Set([2, 4, 6, 8, 9]);

/** Natural friendship: 2 = friend, 1 = neutral, 0 = enemy. */
export const PLANET_FRIENDSHIP: Record<string, Record<string, number>> = {
  Sun: { Sun: 2, Moon: 2, Mars: 2, Mercury: 1, Jupiter: 2, Venus: 0, Saturn: 0 },
  Moon: { Sun: 2, Moon: 2, Mars: 1, Mercury: 2, Jupiter: 1, Venus: 1, Saturn: 1 },
  Mars: { Sun: 2, Moon: 2, Mars: 2, Mercury: 0, Jupiter: 2, Venus: 1, Saturn: 1 },
  Mercury: { Sun: 2, Moon: 0, Mars: 1, Mercury: 2, Jupiter: 1, Venus: 2, Saturn: 1 },
  Jupiter: { Sun: 2, Moon: 2, Mars: 2, Mercury: 0, Jupiter: 2, Venus: 0, Saturn: 1 },
  Venus: { Sun: 0, Moon: 0, Mars: 1, Mercury: 2, Jupiter: 1, Venus: 2, Saturn: 2 },
  Saturn: { Sun: 0, Moon: 0, Mars: 0, Mercury: 2, Jupiter: 1, Venus: 2, Saturn: 2 },
};

export const KOOTAS = [
  {
    key: 'varna',
    label: 'Varna',
    max: 1,
    checks: 'Spiritual temperament and ego balance',
    basis: 'Moon sign',
  },
  {
    key: 'vashya',
    label: 'Vashya',
    max: 2,
    checks: 'Mutual influence and attraction',
    basis: 'Moon sign',
  },
  {
    key: 'tara',
    label: 'Tara',
    max: 3,
    checks: 'Health, fortune, and well-being',
    basis: 'Birth nakshatra',
  },
  {
    key: 'yoni',
    label: 'Yoni',
    max: 4,
    checks: 'Physical and instinctive compatibility',
    basis: 'Birth nakshatra',
  },
  {
    key: 'graha',
    label: 'Graha Maitri',
    max: 5,
    checks: 'Mental compatibility and friendship',
    basis: 'Moon sign lords',
  },
  {
    key: 'gana',
    label: 'Gana',
    max: 6,
    checks: 'Temperament and nature',
    basis: 'Birth nakshatra',
  },
  {
    key: 'bhakoot',
    label: 'Bhakoot',
    max: 7,
    checks: 'Emotional and family harmony',
    basis: 'Moon sign',
  },
  {
    key: 'nadi',
    label: 'Nadi',
    max: 8,
    checks: 'Traditional vitality and biological symbolism',
    basis: 'Birth nakshatra',
  },
] as const;

export const VEDIC_SCORE_BANDS = [
  {
    min: 33,
    label: 'Excellent',
    blurb: 'A traditionally strong 36-guna match. Read the individual kootas and the full charts anyway.',
  },
  {
    min: 25,
    label: 'Good',
    blurb: 'A traditionally favourable score. The relationship has support, with specific areas to discuss.',
  },
  {
    min: 18,
    label: 'Average',
    blurb: 'The traditional minimum. The detail of the kootas matters more than the total.',
  },
  {
    min: 0,
    label: 'Needs context',
    blurb: 'A lower traditional score. Read the individual kootas and the full charts; it is not a prohibition.',
  },
];

export const VEDIC_NOTE =
  'Ashtakoot Gun Milan is a traditional Vedic Moon-based assessment. It is role-sensitive in places, uses raw koota scores without cancellation rules, and is not a scientific test, a medical assessment, or a verdict on a marriage.';
