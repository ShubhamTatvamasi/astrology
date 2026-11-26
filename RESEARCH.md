# Research notes — Astra

This document records the research behind the product: the astrological framework, the astronomical calculations, the content model, and the design decisions. It is also the place to look when changing a meaning, an orb, or a house system.

---

## 1. Product thesis

Most people meet astrology as a sun-sign label: a date range, a list of adjectives, and a daily horoscope. That experience is thin, repetitive, and often ad-heavy. The gap Astra fills is **a real chart with a readable explanation**:

- Calculate the actual sky at birth, not a date-range guess.
- Explain the big three first, then let people go deeper.
- Treat astrology as a symbolic language, not a prediction machine.
- Keep it free, accountless, and private.
- Make the chart itself beautiful enough to want to explore.

Primary audience: curious beginners and casually astrology-literate adults who have used a sun-sign app but never had their full chart explained. Secondary audience: people who already know their chart and want a clean reference for signs, houses, and aspects.

---

## 2. Astrology framework

### 2.1 The big three

The “big three” are the three most legible placements in a natal chart:

| Placement | Function | Why it matters |
| --- | --- | --- |
| **Sun** | Core identity, vitality, purpose | The “I am”; the sign most people call “their sign” |
| **Moon** | Emotion, instinct, memory, safety | The private inner life and what soothes it |
| **Ascendant / rising** | First impression, approach, interface with the world | The eastern horizon at birth; changes roughly every two hours |

Sources: CHANI’s glossary and Kathryn Hocking’s beginner guide both frame the big three this way; the rising sign is specifically the degree of the ecliptic intersecting the eastern horizon at the birth moment.

### 2.2 The twelve signs

Every sign combines one **element** (Fire, Earth, Air, Water) and one **modality** (Cardinal, Fixed, Mutable). The classical order, dates, rulers, and keywords used in `src/data/signs.ts`:

| Sign | Dates (approx.) | Element | Modality | Ruler | Keyword |
| --- | --- | --- | --- | --- | --- |
| Aries | Mar 21 – Apr 19 | Fire | Cardinal | Mars | Ignite |
| Taurus | Apr 20 – May 20 | Earth | Fixed | Venus | Savor |
| Gemini | May 21 – Jun 20 | Air | Mutable | Mercury | Connect |
| Cancer | Jun 21 – Jul 22 | Water | Cardinal | Moon | Shelter |
| Leo | Jul 23 – Aug 22 | Fire | Fixed | Sun | Radiate |
| Virgo | Aug 23 – Sep 22 | Earth | Mutable | Mercury | Refine |
| Libra | Sep 23 – Oct 22 | Air | Cardinal | Venus | Harmonize |
| Scorpio | Oct 23 – Nov 21 | Water | Fixed | Pluto (Mars traditional) | Transform |
| Sagittarius | Nov 22 – Dec 21 | Fire | Mutable | Jupiter | Explore |
| Capricorn | Dec 22 – Jan 19 | Earth | Cardinal | Saturn | Build |
| Aquarius | Jan 20 – Feb 18 | Air | Fixed | Uranus (Saturn traditional) | Disrupt |
| Pisces | Feb 19 – Mar 20 | Water | Mutable | Neptune (Jupiter traditional) | Dissolve |

Research notes:

- The dates are conventional ranges, not astronomical constants. The Sun’s ingress shifts by a day between years; the app therefore calculates the exact Sun degree rather than using dates for charts.
- Modern rulers (Uranus, Neptune, Pluto) coexist with traditional rulers (Saturn, Jupiter, Mars). The sign data shows the modern ruler, with traditional rulerships acknowledged in the research but not duplicated in the UI.
- Element meanings: Fire = spirit/drive, Earth = body/matter, Air = mind/connection, Water = soul/feeling.
- Modality meanings: Cardinal initiates, Fixed sustains, Mutable adapts. The same element behaves differently through each modality, which is why Aries, Leo, and Sagittarius are not interchangeable.

### 2.3 The planets

Astra includes the Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, and the mean North Node. Each is a **function** rather than a literal cause:

| Body | Function | Cycle used in copy |
| --- | --- | --- |
| Sun | Identity, vitality | 1 year |
| Moon | Emotion, instinct | 29.5 days |
| Mercury | Mind, communication | 88 days |
| Venus | Love, values, beauty | 225 days |
| Mars | Drive, desire, anger | 687 days |
| Jupiter | Growth, meaning, luck | 12 years |
| Saturn | Structure, limit, mastery | 29.5 years |
| Uranus | Disruption, freedom | 84 years |
| Neptune | Imagination, compassion, illusion | 165 years |
| Pluto | Power, transformation | 248 years |
| North Node | Direction of growth (not a planet) | 18.6 years |

Retrograde is treated as **apparent geocentric motion**, not a planet moving backwards. The copy frames retrogrades as invitations to review and revise, avoiding the common “retrograde = disaster” framing.

### 2.4 The houses

Houses are the “where” of a chart. The app uses **whole sign houses** by default: the rising sign becomes the whole first house, the next sign the second, and so on. An **equal house** option measures 30° segments from the exact Ascendant.

Whole sign is one of the oldest house systems (Hellenistic), while Placidus is common in modern Western astrology. The app documents the choice rather than implying a universal grid. House meanings used in `src/data/houses.ts`:

| House | Domain | Natural sign |
| --- | --- | --- |
| 1 | Self, body, first impressions | Aries |
| 2 | Money, values, resources | Taurus |
| 3 | Communication, learning, siblings | Gemini |
| 4 | Home, family, roots | Cancer |
| 5 | Creativity, romance, play | Leo |
| 6 | Work, health, routine | Virgo |
| 7 | Partnership, contracts | Libra |
| 8 | Intimacy, shared resources, rebirth | Scorpio |
| 9 | Travel, belief, higher learning | Sagittarius |
| 10 | Career, reputation, legacy | Capricorn |
| 11 | Friends, groups, future hopes | Aquarius |
| 12 | Solitude, dreams, the unconscious | Pisces |

### 2.5 Aspects and orbs

Aspects are angular relationships between planets. The five Ptolemaic majors, the orbs used in the app, and their interpretive tone:

| Aspect | Angle | Orb | Tone |
| --- | --- | --- | --- |
| Conjunction | 0° | 8° | Fusing / intensifying |
| Sextile | 60° | 5° | Opportunity |
| Square | 90° | 7° | Friction / productive tension |
| Trine | 120° | 7° | Flow |
| Opposition | 180° | 8° | Balance / projection |

Orbs are a matter of interpretive convention; different astrologers use different values. The app keeps a single readable set and states the values in the methodology. Minor aspects (quincunx, semisextile, etc.) are deliberately omitted to keep the wheel legible; the Learn page names this limitation.

Sources agree on the five major aspects and on the general logic of orbs (tighter = stronger). The app calculates the exact angular separation, subtracts the aspect angle, and compares the remainder to the orb.

### 2.6 Moon phases

The lunar cycle is about 29.53 days. The phase is defined by the **elongation** — the difference in ecliptic longitude between the Moon and the Sun as seen from Earth:

- 0° = new moon
- 90° = first quarter
- 180° = full moon
- 270° = last quarter

Astra uses eight phase bins centered on those points (new, waxing crescent, first quarter, waxing gibbous, full, waning gibbous, last quarter, waning crescent). Illumination is calculated from the Moon’s phase angle, not approximated from the date. The visual moon uses the standard terminator construction: an outer circular limb plus an elliptical terminator whose semi-minor axis is `r × |cos(elongation)|`.

The phase copy is reflective rather than predictive: new moon = begin, full moon = reveal, waning = release, etc.

---

## 3. Astronomical research and implementation

### 3.1 Ephemeris

**Astronomy Engine** (MIT, Donald Cross) was chosen because it is:

- self-contained and dependency-free,
- accurate to roughly one arcminute against NOVAS,
- available as a small JS module that works in the browser,
- based on VSOP87 for planets and a dedicated lunar model.

The app needs **apparent geocentric ecliptic longitude of date** for the tropical zodiac. The pipeline is:

1. `GeoVector(body, time, true)` — geocentric equatorial J2000 vector with aberration.
2. `Rotation_EQJ_ECT(time)` — rotate to the true ecliptic of date.
3. `atan2(y, x)` — longitude in the tropical zodiac.

This was checked against known lunation and chart data. For the Moon, the result matches `EclipticGeoMoon` to the displayed precision.

Retrograde is detected by comparing the longitude one day later; a negative change means retrograde. The Sun and Moon are excluded from retrograde display.

### 3.2 Ascendant and Midheaven

The Ascendant is the ecliptic degree rising on the eastern horizon. It cannot be derived from the Sun sign alone; it needs the birth instant and location.

Implementation:

```
GST  = apparent sidereal time at Greenwich (Astronomy Engine)
LST  = GST + longitude / 15          (east positive)
RAMC = LST × 15
ε    = mean obliquity of the ecliptic at the date
φ    = geographic latitude

ASC = atan2(cos RAMC,
            −(sin RAMC · cos ε + tan φ · sin ε))
MC  = atan2(sin RAMC, cos RAMC · cos ε)
```

Validation against a published birth record (George W. Bush, 6 July 1946, 07:26, New Haven, CT, 41.3083° N, 72.9279° W):

| Point | Published chart | Astra |
| --- | --- | --- |
| Sun | 13°47′ Cancer | 13°46′ Cancer |
| Moon | 16°42′ Libra | 16°42′ Libra |
| Ascendant | 7°06′ Leo | 7°06′ Leo |
| Midheaven | 24°12′ Aries | 24°12′ Aries |

The Sun difference is within about one arcminute, consistent with the published chart’s rounding conventions; the Ascendant and MC match to the minute.

### 3.3 Time zones

Birth data is entered as local wall time. To get the correct UTC instant:

- City entries carry an IANA time zone from the geocoding result.
- `Intl.DateTimeFormat` with `timeZone` is used to compute the historical offset, including daylight saving.
- The wall time is converted by iterating the offset until stable (handles DST boundaries).
- Manual entries use an explicit UTC offset in hours, including fractional offsets such as +05:30 or +05:45.

This matters: a one-hour DST error moves the Ascendant by roughly 15°, often into the next sign.

### 3.4 House systems and the lunar node

- **Whole sign:** house = (planet sign − rising sign + 12) mod 12 + 1; cusps at 0° of each sign.
- **Equal:** house = floor((longitude − Ascendant) / 30) + 1; cusps every 30° from the exact Asc.
- **North Node:** mean node from the standard polynomial `125.0445479 − 1934.1362891 T + …`. The true node oscillates around the mean node; the mean node is smoother and is labeled as such.

### 3.5 Geocoding

City search uses the **Open-Meteo Geocoding API** (no key, CORS-friendly), which returns latitude, longitude, and the IANA time zone. If the API fails, the form offers a manual latitude/longitude/UTC-offset path so the app remains usable offline. No birth data is sent to the API — only the typed city name.

---

## 4. Content research

The sign, house, planet, and aspect copy was written from the shared framework in the sources below and then edited for consistency of voice:

- Planets = functions, signs = styles, houses = arenas, aspects = relationships.
- Every sign has a light and a shadow; shadow text is framed as overused gift, not moral failure.
- Compatibility is explicitly framed as sun-sign chemistry only; real relationship astrology needs both charts (Moon, Venus, Mars, aspects).
- Avoid deterministic claims; use “traditionally,” “symbolically,” “invitation,” and “growth edge.”
- Include a clear disclaimer on every page footer and in the methodology.

Retrograde copy follows the modern reflective interpretation rather than the “bad luck” trope.

---

## 5. Design and animation research

### 5.1 Visual direction

- **Palette:** near-black navy (#05060d), warm gold (#e8c47c), violet (#8b6cf6), with element accents: fire #ff8a5c, earth #7fcf9d, air #8fb8ff, water #b79dff.
- **Type:** Instrument Serif for display (astrological, editorial, not mystical cliché); Space Grotesk for UI/body (technical, contemporary). The contrast encodes “ancient language, modern tool.”
- **Surfaces:** low-opacity white gradients, thin borders, backdrop blur; no heavy glassmorphism everywhere.
- **Motion:** slow cosmic drift, not constant distraction. Motion is concentrated in the hero wheel, starfield, chart line-draw, and reveal-on-scroll.

### 5.2 Animation inventory

- Canvas starfield with three parallax depths, twinkle, occasional meteors, pointer parallax; disabled or static for `prefers-reduced-motion`.
- Hero cosmic wheel: rotating dashed rings, orbiting dots, floating planets, pulsing core.
- Sign sigil: rotating rings, constellation twinkle, element-colored aura.
- Chart wheel: staggered sign/glyph entrance, aspect lines drawn with `stroke-dashoffset`, planets fade in, selected planet isolates its aspects.
- Scroll reveals with IntersectionObserver and staggered delays.
- Card radial spotlight following the pointer (CSS variables `--mx`/`--my`).
- Page transitions via Astro’s `<ClientRouter />`.
- All animation respects reduced motion; interactive controls remain static and usable.

### 5.3 Accessibility

- Skip link, semantic landmarks, one `h1` per page.
- Visible focus rings, keyboard-operable chart planets and table rows.
- Table alternative for every chart placement (the SVG wheel is supplementary).
- `aria-pressed` on filters and toggles, `aria-live` on results.
- Color is never the only carrier of meaning (element names, aspect names, text labels).
- Minimum body size, high-contrast muted text, and generous tap targets on mobile.

---

## 6. Known limitations

- Tropical zodiac only; no sidereal/Vedic mode.
- Mean North Node, not true node.
- No Chiron, asteroids, or fixed stars.
- No Placidus/Koch house systems (whole sign + equal only).
- No synastry/compatibility chart tool yet; sign compatibility is interpretive only.
- Unknown birth time necessarily makes the Ascendant, MC, and houses approximate.
- City search depends on a third-party API; manual coordinates are the fallback.
- Orbs are a fixed, documented set; other astrologers may use different values.
- The app is not a predictive or medical tool and says so.

---

## 7. Sources

Astrology:

- Kathryn Hocking, “The basics of astrology — how to read your birth chart” — https://kathrynhocking.com/the-basics-of-astrology
- The Old Farmer’s Almanac, “12 Astrology Zodiac Signs: Dates, Symbols, Traits, and Elements” — https://www.almanac.com/12-astrology-zodiac-signs
- The Old Farmer’s Almanac, “Astrological Aspects: What They Mean in Your Birth Chart” — https://www.almanac.com/what-do-aspects-mean-astrology
- Labyrinthos, “The 12 Houses of Astrology” — https://labyrinthos.co/blogs/astrology-horoscope-zodiac-signs/the-12-houses-of-astrology-the-astrological-houses-and-your-natal-chart
- CHANI, “Astrological key terms” — https://www.chani.com/blogs/astrological-key-terms
- CHANI, “What are Moon phases, and how can you work with them?” — https://www.chani.com/astro-education/what-are-moon-phases-and-how-can-you-work-with-them
- ZodiacRoots, “Astrology Fundamentals: Ultimate Guide” — https://zodiacroots.com/astrology-fundamentals
- Wikipedia, “Astrological aspect” — https://en.wikipedia.org/wiki/Astrological_aspect
- ZODIA, “How Your Rising Sign Is Calculated” — https://joinzodia.com/how-rising-sign-is-calculated.html

Astronomy:

- NASA Space Place, “What Are the Moon’s Phases?” — https://spaceplace.nasa.gov/moon-phases
- U.S. Naval Observatory, “Phases of the Moon and Percent of the Moon Illuminated” — https://aa.usno.navy.mil/faq/moon_phases
- Astronomy Engine (source and docs) — https://github.com/cosinekitty/astronomy
- Astronomy Engine on npm — https://www.npmjs.com/package/astronomy-engine
- Open-Meteo Geocoding API — https://open-meteo.com/en/docs/geocoding-api

Chart validation:

- Astrotheme, “Astrological chart of George W. Bush” — https://www.astrotheme.com/astrology/George_W._Bush
- Astro-Seek, “Birth chart of George W. Bush” — https://www.astro-seek.com/birth-chart/george-w-bush-horoscope

Platform:

- Astro docs, “Deploy to GitHub Pages” — https://docs.astro.build/en/guides/deploy/github/
- Astro docs, view transitions — https://docs.astro.build/en/guides/view-transitions/
- MDN, `Intl.DateTimeFormat` — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat

---

## 8. Validation checklist used before release

- [x] Sun/Moon/Asc/MC match a published birth record.
- [x] Whole-sign house assignment matches the rising sign.
- [x] DST conversion verified with a 1946 US birth record.
- [x] Manual UTC offset path verified.
- [x] Time-unknown path labels rising/houses as approximate.
- [x] Moon phase renders correctly at new, quarters, gibbous, and full.
- [x] Aspect orbs and colors consistent between data, wheel, table, and detail panel.
- [x] All routes render with the `/astrology` base path.
- [x] No console errors through the form → chart → navigation flows.
- [x] Mobile menu, form, results, and chart wheel usable at 390 px.
- [x] `npm run check`, `npm run build`, and sitemap generation pass.
- [x] Reduced-motion media query disables non-essential motion.
