# Matching research — synastry and Vedic Gun Milan

This document covers the research behind Astra’s **marriage and partnership matching** feature: what the market offers, how Western synastry works, how traditional Vedic Ashtakoot Gun Milan is calculated, what was implemented, and where the guardrails are.

---

## 1. What the market offers

### AstroTalk

AstroTalk’s matchmaking tool is a **Vedic Kundli Milan** product built around Moon sign and birth nakshatra:

- 8 kootas / 36 points: Varna (1), Vashya (2), Tara (3), Yoni (4), Graha Maitri (5), Gana (6), Bhakoot (7), Nadi (8).
- Nadi and Bhakoot are weighted heavily (15 of 36 points).
- It also advertises Mangal Dosha, Navamsa, 7th house, and Dasha analysis outside the 36-point score.
- The commercial product is an astrologer marketplace; the free matching tool is an acquisition and trust surface.

### Western astrology apps

TimePassages markets synastry and composite charts as part of its comparison/forecasting suite. Co–Star and The Pattern foreground relationship dynamics and compatibility as a social feature. The common thread is **two full charts**, not two sun signs.

### What a credible product needs

1. A real chart for each person (date, time, place).
2. A clear comparison model with visible weights/orbs.
3. A breakdown by life area and contact type.
4. House overlays, not just planet-to-planet aspects.
5. A strong “not a verdict” frame.
6. Privacy and easy removal of stored birth data.
7. Separate traditions labelled separately (tropical Western vs sidereal Vedic).

---

## 2. Western synastry research

### The core idea

Synastry overlays two natal charts. The moving comparison is not time-based (that is a transit); it is person-to-person:

- **A’s planet to B’s planet** — inter-aspects.
- **A’s planet in B’s house** — house overlays.
- **Composite or Davison charts** — a midpoint chart for the relationship itself (not implemented in this release).

### Contacts that matter most

The most studied and weighted contacts are:

- **Sun–Moon** — identity meeting emotional need; the classic “I see you” axis.
- **Venus–Mars** — attraction and desire.
- **Moon–Moon** — emotional language and safety.
- **Moon–Venus** — tenderness and affection.
- **Venus–Venus** — shared taste and love language.
- **Saturn contacts** — commitment, durability, and weight; can also feel restrictive.
- **Ascendant contacts** — first impression, body, and recognition.
- **Mercury contacts** — communication and repair.
- **Outer-planet contacts** — intensity, growth, unpredictability, and projection.

### Aspects and orbs

Astra uses the five major aspects with synastry orbs:

- conjunction 7°
- sextile 5°
- square 6°
- trine 6°
- opposition 7°

Trines and sextiles are read as ease; squares and oppositions as friction/growth; conjunctions as intensity. Tighter orbs carry more weight. The final index is a **symbolic weighted average**, not a psychometric test.

### House overlays

A planet landing in the partner’s 1st, 4th, 5th, 7th, 8th, or 10th house is traditionally significant:

- 1st — body, identity, first impression
- 4th — home, family, private life
- 5th — romance, play, creativity
- 7th — partnership and marriage
- 8th — intimacy, shared resources, transformation
- 10th — public life, career, reputation

Astra uses whole-sign houses by default. When birth time is unknown, the overlay section is marked approximate.

### What this model does not do

- It does not use composite/Davison charts.
- It does not claim to predict divorce, infidelity, fertility, or health.
- It does not collapse two people into a “yes/no” verdict.

---

## 3. Vedic Ashtakoot Gun Milan research

### The eight kootas

| Koota | Max | Basis | What it traditionally checks |
| --- | --- | --- | --- |
| Varna | 1 | Moon sign | Spiritual temperament / ego balance |
| Vashya | 2 | Moon sign | Mutual influence and attraction |
| Tara | 3 | Birth nakshatra | Health, fortune, well-being |
| Yoni | 4 | Birth nakshatra | Physical/instinctive compatibility |
| Graha Maitri | 5 | Moon-sign lords | Mental friendship and compatibility |
| Gana | 6 | Birth nakshatra | Temperament and nature |
| Bhakoot | 7 | Moon signs | Emotional and family harmony |
| Nadi | 8 | Birth nakshatra | Traditional vitality/biological symbolism |

### Varna

Moon signs map to four varnas by element:

- Water (Cancer, Scorpio, Pisces) — Brahmin
- Fire (Aries, Leo, Sagittarius) — Kshatriya
- Earth (Taurus, Virgo, Capricorn) — Vaishya
- Air (Gemini, Libra, Aquarius) — Shudra

Traditional rule: the groom’s varna should be equal to or higher than the bride’s for 1 point.

### Vashya

Five groups: Chatushpada (Aries, Taurus, second half Sagittarius, first half Capricorn), Manav (Gemini, Virgo, Libra, Aquarius, first half Sagittarius), Jalchar (Cancer, Pisces, second half Capricorn), Vanchar (Leo), Keet (Scorpio).

The scoring matrix is symmetric; the exact half-sign of Sagittarius/Capricorn matters, so the Moon’s degree is used.

### Tara

Count inclusively from the bride’s nakshatra to the groom’s, and from the groom’s to the bride’s; divide by nine and use the remainder (0 = 9). Favourable taras (2 Sampat, 4 Kshema, 6 Sadhaka, 8 Mitra, 9 Parama Mitra) award 1.5 points each direction.

Traditional conventions vary at boundaries; Astra uses an inclusive count and labels the result as a traditional estimate.

### Yoni

27 nakshatras map to 14 animals. Astra uses the standard 14×14 table (same as the open-source PyJHora/Ashtakoota table), scoring 0–4. The seven classical enemy pairs score 0:

Horse–Buffalo, Elephant–Lion, Sheep–Monkey, Serpent–Mongoose, Dog–Deer, Cat–Rat, Cow–Tiger.

### Graha Maitri

The Moon-sign lords are compared using natural planetary friendship:

- Sun: friends Moon/Mars/Jupiter; neutral Mercury; enemies Venus/Saturn
- Moon: friends Sun/Mercury; neutral Mars/Jupiter/Venus/Saturn; no enemies
- Mars: friends Sun/Moon/Jupiter; neutral Venus/Saturn; enemy Mercury
- Mercury: friends Sun/Venus; neutral Mars/Jupiter/Saturn; enemy Moon
- Jupiter: friends Sun/Moon/Mars; neutral Saturn; enemies Mercury/Venus
- Venus: friends Mercury/Saturn; neutral Mars/Jupiter; enemies Sun/Moon
- Saturn: friends Mercury/Venus; neutral Jupiter; enemies Sun/Moon/Mars

Scoring: same lord or mutual friends 5; friend+neutral 4; mutual neutral 3; friend+enemy 1; neutral+enemy 0.5; mutual enemies 0.

### Gana

Three groups:

- Deva: Ashwini, Mrigashira, Punarvasu, Pushya, Hasta, Swati, Anuradha, Shravana, Revati
- Manushya: Bharani, Rohini, Ardra, Purva Phalguni, Uttara Phalguni, Purva Ashadha, Uttara Ashadha, Purva Bhadrapada, Uttara Bhadrapada
- Rakshasa: Krittika, Ashlesha, Magha, Chitra, Vishakha, Jyeshtha, Mula, Dhanishta, Shatabhisha

Matrix (bride row, groom column): Deva/Deva 6, Deva/Manushya 5, Deva/Rakshasa 1; Manushya/Deva 5, Manushya/Manushya 6, Manushya/Rakshasa 0; Rakshasa/Deva 1, Rakshasa/Manushya 0, Rakshasa/Rakshasa 6.

### Bhakoot

Moon-sign distance pairs:

- 2–12, 5–9, 6–8 → 0 points (Bhakoot dosha)
- other pairs → 7 points

### Nadi

Three nadis:

- Adi: Ashwini, Ardra, Punarvasu, Uttara Phalguni, Hasta, Jyeshtha, Mula, Shatabhisha, Purva Bhadrapada
- Madhya: Bharani, Mrigashira, Pushya, Purva Phalguni, Chitra, Anuradha, Purva Ashadha, Dhanishta, Uttara Bhadrapada
- Antya: Krittika, Rohini, Ashlesha, Magha, Swati, Vishakha, Uttara Ashadha, Shravana, Revati

Same nadi → 0 (Nadi dosha); different → 8.

### Sidereal calculation

Astra computes the **Lahiri/Chitrapaksha** sidereal Moon by subtracting an approximate ayanamsa from the tropical Moon:

`ayanamsa ≈ 23.85° + 0.013972° × (year − 2000)`

This gives about 24.21° in 2026, consistent with published Lahiri values of roughly 24°13′–24°14′. The approximation is disclosed; births near a nakshatra boundary may shift with a more precise ephemeris.

The Moon sign, nakshatra, pada, gana, nadi, yoni, varna, and vashya are then derived from the sidereal longitude.

### Role order

Traditional Gun Milan is role-sensitive in Varna, Gana, and Tara because it assumes a bride and groom. Astra labels the two people as **You** and **Partner**, and provides a toggle for the traditional order:

- You as bride / Partner as groom
- Partner as bride / You as groom

The Western synastry is role-neutral; the Vedic layer is not. This is stated in the UI.

### What is not implemented

- **Cancellation rules** for Nadi/Bhakoot/Gana doshas (different schools apply different exceptions).
- **Mangal Dosha** and full Vedic chart analysis (7th house, Venus/Jupiter, Navamsa, Dasha).
- **Ashtakavarga, Shadbala, and divisional charts**.
- **A complete Vedic kundli** with sidereal Ascendant and houses.

The 36-point layer is therefore a **traditional Moon-based estimate**, not a complete Jyotish consultation.

---

## 4. Implementation

### Western synastry engine

- `src/lib/synastry.ts`
- Builds inter-aspects between both charts’ Sun–Pluto, Node, Ascendant, and Midheaven.
- Uses major aspects and tighter synastry orbs.
- Pair weights emphasize Sun–Moon, Venus–Mars, Moon–Moon, Venus–Venus, Saturn contacts, and Ascendant contacts.
- The five category scores are a weighted index, clamped to 8–96 and combined into an overall index. The score is explicitly symbolic.
- House overlays use the receiving chart’s whole-sign houses.
- Returns strengths, growth edges, conversation prompts, and a “not a verdict” summary.

### Vedic engine

- `src/lib/vedic.ts`
- Derives the sidereal Moon, nakshatra, pada, rashi, varna, vashya, gana, nadi, and yoni.
- Scores all eight kootas with the traditional tables above.
- Displays raw scores, role order, dosha flags (without cancellation), and a traditional band.
- Uses a separate visual language so it is not confused with the Western synastry.

### UX decisions

- Two charts are stored locally; “Forget” removes them.
- Share links encode both charts in the URL; treat them as sensitive.
- The report can be regenerated from the page without an account.
- The Vedic section is below the Western report, clearly labelled as a separate system.
- Time-unknown charts are marked approximate for rising/houses and for the Moon-based Vedic factors.

---

## 5. Ethical guardrails

- **No yes/no verdict.** The product does not say “marry” or “do not marry.”
- **No medical or fertility claims.** Nadi is framed as traditional biological symbolism, not a diagnosis. The UI says it is not medical.
- **No genetic claims.** Traditional language is labelled symbolic.
- **No fear copy.** Doshas are “traditional flags” with a note that cancellation rules and the full charts matter.
- **Agency.** The report ends with questions for the couple, not instructions.
- **Role transparency.** The Vedic layer exposes the role-sensitive nature of the traditional method.
- **Privacy.** Charts are local; the share link contains birth data; “Forget” removes local data.
- **Method transparency.** Orbs, weights, sidereal approximation, and missing cancellation rules are disclosed.

---

## 6. Validation

- [x] Two charts load from query-string, localStorage, or forms.
- [x] Two forms use unique input IDs and can be submitted independently.
- [x] Saving A updates the shared chart; saving B updates the partner chart.
- [x] Reload without query loads both saved charts.
- [x] Share link contains both charts and restores them.
- [x] “Forget” removes one or both charts.
- [x] Synastry categories and key aspects render for a real pair.
- [x] House overlays use whole-sign houses and are labelled approximate when time is unknown.
- [x] Vedic 36-point table renders all eight kootas and dosha flags.
- [x] Vedic role order toggles without breaking the profile labels.
- [x] Light/dark/system themes remain readable.
- [x] Axe WCAG 2.0/2.1 A/AA + best-practice clean on desktop and mobile.
- [x] No horizontal overflow at 390 px.
- [x] Build and type check pass.

Known limitations:

- Lahiri ayanamsa is approximated.
- Tara boundary conventions vary.
- No dosha cancellation rules.
- No Mangal Dosha, full Vedic chart, Navamsa, or Dasha.
- No composite/Davison chart yet.
- Score weights are an editorial model, not a scientific standard.

---

## 7. Sources

Vedic matching:

- AstroTalk, “Ashtakoot Gun Milan” — 8 kootas, points, score bands, doshas — https://astrotalk.com/matchmaking/ashtakoot
- AstroTalk, Varna Koota — https://astrotalk.com/matchmaking/varna-koota
- AstroTalk, Vashya Koota — https://astrotalk.com/matchmaking/vashya-koota
- AstroTalk, Tara Koota — https://astrotalk.com/matchmaking/tara-koota
- AstroTalk, Yoni Koota — animals, enemy pairs, scoring levels — https://astrotalk.com/matchmaking/yoni-koota
- AstroTalk, Graha Maitri Koota — https://astrotalk.com/matchmaking/graha-maitri-koot
- AstroTalk, Gana Koota — https://astrotalk.com/matchmaking/gana-koota
- AstroTalk, Bhakoot Koota — https://astrotalk.com/matchmaking/bhakoot-koota
- AstroTalk, Nadi Koota — https://astrotalk.com/matchmaking/nadi-koota
- NRI Hearts, Yoni compatibility table — standard 14×14 Ashtakoota table, PyJHora reference — https://nrihearts.com/yoni-matching
- Navamsha, “Ashtakoot Gun Milan: All 8 Kootas and the 36-Point System” — https://www.navamsha.in/blog/ashtakoot-gun-milan-36-points-explained

Lahiri ayanamsa:

- Vedic Astro Lab, “Lahiri Ayanamsa” — 23°51′26″ in 2000, ~24°13′ in 2026 — https://vedicastrolab.com/learn/lahiri-ayanamsa
- Vastuguruji, “Lahiri Ayanamsa 2026” — https://vastuguruji.com/ayanamsa-calculation/

Synastry:

- Amora, “What is synastry?” — Sun–Moon, Venus–Mars, Moon–Moon, Ascendant, Saturn; orbs — https://www.astroamora.com/en/blog/what-is-synastry-explained
- NextAstrology, “How to read a synastry chart” — aspect and planet meanings — https://www.nextastrology.com/post/how-to-read-a-synastry-chart-real-astrology-compatibility-not-just-sun-signs
- Astro-Seek, synastry and transit aspect reference — https://horoscopes.astro-seek.com/transit-aspects-astrology-free-interpretations
- The Inner Wheel, “Astrology Transits” — house overlays and timing context — https://theinnerwheel.com/astrology-transits-complete-guide

Product context:

- TimePassages — synastry/composite and personalized chart comparisons — https://astrograph.com/timepassages/mobile
- CHANI — personalized readings and relationship/transit framing — https://www.chani.com/app
- Co–Star — relationship comparison and personalized daily horoscopes — https://www.costarastrology.com
- The Pattern — bonds and timing — https://www.thepattern.com
- AstroTalk matchmaking — Gun Milan, Mangal Dosha, Navamsa context — https://astrotalk.com/matchmaking

Technical:

- Astronomy Engine — https://github.com/cosinekitty/astronomy
- MDN, `Intl.DateTimeFormat` — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
