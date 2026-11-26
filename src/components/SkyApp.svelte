<script lang="ts">
  import { onMount } from 'svelte';
  import MoonPhase from './MoonPhase.svelte';
  import {
    ascendantAndMC,
    currentPositions,
    degreeText,
    moonNow,
    moonSign,
    signAt,
    sunSign,
    type BodyPosition,
    type MoonNow,
  } from '../lib/astrology';
  import { MOON_PHASES } from '../data/moons';
  import { href } from '../lib/url';

  interface SkyData {
    positions: BodyPosition[];
    moon: MoonNow;
    sun: ReturnType<typeof sunSign>;
    moonSign: ReturnType<typeof moonSign>;
    updated: string;
    dateLabel: string;
  }

  let sky = $state<SkyData | null>(null);
  let now = $state(new Date());
  let latInput = $state('');
  let lonInput = $state('');
  let geoStatus = $state<'idle' | 'loading' | 'error'>('idle');
  let geoMessage = $state('');

  function refresh() {
    now = new Date();
    sky = {
      positions: currentPositions(now),
      moon: moonNow(now),
      sun: sunSign(now),
      moonSign: moonSign(now),
      updated: new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
      }).format(now),
      dateLabel: new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(now),
    };
  }

  onMount(() => {
    refresh();
    const timer = setInterval(refresh, 30_000);
    return () => clearInterval(timer);
  });

  const retrogrades = $derived(sky?.positions.filter((p) => p.retrograde) ?? []);

  const rising = $derived.by(() => {
    if (String(latInput).trim() === '' || String(lonInput).trim() === '') return null;
    const lat = Number(latInput);
    const lon = Number(lonInput);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      return null;
    }
    const { asc, mc } = ascendantAndMC(now, lat, lon);
    return {
      asc: signAt(asc),
      ascDegree: degreeText(asc),
      mc: signAt(mc),
      mcDegree: degreeText(mc),
    };
  });

  function useLocation() {
    if (!navigator.geolocation) {
      geoStatus = 'error';
      geoMessage = 'Your browser does not expose location. Enter coordinates manually.';
      return;
    }
    geoStatus = 'loading';
    geoMessage = '';
    navigator.geolocation.getCurrentPosition(
      (position) => {
        latInput = position.coords.latitude.toFixed(4);
        lonInput = position.coords.longitude.toFixed(4);
        geoStatus = 'idle';
      },
      () => {
        geoStatus = 'error';
        geoMessage = 'Location permission was not granted. Enter coordinates manually instead.';
      },
      { timeout: 10_000 },
    );
  }

  function dateLabel(date: Date | null): string {
    if (!date) return '—';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }

  const phases = $derived.by(() => {
    const currentKey = sky?.moon.phase.key ?? '';
    return MOON_PHASES.map((phase) => {
      const [start, end] = phase.range;
      const mid = start > end ? 0 : (start + end) / 2;
      return { ...phase, mid, current: phase.key === currentKey };
    });
  });
</script>

<div class="sky-app">
  <div class="live-head">
    <div class="live-head-left">
      <span class="live-dot" aria-hidden="true"></span>
      <span>Live positions · updated every 30 seconds</span>
    </div>
    <span class="live-time">{sky?.dateLabel ?? '—'} · {sky?.updated ?? 'calculating…'}</span>
  </div>

  <div class="sky-grid">
    <section class="moon-card card" aria-labelledby="moon-heading">
      <div class="moon-top">
        <div class="moon-visual">
          {#if sky}
            <MoonPhase elongation={sky.moon.elongation} size={190} />
          {:else}
            <div class="moon-skeleton"></div>
          {/if}
        </div>
        <div class="moon-copy">
          <p class="panel-kicker">The Moon</p>
          <h2 id="moon-heading" class="serif moon-name">{sky?.moon.phase.name ?? '—'}</h2>
          <p class="moon-stats">
            {#if sky}
              {sky.moon.illumination.toFixed(0)}% illuminated · {sky.moon.ageDays.toFixed(1)} days into
              the cycle
            {:else}
              Reading the lunar phase…
            {/if}
          </p>
          <p class="moon-sign">
            {#if sky}
              {sky.moonSign.glyph} Moon in {sky.moonSign.name}
            {:else}
              ☽ Moon in —
            {/if}
          </p>
        </div>
      </div>

      {#if sky}
        <p class="moon-meaning">{sky.moon.phase.meaning}</p>
        <p class="moon-invite"><span aria-hidden="true">✦</span> {sky.moon.phase.invitation}</p>

        <div class="moon-next">
          <div>
            <span>Next new moon</span>
            <strong>{dateLabel(sky.moon.nextNew)}</strong>
          </div>
          <div>
            <span>Next full moon</span>
            <strong>{dateLabel(sky.moon.nextFull)}</strong>
          </div>
        </div>
      {/if}

      <div class="phase-timeline" aria-label="Lunar cycle">
        {#each phases as phase (phase.key)}
          <div class:current={phase.current} class="phase-mini">
            <MoonPhase elongation={phase.mid} size={34} glow={false} />
            <span>{phase.name.replace(' Moon', '')}</span>
          </div>
        {/each}
      </div>
    </section>

    <aside class="now-card card">
      <p class="panel-kicker">Right now</p>
      <div class="now-rows">
        <div>
          <span class="now-label">Sun</span>
          <span class="now-value">
            {#if sky}{sky.sun.glyph} Sun in {sky.sun.name}{/if}
          </span>
        </div>
        <div>
          <span class="now-label">Moon</span>
          <span class="now-value">
            {#if sky}{sky.moonSign.glyph} Moon in {sky.moonSign.name}{/if}
          </span>
        </div>
        <div>
          <span class="now-label">Mercury</span>
          <span class="now-value" class:retro={sky?.positions.find((p) => p.key === 'Mercury')?.retrograde}>
            {#if sky}
              {sky.positions.find((p) => p.key === 'Mercury')?.retrograde ? 'Retrograde ℞' : 'Direct'}
              · {sky.positions.find((p) => p.key === 'Mercury')?.sign.name}
            {/if}
          </span>
        </div>
      </div>

      <div class="retro-block">
        <p class="panel-kicker">Retrograde watch</p>
        {#if sky}
          {#if retrogrades.length > 0}
            <div class="retro-chips">
              {#each retrogrades as planet (planet.key)}
                <span class="retro-chip">{planet.glyph} {planet.name} ℞</span>
              {/each}
            </div>
            <p class="retro-note">
              Retrograde is not “bad luck.” It is a symbolic invitation to review, revise, and look
              inward on that planet’s themes.
            </p>
          {:else}
            <p class="retro-none">All planets are direct right now.</p>
          {/if}
        {:else}
          <p class="retro-none">Calculating motion…</p>
        {/if}
      </div>

      <div class="rising-block">
        <p class="panel-kicker">What is rising?</p>
        {#if rising}
          <div class="rising-result">
            <div>
              <span class="rising-label">Ascendant</span>
              <strong>{rising.asc.glyph} {rising.asc.name}</strong>
              <span class="rising-degree">{rising.ascDegree}</span>
            </div>
            <div>
              <span class="rising-label">Midheaven</span>
              <strong>{rising.mc.glyph} {rising.mc.name}</strong>
              <span class="rising-degree">{rising.mcDegree}</span>
            </div>
          </div>
          <p class="rising-note">The rising sign changes roughly every two hours. This is the sky now, not your birth chart.</p>
        {:else}
          <p class="rising-prompt">Add a location to see the degree rising on the eastern horizon right now.</p>
        {/if}

        <div class="location-form">
          <input
            class="input"
            type="number"
            step="0.0001"
            placeholder="Latitude"
            aria-label="Latitude"
            bind:value={latInput}
            oninput={() => { if (geoStatus === 'error') { geoStatus = 'idle'; geoMessage = ''; } }}
          />
          <input
            class="input"
            type="number"
            step="0.0001"
            placeholder="Longitude"
            aria-label="Longitude"
            bind:value={lonInput}
            oninput={() => { if (geoStatus === 'error') { geoStatus = 'idle'; geoMessage = ''; } }}
          />
          <button class="btn btn-ghost btn-sm" type="button" onclick={useLocation} disabled={geoStatus === 'loading'}>
            {geoStatus === 'loading' ? 'Locating…' : 'Use my location'}
          </button>
        </div>
        {#if geoStatus === 'error'}<p class="geo-error">{geoMessage}</p>{/if}
      </div>
    </aside>
  </div>

  <section class="positions-card card" aria-labelledby="positions-heading">
    <div class="positions-head">
      <div>
        <p class="panel-kicker">Current transits</p>
        <h2 id="positions-heading" class="serif positions-title">Where the planets are</h2>
      </div>
      <p class="positions-note">
        Geocentric, tropical zodiac, calculated for the current moment. These are sky positions, not
        your natal placements.
      </p>
    </div>

    <div class="table-scroll" tabindex="0" role="region" aria-label="Current planetary positions">
      <table>
        <thead>
          <tr>
            <th scope="col">Planet</th>
            <th scope="col">Sign</th>
            <th scope="col">Degree</th>
            <th scope="col">Motion</th>
          </tr>
        </thead>
        <tbody>
          {#if sky}
            {#each sky.positions as planet (planet.key)}
              <tr>
                <th scope="row">
                  <span class="glyph planet-icon" style={`color:${planet.color}`}>{planet.glyph}</span>
                  <span>{planet.name}</span>
                </th>
                <td><span class="sign-cell">{planet.sign.glyph} {planet.sign.name}</span></td>
                <td class="num">{planet.degreeText}</td>
                <td>
                  {#if planet.retrograde}
                    <span class="motion retro">℞ Retrograde</span>
                  {:else}
                    <span class="motion">Direct</span>
                  {/if}
                </td>
              </tr>
            {/each}
          {:else}
            {#each Array.from({ length: 10 }) as _}
              <tr class="skeleton-row"><td colspan="4"></td></tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </section>

  <div class="sky-foot">
    <p>
      This page describes the symbolic weather, not a prediction. For a chart that is actually about
      you, enter your birth data.
    </p>
    <div class="sky-foot-actions">
      <a class="btn btn-primary btn-sm" href={href('/chart/')}>Cast your birth chart <span class="arrow">→</span></a>
      <a class="btn btn-ghost btn-sm" href={href('/learn/#moon-phases')}>Learn moon phases</a>
    </div>
  </div>
</div>

<style>
  .sky-app {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  .live-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    padding-bottom: 0.9rem;
    border-bottom: 1px solid var(--line-soft);
    font-size: 0.66rem;
    letter-spacing: 0.06em;
    color: var(--faint);
  }

  .live-head-left {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--gold);
  }

  .live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--gold);
    box-shadow: 0 0 10px 2px rgba(232, 196, 124, 0.6);
    animation: blink 2.4s ease-in-out infinite;
  }

  .live-time {
    font-variant-numeric: tabular-nums;
  }

  .sky-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
    gap: 1.2rem;
    align-items: start;
  }

  .moon-card {
    padding: clamp(1.2rem, 2.6vw, 1.8rem);
    background:
      radial-gradient(500px 260px at 25% 10%, var(--gold-tint), transparent 65%),
      var(--card-bg);
  }

  .moon-top {
    display: flex;
    align-items: center;
    gap: clamp(1rem, 3vw, 2rem);
  }

  .moon-visual {
    flex-shrink: 0;
    width: clamp(110px, 18vw, 190px);
  }

  .moon-skeleton {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: var(--surface);
    animation: pulse 1.8s ease-in-out infinite;
  }

  .panel-kicker {
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--gold);
  }

  .moon-name {
    margin-top: 0.4rem;
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 400;
    line-height: 1;
  }

  .moon-stats {
    margin-top: 0.45rem;
    font-size: 0.74rem;
    line-height: 1.5;
    color: var(--muted);
  }

  .moon-sign {
    margin-top: 0.7rem;
    font-family: var(--font-serif);
    font-size: 1.1rem;
    color: var(--gold-bright);
  }

  .moon-meaning {
    margin-top: 1.2rem;
    font-size: 0.85rem;
    line-height: 1.65;
    color: var(--muted);
  }

  .moon-invite {
    margin-top: 0.7rem;
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 0.95rem;
    line-height: 1.5;
    color: var(--faint);
  }

  .moon-invite span {
    color: var(--gold);
    font-style: normal;
    font-size: 0.65rem;
  }

  .moon-next {
    display: flex;
    gap: 2rem;
    margin-top: 1.1rem;
    padding-top: 0.9rem;
    border-top: 1px solid var(--line-soft);
  }

  .moon-next div {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .moon-next span {
    font-size: 0.58rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--faint);
  }

  .moon-next strong {
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--ink);
  }

  .phase-timeline {
    display: grid;
    grid-template-columns: repeat(8, minmax(0, 1fr));
    gap: 0.2rem;
    margin-top: 1.2rem;
    padding-top: 1rem;
    border-top: 1px solid var(--line-soft);
  }

  .phase-mini {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    padding: 0.3rem 0.1rem;
    border-radius: 10px;
    opacity: 0.4;
    transition: opacity 0.3s ease, background 0.3s ease;
  }

  .phase-mini.current {
    opacity: 1;
    background: rgba(232, 196, 124, 0.07);
  }

  .phase-mini span {
    font-size: 0.55rem;
    letter-spacing: 0.05em;
    text-align: center;
    color: var(--faint);
    line-height: 1.2;
  }

  .phase-mini.current span {
    color: var(--gold-bright);
  }

  .now-card {
    padding: clamp(1.1rem, 2.4vw, 1.5rem);
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
  }

  .now-rows {
    display: flex;
    flex-direction: column;
    margin-top: -0.3rem;
  }

  .now-rows > div {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--line-soft);
    font-size: 0.82rem;
  }

  .now-label {
    color: var(--faint);
  }

  .now-value {
    color: var(--ink);
    text-align: right;
  }

  .now-value.retro {
    color: var(--rose);
  }

  .retro-block {
    padding-top: 0.2rem;
  }

  .retro-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.5rem;
  }

  .retro-chip {
    padding: 0.3rem 0.55rem;
    border: 1px solid rgba(243, 167, 184, 0.28);
    border-radius: 999px;
    background: rgba(243, 167, 184, 0.07);
    font-size: 0.68rem;
    color: var(--rose);
  }

  .retro-note,
  .retro-none {
    margin-top: 0.5rem;
    font-size: 0.7rem;
    line-height: 1.55;
    color: var(--faint);
  }

  .rising-block {
    padding-top: 0.9rem;
    border-top: 1px solid var(--line-soft);
  }

  .rising-result {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.7rem;
    margin-top: 0.5rem;
  }

  .rising-result div {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    padding: 0.55rem 0.65rem;
    border: 1px solid var(--line-soft);
    border-radius: 12px;
    background: var(--surface);
  }

  .rising-label {
    font-size: 0.52rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--faint);
  }

  .rising-result strong {
    font-family: var(--font-serif);
    font-size: 1.05rem;
    font-weight: 400;
  }

  .rising-degree {
    font-size: 0.62rem;
    color: var(--faint);
    font-variant-numeric: tabular-nums;
  }

  .rising-note,
  .rising-prompt {
    margin-top: 0.5rem;
    font-size: 0.68rem;
    line-height: 1.5;
    color: var(--faint);
  }

  .location-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.4rem;
    margin-top: 0.6rem;
  }

  .location-form .input {
    min-height: 36px;
    padding: 0.4rem 0.6rem;
    font-size: 0.72rem;
    border-radius: 9px;
  }

  .location-form .btn {
    grid-column: 1 / -1;
    padding: 0.5rem;
    font-size: 0.72rem;
  }

  .geo-error {
    margin-top: 0.4rem;
    font-size: 0.68rem;
    line-height: 1.5;
    color: var(--rose);
  }

  .positions-card {
    padding: clamp(1.2rem, 2.6vw, 1.8rem);
  }

  .positions-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 2rem;
    margin-bottom: 0.7rem;
  }

  .positions-title {
    margin-top: 0.3rem;
    font-size: 1.8rem;
    font-weight: 400;
  }

  .positions-note {
    max-width: 42ch;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: right;
    color: var(--faint);
  }

  .table-scroll {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.83rem;
  }

  th,
  td {
    text-align: left;
    padding: 0.6rem 0.5rem;
    border-bottom: 1px solid var(--line-soft);
    white-space: nowrap;
  }

  thead th {
    font-size: 0.58rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--faint);
    padding-top: 0.2rem;
  }

  tbody tr:last-child th,
  tbody tr:last-child td {
    border-bottom: 0;
  }

  tbody th {
    font-weight: 450;
  }

  .planet-icon {
    display: inline-block;
    width: 1.3rem;
    font-size: 1rem;
  }

  .sign-cell {
    color: var(--muted);
  }

  .num {
    color: var(--muted);
    font-variant-numeric: tabular-nums;
  }

  .motion {
    font-size: 0.72rem;
    color: var(--faint);
  }

  .motion.retro {
    color: var(--rose);
  }

  .skeleton-row td {
    height: 2.4rem;
    background: linear-gradient(90deg, var(--surface), var(--surface-strong), var(--surface));
    background-size: 200% 100%;
    animation: shimmer 1.5s linear infinite;
    border-bottom: 1px solid var(--line-soft);
  }

  .sky-foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
    padding-top: 0.4rem;
  }

  .sky-foot p {
    max-width: 58ch;
    font-size: 0.72rem;
    line-height: 1.55;
    color: var(--faint);
  }

  .sky-foot-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.35;
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.4;
    }
    50% {
      opacity: 0.7;
    }
  }

  @keyframes shimmer {
    to {
      background-position: -200% 0;
    }
  }

  @media (max-width: 1000px) {
    .sky-grid {
      grid-template-columns: 1fr;
    }
    .now-card {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem 1.5rem;
    }
    .now-rows {
      grid-column: 1;
    }
    .retro-block {
      grid-column: 2;
    }
    .rising-block {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 720px) {
    .moon-top {
      flex-direction: column;
      align-items: flex-start;
    }
    .moon-visual {
      align-self: center;
    }
    .phase-timeline {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.4rem;
    }
    .positions-head,
    .sky-foot {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
    .positions-note {
      text-align: left;
    }
    .now-card {
      display: flex;
    }
  }

  @media (max-width: 480px) {
    .moon-next {
      gap: 1.2rem;
      flex-wrap: wrap;
    }
    .rising-result {
      grid-template-columns: 1fr;
    }
  }
</style>
