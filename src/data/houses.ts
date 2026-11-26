export interface House {
  number: number;
  title: string;
  domain: string;
  keyword: string;
  question: string;
  description: string;
  sign: string;
  signGlyph: string;
}

export const HOUSES: House[] = [
  {
    number: 1,
    title: 'House of Self',
    domain: 'Identity, appearance, first impressions',
    keyword: 'Becoming',
    question: 'Who am I, and how do I show up?',
    description:
      'The first house begins at the Ascendant, the eastern horizon at your birth. It is the interface between you and the world: your body, your style, your instinctive approach to new situations.',
    sign: 'Aries',
    signGlyph: '♈',
  },
  {
    number: 2,
    title: 'House of Resources',
    domain: 'Money, values, possessions, self-worth',
    keyword: 'Having',
    question: 'What do I value, and what makes me feel secure?',
    description:
      'The second house is about what you own and what owns you: income, savings, talents, and the deeper question of whether you believe you are worth having things.',
    sign: 'Taurus',
    signGlyph: '♉',
  },
  {
    number: 3,
    title: 'House of Communication',
    domain: 'Language, learning, siblings, local life',
    keyword: 'Connecting',
    question: 'How do I think, speak, and stay curious?',
    description:
      'The third house is the daily traffic of the mind: conversations, classes, messages, siblings, short trips, and the stories you tell to make sense of your immediate world.',
    sign: 'Gemini',
    signGlyph: '♊',
  },
  {
    number: 4,
    title: 'House of Home',
    domain: 'Family, roots, private life, emotional foundation',
    keyword: 'Belonging',
    question: 'Where do I come from, and where can I rest?',
    description:
      'The fourth house is the bottom of the chart: home, ancestry, memory, and the private self that exists when no one is watching. It describes the foundation you build everything else on.',
    sign: 'Cancer',
    signGlyph: '♋',
  },
  {
    number: 5,
    title: 'House of Creativity',
    domain: 'Romance, play, children, self-expression',
    keyword: 'Creating',
    question: 'What do I make for the joy of making it?',
    description:
      'The fifth house is where the self becomes playful: art, performance, flirtation, hobbies, children, and the risks you take because they feel alive rather than practical.',
    sign: 'Leo',
    signGlyph: '♌',
  },
  {
    number: 6,
    title: 'House of Work',
    domain: 'Daily routines, health, service, craft',
    keyword: 'Tending',
    question: 'How do I take care of business and my body?',
    description:
      'The sixth house is the ordinary machinery of a life: work routines, habits, health, colleagues, and the small acts of service that keep the whole thing running.',
    sign: 'Virgo',
    signGlyph: '♍',
  },
  {
    number: 7,
    title: 'House of Partnership',
    domain: 'Marriage, close relationships, contracts',
    keyword: 'Meeting',
    question: 'Who do I choose to meet as an equal?',
    description:
      'The seventh house begins at the Descendant, opposite the Ascendant. It describes the people you attract into one-to-one relationship, and the mirror they hold up to you.',
    sign: 'Libra',
    signGlyph: '♎',
  },
  {
    number: 8,
    title: 'House of Transformation',
    domain: 'Intimacy, shared resources, endings, rebirth',
    keyword: 'Deepening',
    question: 'What happens when I let someone all the way in?',
    description:
      'The eighth house is the territory of intimacy and consequence: sex, merged finances, inheritance, crisis, grief, and the parts of life that change you whether or not you consented.',
    sign: 'Scorpio',
    signGlyph: '♏',
  },
  {
    number: 9,
    title: 'House of Exploration',
    domain: 'Travel, higher learning, belief, perspective',
    keyword: 'Seeking',
    question: 'What do I believe, and how far will I go to find out?',
    description:
      'The ninth house is the horizon: long journeys, higher education, philosophy, faith, and the big stories that tell you what your life means.',
    sign: 'Sagittarius',
    signGlyph: '♐',
  },
  {
    number: 10,
    title: 'House of Vocation',
    domain: 'Career, reputation, public role, legacy',
    keyword: 'Building',
    question: 'What do I want to be known for?',
    description:
      'The tenth house begins at the Midheaven, the highest point of the chart. It describes your public life: career, calling, reputation, and the contribution you want to leave behind.',
    sign: 'Capricorn',
    signGlyph: '♑',
  },
  {
    number: 11,
    title: 'House of Community',
    domain: 'Friends, groups, networks, future hopes',
    keyword: 'Gathering',
    question: 'Who do I stand with, and what future am I helping build?',
    description:
      'The eleventh house is the wider web: friends, communities, collaborators, and the dreams you hold for a world larger than your own household.',
    sign: 'Aquarius',
    signGlyph: '♒',
  },
  {
    number: 12,
    title: 'House of the Unconscious',
    domain: 'Solitude, dreams, spirituality, what is hidden',
    keyword: 'Dissolving',
    question: 'What is moving beneath the surface of my life?',
    description:
      'The twelfth house is the last room: solitude, dreams, intuition, retreat, and the material that has not yet become conscious. It is where the self goes to dissolve and return.',
    sign: 'Pisces',
    signGlyph: '♓',
  },
];
