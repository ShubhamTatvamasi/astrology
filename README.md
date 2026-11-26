# Astra — astrology, decoded

A static astrology web app built with **Astro + Svelte**. It calculates real birth charts from an astronomical ephemeris, explains the zodiac and the language of astrology, and shows the live sky — privately, in the browser.

**Live:** https://shubhamtatvamasi.com/astrology/

---

## What it does

- **Birth chart calculator** — Sun, Moon, rising sign, ten planets, the mean North Node, twelve houses, major aspects, element/modality balance, and a shareable chart URL.
- **Personal forecast** — transits to your natal chart, with today/week/month ranges, life-area guidance, applying/exact dates, a 30-day timing timeline, moon phases, stations, and a journal prompt. Saved locally so it is ready next time.
- **Marriage & partnership matching** — two-chart Western synastry (attraction, emotional safety, communication, commitment, shared direction), house overlays, key aspects, conversation prompts, plus a separate traditional Vedic Ashtakoot Gun Milan layer with 36-point koota breakdown and role order.
- **Big three finder** — a fast birth-data form that returns Sun, Moon and rising, with a link into the full chart.
- **Zodiac encyclopedia** — all twelve signs with dates, elements, modalities, rulers, strengths, shadow, love, career, friendship, compatibility, and traditional correspondences.
- **Learn astrology** — planets, signs, houses, aspects, moon phases, methodology, and FAQ.
- **Sky now** — live moon phase and illumination, current planetary positions, retrogrades, and the degree rising at your location.
- **Light, dark, or system theme** — system is the default; the choice is remembered locally and applied before first paint to avoid a flash. Chart wheels stay dark so the glyphs remain legible.
- **Animations** — a drifting starfield with pointer parallax, shooting stars, a rotating cosmic wheel, on-scroll reveals, animated chart wheels and aspect lines, and reduced-motion support.
- **No account, no database** — chart calculations happen in the browser. Share links encode the birth data in the URL. The forecast and matching pages can save charts in `localStorage`; “Forget” removes them.

Routes (all static):

| Route | Purpose |
| --- | --- |
| `/astrology/` | Home, big-three calculator, zodiac grid, guide |
| `/astrology/chart/` | Full natal chart calculator |
| `/astrology/forecast/` | Personal transit forecast and timing |
| `/astrology/compatibility/` | Marriage & partnership matching |
| `/astrology/zodiac/` | Filterable zodiac index |
| `/astrology/zodiac/[sign]/` | Twelve sign profiles |
| `/astrology/sky/` | Live sky and transits |
| `/astrology/learn/` | The grammar of astrology |
| `/astrology/404.html` | Not-found page |

---

## Stack

- [Astro 7](https://astro.build) — static site, file-based routing, view transitions
- [Svelte 5](https://svelte.dev) — interactive islands (forms, charts, filters, live sky)
- [Astronomy Engine](https://github.com/cosinekitty/astronomy) — VSOP87-based ephemeris, ~1 arcminute accuracy
- Self-hosted fonts via Fontsource: Space Grotesk + Instrument Serif
- No CSS framework; custom design tokens and animations
- GitHub Actions → GitHub Pages

---

## Local development

Requires Node **22.23.4+** (see `.nvmrc`).

```bash
npm install
npm run dev
```

The site is served at **http://localhost:4321/astrology/** because `base` is `/astrology`.

Useful scripts:

```bash
npm run dev      # start the dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
npm run check    # Astro + TypeScript + Svelte diagnostics
```

---

## Deployment

Deployment source is **GitHub Actions**. The workflow at `.github/workflows/deploy.yml`:

1. installs dependencies with `npm ci`
2. runs `npm run check`
3. builds the static site
4. uploads `dist/` as a Pages artifact
5. deploys it with `actions/deploy-pages`

In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

The site is configured in `astro.config.mjs`:

```js
site: 'https://shubhamtatvamasi.com',
base: '/astrology',
```

If the repository is renamed or moved, update `base` and the sitemap/robots URLs in `public/robots.txt` and `public/site.webmanifest`.

---

## How the chart is calculated

- **Tropical zodiac**, measured from the vernal equinox (not sidereal).
- **Apparent geocentric ecliptic longitude of date** for the Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, and Pluto, using Astronomy Engine and the `EQJ → ECT` rotation.
- **Ascendant and Midheaven** from Greenwich apparent sidereal time, geographic longitude/latitude, and the mean obliquity of the ecliptic.
- **Whole sign houses** by default; an equal-house switch measures 30° segments from the exact Ascendant.
- **Mean North Node** from the standard lunar-node polynomial.
- **Major aspects** with orbs: conjunction 8°, sextile 5°, square 7°, trine 7°, opposition 8°.
- **Time zones** resolved with the browser's IANA database, including historical daylight saving. Manual coordinates use a UTC offset.
- **Unknown birth time** uses 12:00 noon local time and clearly marks the rising sign and houses as approximate.

Validation: for 6 July 1946, 07:26, New Haven, CT, the engine returns Sun 13°46′ Cancer, Moon 16°42′ Libra, Ascendant 7°06′ Leo, and MC 24°12′ Aries — matching published charts for that birth record to the arcminute.

See [`RESEARCH.md`](./RESEARCH.md) for sources and design decisions.

---

## Project structure

```
src/
  components/        # Astro + Svelte UI, chart wheel, starfield, forms
  data/              # signs, planets, houses, aspects, moon phases, transit themes, synastry, Vedic
  layouts/           # BaseLayout with SEO, nav, footer, starfield
  lib/               # astronomy, transits, synastry, Vedic matching, saved charts, time zones
  pages/             # routes (index, chart, zodiac, sky, learn, 404)
  styles/            # global design tokens and utilities
public/              # favicon, OG image, manifest, robots
.github/workflows/   # GitHub Pages deployment
```

---

## Forecast methodology

The forecast is deterministic and auditable — not an AI chatbot inventing a horoscope.

- Current transiting planets are compared to the natal Sun–Pluto, North Node, Ascendant, and Midheaven.
- Active transit orbs: conjunction 5°, sextile 3°, square 4°, trine 4°, opposition 5°. A wider 8° look only includes aspects that become exact within the selected range.
- Applying aspects are weighted slightly higher; exact dates come from sampling the ephemeris and finding the closest approach within 0.3°.
- Life areas are scored from the transiting planet, natal point, and transit house, then given a “weather” label and a next step.
- The timeline includes exact aspects, stations, ingresses, and moon phases.
- Whole-sign houses are used; unknown birth times are clearly marked as approximate.
- Readings are composed from a controlled template system, not free-form generation.

See [`FORECAST_RESEARCH.md`](./FORECAST_RESEARCH.md) for the market research, transit theory, ethics, and validation behind it.

---

## Matching methodology

- **Western synastry:** both tropical charts, major inter-aspects, synastry orbs (conjunction 7°, sextile 5°, square 6°, trine 6°, opposition 7°), weighted pair contacts, five life-area indexes, and whole-sign house overlays.
- **Vedic Ashtakoot Gun Milan:** separate Lahiri sidereal Moon layer, 27 nakshatras, 8 kootas out of 36, traditional tables, role-sensitive bride/groom order toggle, and raw scores without cancellation rules.
- The two systems are not directly comparable and are labelled separately.
- No compatibility report is a yes/no verdict. “Forget” removes both locally stored charts.

See [`MATCH_RESEARCH.md`](./MATCH_RESEARCH.md) for the full research, tables, limitations, and ethics.

---

## Theming

The theme controller is intentionally small and framework-free:

- **Default:** `system` — follows `prefers-color-scheme`, and updates live if the OS changes.
- **Options:** System, Light, Dark in the navigation (desktop) or the mobile menu.
- **Persistence:** stored in `localStorage` under `astra-theme`.
- **No flash:** a tiny inline script in `<head>` resolves the theme before the first paint.
- **Implementation:** semantic CSS tokens in `src/styles/global.css` plus light overrides in `src/styles/theme-light.css`. Ornamental diagrams keep an opaque night-sky disc in both themes.

Override the theme from the console with:

```js
localStorage.setItem('astra-theme', 'light'); // or 'dark' or 'system'
location.reload();
```

---

## Privacy

Birth data is processed entirely in the browser. The only network request is the optional city search, which sends the typed place name to the [Open-Meteo geocoding API](https://open-meteo.com/). Nothing is stored on a server.

The forecast stores one chart in `localStorage` under `astra-birth-chart-v1`. The matching page stores the first chart under the same key and the partner chart under `astra-partner-chart-v1`. Use **Forget** to remove them. Share links contain birth data in the query string, so treat shared links accordingly.

---

## A note on astrology

Astrology is a symbolic and reflective tradition, not a science, and this app is not medical, financial, legal, or psychological advice. The astronomy is real and precise; the meanings assigned to the positions are interpretive. Use it to ask better questions.

---

## License

MIT © 2026 Shubham Tatvamasi
