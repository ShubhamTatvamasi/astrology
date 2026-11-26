<script lang="ts">
  import { onMount, tick } from 'svelte';
  import BirthForm from './BirthForm.svelte';
  import NatalWheel from './NatalWheel.svelte';
  import { computeChart, ordinal, type Chart, type HouseSystem } from '../lib/astrology';
  import {
    houseSystemFromSearch,
    initialFromSearch,
    resolveBirth,
    searchFromBirth,
  } from '../lib/birth';
  import { HOUSES } from '../data/houses';
  import { planetByKey } from '../data/planets';
  import { href } from '../lib/url';
  import type { BirthData, BirthInitial } from '../lib/types';

  let data = $state<BirthData | null>(null);
  let initial = $state<BirthInitial | null>(null);
  let houseSystem = $state<HouseSystem>('whole');
  let selectedKey = $state<string>('Sun');
  let copied = $state(false);
  let resultEl = $state<HTMLElement | null>(null);
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  onMount(() => {
    houseSystem = houseSystemFromSearch(window.location.search);
    const parsed = initialFromSearch(window.location.search);
    if (parsed) {
      initial = parsed;
      const resolved = resolveBirth(parsed);
      if (resolved) data = resolved;
    }
  });

  const chart = $derived(
    data
      ? computeChart({
          date: data.date,
          latitude: data.latitude,
          longitude: data.longitude,
          houseSystem,
        })
      : null,
  );

  const sun = $derived(chart?.positions.find((p) => p.key === 'Sun') ?? null);
  const moon = $derived(chart?.positions.find((p) => p.key === 'Moon') ?? null);

  const selected = $derived(chart?.positions.find((p) => p.key === selectedKey) ?? null);
  const selectedMeta = $derived(selected ? planetByKey(selected.key) : null);
  const selectedHouse = $derived(selected ? HOUSES[selected.house - 1] : null);
  const selectedAspects = $derived(
    chart && selected
      ? chart.aspects.filter((a) => a.a.key === selected.key || a.b.key === selected.key)
      : [],
  );

  function syncUrl(input: BirthData) {
    const query = searchFromBirth(input, houseSystem);
    history.replaceState(null, '', `${window.location.pathname}?${query}`);
  }

  async function handleCalculate(input: BirthData) {
    data = input;
    selectedKey = 'Sun';
    syncUrl(input);
    await tick();
    if (resultEl) {
      resultEl.focus({ preventScroll: true });
      if (window.innerWidth < 900) {
        resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  function setHouseSystem(system: HouseSystem) {
    houseSystem = system;
    if (data) syncUrl(data);
  }

  async function copyLink() {
    if (!data) return;
    syncUrl(data);
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const temp = document.createElement('textarea');
      temp.value = url;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      temp.remove();
    }
    copied = true;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copied = false), 2200);
  }

  function articleFor(word: string): string {
    return /^[aeiou]/i.test(word) ? 'An' : 'A';
  }

  function utcLabel(input: BirthData): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
      timeZoneName: 'short',
    }).format(input.date);
  }

</script>

<div class="chart-app">
  <div class="form-shell card card-pad">
    <div class="form-head">
      <div>
        <p class="eyebrow">Birth chart calculator</p>
        <h2 class="h3">Tell us when and where.</h2>
      </div>
      <p class="form-note">
        We use the exact sky at your birth — the same ephemeris astronomers use — not a sun-sign
        date range.
      </p>
    </div>
    {#key initial}
      <BirthForm
        {initial}
        submitLabel="Calculate my chart"
        onCalculate={handleCalculate}
      />
    {/key}
  </div>

  {#if chart && data}
    <section
      class="result"
      bind:this={resultEl}
      tabindex="-1"
      aria-label="Your natal chart"
    >
      <header class="result-head">
        <div>
          <p class="eyebrow">Your natal chart</p>
          <h2 class="display result-title">
            {sun?.sign.name} sun.
            <span class="soft">{moon?.sign.name} moon.</span>
            <span class="gold">
              {chart.ascendant.sign.name} rising{data.timeUnknown ? ' (approx.)' : ''}.
            </span>
          </h2>
          <p class="result-meta">
            {data.placeLabel} · {data.localDate} at {data.localTime} ({data.tzLabel})
            <span class="meta-divider" aria-hidden="true">·</span>
            {utcLabel(data)} · {chart.ascendant.degreeText} {chart.ascendant.sign.name} rising{data.timeUnknown ? ' (approx.)' : ''}
          </p>
        </div>
        <div class="result-actions">
          <button class="btn btn-ghost btn-sm" type="button" onclick={copyLink} aria-live="polite">
            {copied ? 'Link copied ✓' : 'Share chart'}
          </button>
          <div class="segmented" aria-label="House system">
            <button
              type="button"
              aria-pressed={houseSystem === 'whole'}
              onclick={() => setHouseSystem('whole')}
            >
              Whole sign
            </button>
            <button
              type="button"
              aria-pressed={houseSystem === 'equal'}
              onclick={() => setHouseSystem('equal')}
            >
              Equal
            </button>
          </div>
        </div>
      </header>

      {#if data.timeUnknown}
        <p class="time-banner" role="status">
          <span aria-hidden="true">☾</span>
          Birth time marked unknown. This chart uses 12:00 noon local time, so the rising sign,
          Midheaven, and house placements are approximate. The Sun and slow planets are reliable;
          the Moon may sit a few degrees away.
        </p>
      {/if}

      <div class="chart-layout">
        <div class="chart-left">
          <div class="wheel-card card">
            <NatalWheel
              {chart}
              selectedKey={selectedKey}
              onSelect={(key) => (selectedKey = key)}
            />
            <p class="wheel-caption">
              Tap a planet to isolate its aspects. Houses use the
              {houseSystem === 'whole' ? 'whole sign' : 'equal'} system.
            </p>
          </div>

          {#if selected && selectedMeta && selectedHouse}
            <article class="detail-card card">
              <div class="detail-head">
                <span class="detail-glyph glyph" style={`color:${selectedMeta.color}`}>
                  {selectedMeta.glyph}
                </span>
                <div>
                  <p class="detail-kicker">Placement</p>
                  <h3 class="detail-title">
                    {selected.name} in {selected.sign.name}
                    <span class="detail-house">
                      {ordinal(selected.house)} house
                    </span>
                  </h3>
                  <p class="detail-meta">
                    {selected.degreeText} {selected.sign.name} · {selected.sign.element} · {selected.sign.modality}
                    · {selectedHouse.title}
                    {#if selected.retrograde}<span class="retro">℞ retrograde</span>{/if}
                  </p>
                </div>
                <a class="detail-link" href={href(`/zodiac/${selected.sign.slug}/`)}>
                  About {selected.sign.name} ↗
                </a>
              </div>

              <div class="detail-grid">
                <div>
                  <p class="detail-label">The planet</p>
                  <p class="detail-copy">{selectedMeta.description}</p>
                </div>
                <div>
                  <p class="detail-label">Its style</p>
                  <p class="detail-copy">{selected.sign.overview[0]}</p>
                </div>
                <div>
                  <p class="detail-label">Its arena</p>
                  <p class="detail-copy">{selectedHouse.description}</p>
                  {#if data.timeUnknown}
                    <p class="detail-caveat">House placement is approximate without a birth time.</p>
                  {/if}
                </div>
              </div>

              {#if selectedAspects.length > 0}
                <div class="detail-aspects">
                  <p class="detail-label">Aspects</p>
                  <div class="aspect-chips">
                    {#each selectedAspects.slice(0, 8) as aspect}
                      <button
                        type="button"
                        class="aspect-chip"
                        style={`--c:${aspect.aspect.color}`}
                        onclick={() => (selectedKey = aspect.a.key === selectedKey ? aspect.b.key : aspect.a.key)}
                      >
                        <span class="glyph" aria-hidden="true">{aspect.aspect.glyph}</span>
                        {aspect.a.name} {aspect.aspect.name.toLowerCase()} {aspect.b.name}
                        <span class="aspect-orb">{aspect.orb.toFixed(1)}°</span>
                      </button>
                    {/each}
                  </div>
                </div>
              {/if}
            </article>
          {/if}
        </div>

        <aside class="chart-right">
          <div class="summary-card card">
            <p class="panel-title">The shape of the chart</p>
            <div class="summary-big">
              <div>
                <span class="summary-label">Sun</span>
                <a href={href(`/zodiac/${sun!.sign.slug}/`)} class="summary-value">
                  {sun!.sign.glyph} {sun!.sign.name}
                </a>
              </div>
              <div>
                <span class="summary-label">Moon</span>
                <a href={href(`/zodiac/${moon!.sign.slug}/`)} class="summary-value">
                  {moon!.sign.glyph} {moon!.sign.name}
                </a>
              </div>
              <div>
                <span class="summary-label">Rising</span>
                <a href={href(`/zodiac/${chart.ascendant.sign.slug}/`)} class="summary-value">
                  {chart.ascendant.sign.glyph} {chart.ascendant.sign.name}
                </a>
              </div>
            </div>
            <p class="summary-line">
              {articleFor(chart.dominantElement)} <strong>{chart.dominantElement.toLowerCase()}</strong> chart with a
              <strong>{chart.dominantModality.toLowerCase()}</strong> rhythm. That combination is the
              texture underneath the individual placements.
            </p>
            <div class="balance">
              <p class="balance-title">Elements</p>
              {#each chart.balances.elements as element}
                <div class="bar-row">
                  <span class="bar-name">{element.name}</span>
                  <span class="bar-track">
                    <span
                      class="bar-fill"
                      style={`--w:${element.pct}%; --c:${element.color}`}
                    ></span>
                  </span>
                  <span class="bar-count">{element.count}</span>
                </div>
              {/each}
              <p class="balance-title second">Modalities</p>
              {#each chart.balances.modalities as modality}
                <div class="bar-row">
                  <span class="bar-name">{modality.name}</span>
                  <span class="bar-track">
                    <span class="bar-fill gold-fill" style={`--w:${modality.pct}%`}></span>
                  </span>
                  <span class="bar-count">{modality.count}</span>
                </div>
              {/each}
            </div>
          </div>

          <div class="table-card card">
            <div class="panel-head">
              <p class="panel-title">Placements</p>
              <span class="panel-hint">Tap a row</span>
            </div>
            <div class="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Planet</th>
                    <th scope="col">Sign</th>
                    <th scope="col">Degree</th>
                    <th scope="col">House</th>
                  </tr>
                </thead>
                <tbody>
                  {#each chart.positions as position (position.key)}
                    <tr
                      class:active={position.key === selectedKey}
                      tabindex="0"
                      role="button"
                      aria-label={`${position.name} in ${position.sign.name}, ${ordinal(position.house)} house. View details.`}
                      onclick={() => (selectedKey = position.key)}
                      onkeydown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          selectedKey = position.key;
                        }
                      }}
                    >
                      <th scope="row">
                        <span class="row-glyph glyph" style={`color:${position.color}`}>{position.glyph}</span>
                        <span class="row-name">{position.name}</span>
                        {#if position.retrograde}<span class="retro" title="Retrograde">℞</span>{/if}
                      </th>
                      <td>
                        <span class="sign-cell">{position.sign.glyph} {position.sign.name}</span>
                      </td>
                      <td class="num">{position.degreeText}</td>
                      <td class="num">{position.house}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>

          <div class="aspects-card card">
            <div class="panel-head">
              <p class="panel-title">Aspects</p>
              <span class="panel-hint">{chart.aspects.length} found</span>
            </div>
            {#if chart.aspects.length > 0}
              <div class="aspect-list">
                {#each chart.aspects as aspect}
                  <button
                    class="aspect-row"
                    type="button"
                    onclick={() => (selectedKey = aspect.a.key)}
                  >
                    <span class="aspect-glyph glyph" style={`color:${aspect.aspect.color}`}>
                      {aspect.aspect.glyph}
                    </span>
                    <span class="aspect-pair">
                      {aspect.a.name} <em>{aspect.aspect.name.toLowerCase()}</em> {aspect.b.name}
                    </span>
                    <span class="aspect-orb">{aspect.orb.toFixed(1)}°</span>
                  </button>
                {/each}
              </div>
            {:else}
              <p class="empty-note">No major aspects within orb. A chart full of unaspected planets is rare and often reads as a set of independent drives.</p>
            {/if}
          </div>

          <div class="method-card">
            <p>
              <strong>How this is calculated.</strong> Tropical zodiac, apparent geocentric positions
              from Astronomy Engine, mean North Node, and
              {houseSystem === 'whole' ? 'whole sign houses' : 'equal houses measured from the exact Ascendant'}.
              Orbs: ☌ 8°, ⚹ 5°, □ 7°, △ 7°, ☍ 8°.
            </p>
            <a href={href('/learn/')}>Read the methodology →</a>
          </div>
        </aside>
      </div>
    </section>
  {:else}
    <div class="empty-state">
      <div class="empty-item">
        <span class="empty-glyph glyph">☉</span>
        <p><strong>The big three.</strong> Your Sun, Moon, and rising sign — the headline of the chart.</p>
      </div>
      <div class="empty-item">
        <span class="empty-glyph glyph">☿</span>
        <p><strong>Every placement.</strong> Ten planets plus the North Node, in sign, degree, and house.</p>
      </div>
      <div class="empty-item">
        <span class="empty-glyph glyph">△</span>
        <p><strong>The conversation.</strong> Major aspects, element balance, and the shape of the whole.</p>
      </div>
    </div>
  {/if}
</div>

<style>
  .chart-app {
    display: flex;
    flex-direction: column;
    gap: 2.2rem;
  }

  .form-shell {
    overflow: visible;
    position: relative;
    z-index: 3;
    padding: clamp(1.2rem, 3vw, 2rem);
    background:
      radial-gradient(600px 200px at 80% 0%, rgba(139, 108, 246, 0.1), transparent 70%),
      linear-gradient(155deg, rgba(255, 255, 255, 0.065), rgba(255, 255, 255, 0.015) 55%),
      rgba(9, 10, 20, 0.74);
  }

  .form-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 2rem;
    margin-bottom: 1.4rem;
  }

  .form-note {
    max-width: 38ch;
    font-size: 0.76rem;
    line-height: 1.55;
    color: var(--faint);
    text-align: right;
  }

  .result {
    outline: none;
    scroll-margin-top: 100px;
    animation: result-in 0.65s var(--ease) both;
  }

  .result-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 2rem;
    margin-bottom: 1.4rem;
  }

  .result-title {
    margin-top: 0.6rem;
    font-size: clamp(2.1rem, 4.2vw, 3.6rem);
    line-height: 0.98;
  }

  .result-title .soft {
    color: var(--violet-soft);
  }

  .result-meta {
    margin-top: 0.7rem;
    font-size: 0.76rem;
    line-height: 1.5;
    color: var(--faint);
    letter-spacing: 0.02em;
  }

  .meta-divider {
    margin: 0 0.3rem;
    opacity: 0.5;
  }

  .result-actions {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    flex-wrap: wrap;
  }

  .time-banner {
    display: flex;
    align-items: flex-start;
    gap: 0.65rem;
    margin-bottom: 1.4rem;
    padding: 0.85rem 1rem;
    border: 1px solid rgba(232, 196, 124, 0.22);
    border-radius: 14px;
    background: rgba(232, 196, 124, 0.055);
    font-size: 0.8rem;
    line-height: 1.55;
    color: var(--muted);
  }

  .time-banner span {
    color: var(--gold);
  }

  .chart-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.03fr) minmax(0, 0.97fr);
    gap: 1.2rem;
    align-items: start;
  }

  .chart-left {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    position: sticky;
    top: 96px;
  }

  .wheel-card {
    padding: 0.6rem 0.9rem 0.8rem;
  }

  .wheel-caption {
    margin-top: 0.2rem;
    text-align: center;
    font-size: 0.68rem;
    letter-spacing: 0.04em;
    color: var(--faint);
  }

  .detail-card {
    padding: clamp(1.1rem, 2.4vw, 1.6rem);
    background:
      linear-gradient(155deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.012) 55%),
      rgba(9, 10, 20, 0.72);
  }

  .detail-head {
    display: flex;
    align-items: flex-start;
    gap: 0.9rem;
    flex-wrap: wrap;
  }

  .detail-glyph {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    flex-shrink: 0;
    border-radius: 50%;
    font-size: 1.65rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--line);
  }

  .detail-kicker,
  .detail-label {
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.17em;
    text-transform: uppercase;
    color: var(--faint);
  }

  .detail-title {
    margin-top: 0.15rem;
    font-family: var(--font-serif);
    font-size: 1.6rem;
    font-weight: 400;
    line-height: 1.1;
  }

  .detail-house {
    margin-left: 0.35rem;
    font-family: var(--font-sans);
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--gold);
  }

  .detail-meta {
    margin-top: 0.3rem;
    font-size: 0.7rem;
    letter-spacing: 0.03em;
    color: var(--faint);
  }

  .retro {
    margin-left: 0.3rem;
    color: var(--rose);
    font-size: 0.64rem;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }

  .detail-link {
    margin-left: auto;
    font-size: 0.72rem;
    color: var(--gold);
    white-space: nowrap;
  }

  .detail-link:hover {
    color: var(--gold-bright);
  }

  .detail-grid {
    display: grid;
    gap: 0.9rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--line-soft);
  }

  .detail-copy {
    margin-top: 0.3rem;
    font-size: 0.82rem;
    line-height: 1.6;
    color: var(--muted);
  }

  .detail-caveat {
    margin-top: 0.4rem;
    font-size: 0.7rem;
    line-height: 1.5;
    color: var(--rose);
  }

  .detail-aspects {
    margin-top: 1rem;
    padding-top: 0.9rem;
    border-top: 1px solid var(--line-soft);
  }

  .aspect-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.5rem;
  }

  .aspect-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.6rem;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.025);
    font-size: 0.68rem;
    color: var(--muted);
    transition: border-color 0.2s ease, background 0.2s ease;
  }

  .aspect-chip:hover {
    border-color: color-mix(in srgb, var(--c) 50%, transparent);
    background: rgba(255, 255, 255, 0.05);
  }

  .aspect-chip .glyph {
    color: var(--c);
    font-size: 0.8rem;
  }

  .aspect-orb {
    color: var(--faint);
    font-variant-numeric: tabular-nums;
  }

  .chart-right {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  .summary-card,
  .table-card,
  .aspects-card {
    padding: clamp(1.05rem, 2.4vw, 1.45rem);
  }

  .panel-title {
    font-size: 0.66rem;
    font-weight: 600;
    letter-spacing: 0.19em;
    text-transform: uppercase;
    color: var(--gold);
  }

  .summary-big {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.7rem;
    margin-top: 0.9rem;
  }

  .summary-label {
    display: block;
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--faint);
  }

  .summary-value {
    display: block;
    margin-top: 0.2rem;
    font-family: var(--font-serif);
    font-size: 1.3rem;
    line-height: 1.15;
    color: var(--ink);
    transition: color 0.2s ease;
  }

  .summary-value:hover {
    color: var(--gold-bright);
  }

  .summary-line {
    margin-top: 0.9rem;
    padding-top: 0.8rem;
    border-top: 1px solid var(--line-soft);
    font-size: 0.78rem;
    line-height: 1.55;
    color: var(--muted);
  }

  .summary-line strong {
    color: var(--ink);
    font-weight: 500;
  }

  .balance {
    margin-top: 1rem;
  }

  .balance-title {
    margin-bottom: 0.4rem;
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--faint);
  }

  .balance-title.second {
    margin-top: 0.8rem;
  }

  .bar-row {
    display: grid;
    grid-template-columns: 4.2rem minmax(0, 1fr) 1rem;
    align-items: center;
    gap: 0.55rem;
    padding: 0.14rem 0;
  }

  .bar-name {
    font-size: 0.68rem;
    color: var(--muted);
  }

  .bar-track {
    height: 4px;
    border-radius: 99px;
    background: rgba(255, 255, 255, 0.06);
    overflow: hidden;
  }

  .bar-fill {
    display: block;
    height: 100%;
    width: var(--w);
    border-radius: 99px;
    background: var(--c);
    box-shadow: 0 0 10px -2px var(--c);
    animation: grow-bar 1s var(--ease) both;
  }

  .gold-fill {
    background: var(--gold);
    box-shadow: 0 0 10px -2px var(--gold);
  }

  .bar-count {
    font-size: 0.64rem;
    color: var(--faint);
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .panel-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 1rem;
    margin-bottom: 0.6rem;
  }

  .panel-hint {
    font-size: 0.64rem;
    letter-spacing: 0.05em;
    color: var(--faint);
  }

  .table-scroll {
    overflow-x: auto;
    margin-inline: -0.35rem;
    padding-inline: 0.35rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.82rem;
  }

  th,
  td {
    text-align: left;
    padding: 0.55rem 0.45rem;
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

  tbody tr {
    cursor: pointer;
    transition: background 0.2s ease;
    outline: none;
  }

  tbody tr:hover,
  tbody tr.active {
    background: rgba(232, 196, 124, 0.055);
  }

  tbody tr:focus-visible {
    background: rgba(232, 196, 124, 0.08);
  }

  tbody tr:last-child th,
  tbody tr:last-child td {
    border-bottom: 0;
  }

  tbody th {
    font-weight: 450;
  }

  .row-glyph {
    display: inline-block;
    width: 1.25rem;
    font-size: 0.95rem;
  }

  .row-name {
    color: var(--ink);
  }

  .sign-cell {
    color: var(--muted);
  }

  .num {
    font-variant-numeric: tabular-nums;
    color: var(--muted);
  }

  .aspect-list {
    display: flex;
    flex-direction: column;
    max-height: 320px;
    overflow-y: auto;
    margin-inline: -0.45rem;
    padding-inline: 0.45rem;
  }

  .aspect-row {
    display: grid;
    grid-template-columns: 1.5rem minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.55rem;
    padding: 0.5rem 0.35rem;
    border: 0;
    border-bottom: 1px solid var(--line-soft);
    background: none;
    text-align: left;
    font-size: 0.78rem;
    color: var(--muted);
    transition: color 0.2s ease, background 0.2s ease;
  }

  .aspect-row:hover {
    color: var(--ink);
    background: rgba(255, 255, 255, 0.025);
  }

  .aspect-row:last-child {
    border-bottom: 0;
  }

  .aspect-glyph {
    font-size: 1rem;
  }

  .aspect-pair em {
    font-style: normal;
    color: var(--faint);
  }

  .empty-note {
    font-size: 0.78rem;
    line-height: 1.55;
    color: var(--faint);
    padding: 0.5rem 0;
  }

  .method-card {
    padding: 0.2rem 0.15rem 0;
    font-size: 0.72rem;
    line-height: 1.55;
    color: var(--faint);
  }

  .method-card strong {
    color: var(--muted);
    font-weight: 500;
  }

  .method-card a {
    display: inline-block;
    margin-top: 0.4rem;
    color: var(--gold);
  }

  .empty-state {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin-top: 0.4rem;
  }

  .empty-item {
    display: flex;
    gap: 0.8rem;
    align-items: flex-start;
    padding: 1rem;
    border: 1px solid var(--line-soft);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.02);
  }

  .empty-glyph {
    color: var(--gold);
    font-size: 1.25rem;
    line-height: 1.2;
  }

  .empty-item p {
    font-size: 0.78rem;
    line-height: 1.55;
    color: var(--faint);
  }

  .empty-item strong {
    color: var(--muted);
    font-weight: 500;
  }

  @keyframes result-in {
    from {
      opacity: 0;
      transform: translateY(18px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  @keyframes grow-bar {
    from {
      width: 0;
    }
  }

  @media (max-width: 1050px) {
    .chart-layout {
      grid-template-columns: 1fr;
    }
    .chart-left {
      position: static;
    }
    .chart-right {
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: start;
    }
    .summary-card {
      grid-column: 1 / -1;
    }
    .method-card {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 760px) {
    .form-head {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
    .form-note {
      text-align: left;
    }
    .result-head {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
    .chart-right {
      display: flex;
    }
    .empty-state {
      grid-template-columns: 1fr;
    }
    .detail-link {
      width: 100%;
      margin-left: 0;
    }
  }

  @media (max-width: 560px) {
    .summary-big {
      grid-template-columns: 1fr 1fr;
    }
    .summary-big > div:last-child {
      grid-column: 1 / -1;
    }
    .result-actions {
      width: 100%;
    }
    .segmented {
      width: 100%;
    }
    .segmented button {
      flex: 1;
    }
  }
</style>
