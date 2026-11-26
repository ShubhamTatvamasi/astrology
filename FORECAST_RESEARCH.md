# Forecast research — from horoscope to personalized timing

This document covers the research and design behind Astra’s **personal forecast**: why it exists, what leading astrology products actually offer, how transit timing works, how the forecast engine composes its language, and where the ethical lines are.

The short version: the meaningful gap is not “more predictions.” It is **personalized, dated, life-area-specific interpretation** with a visible method and room for the user’s own judgment.

---

## 1. What the market actually does

### AstroTalk (Vedic marketplace)

AstroTalk is primarily a marketplace connecting users to astrologers over chat, call, and video. Its free features are the daily habit loop:

- free kundli (birth chart) with Vedic calculations,
- daily/weekly/monthly rashi horoscopes,
- panchang (tithi, nakshatra, muhurat),
- kundli matching / Gun Milan (36-point compatibility),
- dasha timelines (Vimshottari Mahadasha/Antardasha),
- doshas, yogas, and gemstone/remedy upsells.

The calculation layer is Vedic: sidereal zodiac, Lahiri ayanamsa, nakshatras, Vimshottari dasha, and Ashtakoot matching. The business layer is human consultation. The relevance for Astra: **the free daily value is personalized, recurring, and tied to a saved chart/time system** — not just a sun-sign paragraph.

### TimePassages

TimePassages explicitly markets a “personalized daily horoscope” calculated from the user’s unique birth chart, plus transits, progressions, saved profiles, and comparisons. Its paid tiers revolve around unlimited charts, forecasting, and synastry/composite charts.

Relevance: **a saved natal chart is the unit of personalization**; daily value comes from comparing current sky to that chart.

### CHANI

CHANI offers daily sign-specific horoscopes, planetary horoscopes, Moon-phase readings, and personalized daily/weekly/monthly readings. Its transit readings show a **date range and an exact date**, and describe short-term themes (for example, a once-in-a-lifetime outer-planet transit). The app is explicitly “written by astrologers, not AI.”

Relevance: users understand transit windows better when the interface shows **“active now,” “building,” and “exact on …”** rather than one vague paragraph.

### Co–Star

Co–Star uses NASA data, human astrologers, and AI to produce personalized daily horoscopes and relationship comparisons. Its brand is direct, social, and notification-driven.

Relevance: personalization plus a strong daily voice creates habit; the relationship layer drives sharing.

### The Pattern

The Pattern frames astrology as patterns, bonds, and timing. It offers personalized insights, daily guidance, transit cycles, and connection reports.

Relevance: people want **life-area language and timing**, not only planet names.

### Astrodienst / Astro.com

Astro.com’s “Transits of the Year” is built from actual planetary movements over the natal chart and focuses on themes and timing for the year. It is a useful counterweight to short-form horoscopes: transits are read as **longer chapters**, not daily fortune.

### Synthesis

The market converges on five jobs:

1. **Tell me about me** — a real chart, not a sun-sign label.
2. **Tell me about today** — a reason to return.
3. **Tell me when** — windows, peaks, retrogrades, moon phases.
4. **Tell me where it lands** — love, work, money, health, growth.
5. **Let me compare** — relationships and compatibility (a major acquisition loop).

Astra already had 1. The forecast adds 2–4. Compatibility is a deliberate future roadmap item, not something to fake with a sun-sign score.

---

## 2. Transit theory used by the engine

### Transits are sky-to-natal geometry

A transit is a moving planet’s current position compared with a fixed point in the natal chart. The moving planet describes **what is activating**; the natal point describes **what part of the person is being activated**; the aspect describes **how**; the natal house describes **where**.

- **Transiting planet** = the temporary theme (Jupiter expands, Saturn structures, Uranus disrupts, etc.).
- **Natal planet/point** = the life function being touched (identity, emotion, mind, love, drive, etc.).
- **Aspect** = the relationship (conjunction fuses, trine flows, square creates friction, opposition asks for balance).
- **Transit house** = the arena of life (work, home, partnership, etc.).

### Orbs and exactness

There is no universal orb. Transit work generally uses **tighter orbs than natal work** because the goal is timing, not just character. A common practice is to treat an aspect as active within a few degrees and most potent within about one degree of exact. Applying aspects (moving toward exact) are often experienced as more urgent than separating ones, though astrologers disagree on weighting.

Astra uses:

- conjunction 5°, sextile 3°, square 4°, trine 4°, opposition 5° for **active** aspects,
- a wider 8° “look” window only to include aspects that will become exact inside the selected forecast range,
- applying aspects weighted slightly higher,
- exact dates found by sampling the ephemeris (6-hour steps for fast planets, daily for slow planets) and locating the closest approach within 0.3°.

The UI shows **orb**, **applying/separating**, and **exact/next exact** so the user can see how the conclusion was reached.

### Exact hits can repeat

Because planets station and retrograde, the same transit can become exact three times. A single daily scan would miss this. Astra stores one closest-approach event per transit–natal–aspect pair inside the selected window; it favors clarity over a complete station-by-station audit. The limitation is documented rather than hidden.

### Fast vs slow planets

- The **Moon** changes sign every ~2.5 days and aspects are fleeting; it is included in the daily emotional weather but excluded from the 30-day exact timeline to avoid noise.
- **Sun, Mercury, Venus, Mars** create day-to-week windows.
- **Jupiter and Saturn** create weeks-to-months of theme.
- **Uranus, Neptune, Pluto** create chapters measured in years.

The engine therefore does not treat a Moon square and a Pluto conjunction as equal “events.” Planet weights and the language differ.

### Houses

Astra uses whole-sign houses by default: the rising sign is the whole first house. This is a traditional system, easy to explain, and stable for people with an approximate birth time. The forecast states that house themes are approximate when the birth time is unknown.

### Stations and ingresses

- **Stations** (retrograde/direct) are turning points: the theme is reviewed, internalized, or released.
- **Ingresses** (planet enters a new sign) change the tone of a planet’s expression for everyone, but the house it lands in makes it personal.
- **Moon phases** provide a shared rhythm for beginning, building, culminating, and releasing.

Astra detects these by scanning daily positions, then lists them in the timing timeline. Dates are approximate to the day and shown in the user’s local time zone.

---

## 3. Why not a generic daily horoscope?

A sun-sign horoscope is the same paragraph for millions of people. It cannot know:

- which house the Sun is transiting for you,
- whether Saturn is touching your natal Moon or your Midheaven,
- whether Venus is activating your 7th house or your 12th,
- whether an aspect is applying or separating,
- whether you were born at noon or at 3 a.m.

Personalization is not a premium feature; it is the minimum condition for a forecast to be **about the user**. The forecast therefore requires a chart (saved locally or passed in the URL) and never substitutes a sign-level reading for a chart-level one.

---

## 4. Forecast architecture

### Inputs

- Natal chart: Sun–Pluto, North Node, Ascendant, Midheaven; whole-sign houses.
- Current date/time.
- Selected range: today (1 day), this week (7), this month (30).

### Calculation pipeline

1. Compute current transiting positions.
2. Build transit aspects to all natal points with tight orbs.
3. For each candidate, calculate orb, applying/separating, exact date (within 30 days), house, strength, and life areas.
4. Compute life-area emphasis from the aspects, natal domains, and transit houses.
5. Compute the daily headline, summary, do/release suggestions, and journal prompt.
6. Build the timing timeline from exact aspects, stations, ingresses, and moon phases.
7. Format everything for the selected range.

### Life-area model

Five areas: **Love & connection, Work & direction, Mind & voice, Body & wellbeing, Growth & meaning.**

Each transit receives area scores:

- +2 for the transiting planet’s natural areas (Jupiter → growth/career/love),
- +2 for the natal point’s domains (Venus → love/values),
- +1 for the transit house’s life area (10th → career).

The top two areas become the transit’s tags. For each area, the strongest aspect not already used as another area’s lead is selected, so the five cards do not all repeat the same transit. The signal meter is an **emphasis** indicator, not a good/bad score. “Quiet” is a valid result.

### Language composition

Every reading is assembled deterministically from:

- a transit-planet profile (theme, gift, watch),
- a natal domain (identity, emotion, mind, love, etc.),
- an aspect template (verb, tone, guidance),
- the transit house,
- applying/separating and retrograde status,
- an exact date when available.

This is important: the forecast is **not** an LLM improvising predictions. It is auditable, repeatable, and bounded by the data. The trade-off is less linguistic variety; a future version can expand the template library without changing the astronomy.

### Example

> Venus square your natal Moon. Make the warm gesture. Beautify something. Ask for what you actually want. Let the friction refine the approach. Your 2nd house of money, values, possessions, self-worth is the arena.

- Venus = love/values.
- Natal Moon = emotional needs/home.
- Square = friction that asks for adjustment.
- 2nd house = values/resources.
- The advice is a prompt, not a promise.

### Timing timeline

The timeline includes:

- exact transit aspects (within 0.3°),
- planetary stations (retrograde/direct),
- sign ingresses,
- new/full/quarter moon phases.

For “Today,” the timeline shows the next three days; for week/month it matches the selected range. Dates are local to the device.

---

## 5. Ethical guardrails

Astrology is a symbolic and reflective tradition. It is not an empirical science, and the forecast must not pretend otherwise.

Design rules:

- **No specific event predictions.** No “you will meet someone,” “you will get the job,” “do not travel,” or health/financial instructions.
- **No fear copy.** Retrogrades, squares, and Pluto are not punishments.
- **Agency over fate.** Every card offers a prompt or a choice.
- **Show the method.** Orbs, houses, applying/separating, exact dates, and the limits of the model are visible.
- **Unknown time is labeled.** Houses and rising sign are approximate; the app says so.
- **No professional advice.** Medical, legal, financial, and mental-health decisions need qualified humans.
- **Privacy.** The chart is stored locally and can be forgotten; no account or server profile.

The app says “weather, not fate” because that is exactly the claim it can support.

---

## 6. What was deliberately not built (yet)

- **Vedic dasha / kundli matching.** Valuable for an AstroTalk-style audience, but it requires a sidereal/Lahiri layer, nakshatras, and a different interpretive frame. Mixing it silently with a tropical chart would be misleading.
- **Synastry / compatibility scores.** A major acquisition feature, but a credible version needs two full charts, weighted inter-aspects, house overlays, and a careful “not a verdict” UI.
- **Progressions and solar returns.** Strong for year-ahead readings; the transit forecast is the higher-frequency habit loop.
- **Notifications and a daily email.** No backend and no account; could be added with a privacy-first opt-in later.
- **AI chat astrologer.** Not until the deterministic engine and safety boundaries are mature.

These are roadmap items, not gaps to paper over with generic content.

---

## 7. Validation checklist

- [x] Transit aspects match known current positions and a published natal chart.
- [x] Applying/separating agrees with the next sampled position.
- [x] House assignment matches whole-sign rising sign.
- [x] Exact dates appear for tight applying aspects.
- [x] Stations, ingresses, and moon phases appear in the correct window.
- [x] Life-area cards use distinct lead transits where possible.
- [x] Quiet areas produce an honest “quiet” state rather than invented activity.
- [x] Saved chart reloads from localStorage; “Forget” removes it.
- [x] URL-shared forecast saves locally and can be forgotten.
- [x] Today/week/month ranges change the aspects and timeline.
- [x] Unknown birth time labels houses/rising as approximate.
- [x] Dark, light, and system themes remain readable.
- [x] Axe (WCAG 2.0/2.1 A/AA + best practice) clean on forecast desktop and mobile.
- [x] No console errors in the form → forecast → range → forget flow.

---

## 8. Sources

Market and product:

- AstroTalk — free kundli, daily horoscope, matching, dasha context — https://astrotalk.com/freekundli and https://astrotalk.com/horoscope/daily-horoscope
- RoxyAPI, “Build an AstroTalk alternative” — free features as retention loop; Vedic calculation requirements — https://roxyapi.com/blogs/build-astrotalk-alternative-vedic-astrology-api
- TimePassages — personalized daily horoscope from birth chart, transits, progressions, comparisons — https://astrograph.com/timepassages/mobile and https://apps.apple.com/us/app/timepassages-astrology/id488946918
- CHANI app — daily/weekly/monthly readings and transit windows with exact dates — https://www.chani.com/app
- Co–Star — NASA data, human astrologers, AI, daily horoscopes — https://www.costarastrology.com and https://play.google.com/store/apps/details?id=com.costarastrology
- The Pattern — daily guidance, timing/transits, bonds — https://www.thepattern.com
- Astrodienst, “Transits of the Year” — https://www.astro.com

Transit theory:

- MyNitya, “Transits in Your Natal Chart” — planet and house transit meanings, Jupiter/Saturn durations — https://mynitya.com/blog/transits-natal-chart-planetary-movements-guide
- The Inner Wheel, “Astrology Transits: The Complete Guide” — house transits, timing — https://theinnerwheel.com/astrology-transits-complete-guide
- The Great Almanac, “Astrological Transits: Geometry, Orbs, Exact Hits, and Timing” — applying/separating/exact; multiple passes — https://www.thegreatalmanac.com/transits
- Astrotheme, “Applying and Separating Aspects” — https://www.astrotheme.com/applying-and-separating-aspects.php
- CHANI, “The astrological timeline of your life” — Saturn return/Jupiter return/outer-planet chapters — https://www.chani.com/blogs/the-astrological-timeline-of-your-life
- Astro-Seek transit aspect reference — https://horoscopes.astro-seek.com/transit-aspects-astrology-free-interpretations
- LoveToKnow, “Understanding Astrological Transits” — https://www.lovetoknow.com/life/astrology/what-are-astrological-transits

Vedic / compatibility context (not implemented in this release):

- Karmaculator, Vimshottari dasha calculation — https://karmaculator.com/dasha-calculator
- AstroSage, Vimshottari dasha — https://www.astrosage.com/free/vimshottari-dasha-prediction-life-report.asp
- Amora, “What is synastry?” — https://www.astroamora.com/en/blog/what-is-synastry-explained
- NextAstrology, “How to read a synastry chart” — https://www.nextastrology.com/post/how-to-read-a-synastry-chart-real-astrology-compatibility-not-just-sun-signs

Technical:

- Astronomy Engine — https://github.com/cosinekitty/astronomy
- NASA Space Place, moon phases — https://spaceplace.nasa.gov/moon-phases
- Astro docs, view transitions — https://docs.astro.build/en/guides/view-transitions/
- MDN, `Intl.DateTimeFormat` — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
