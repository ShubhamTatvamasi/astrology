<script lang="ts">
  import { tick } from 'svelte';
  import BirthForm from './BirthForm.svelte';
  import { computeChart, type Chart } from '../lib/astrology';
  import { href } from '../lib/url';
  import type { BirthData, BirthInitial } from '../lib/types';

  interface Props {
    initial?: BirthInitial | null;
    submitLabel?: string;
  }

  let { initial = null, submitLabel = 'Reveal my big three' }: Props = $props();

  let chart = $state<Chart | null>(null);
  let data = $state<BirthData | null>(null);
  let resultEl = $state<HTMLElement | null>(null);

  async function handleCalculate(input: BirthData) {
    data = input;
    chart = computeChart({
      date: input.date,
      latitude: input.latitude,
      longitude: input.longitude,
    });
    await tick();
    if (resultEl) {
      resultEl.focus({ preventScroll: true });
      if (window.innerWidth < 760) {
        resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  const sun = $derived(chart?.positions.find((p) => p.key === 'Sun') ?? null);
  const moon = $derived(chart?.positions.find((p) => p.key === 'Moon') ?? null);

  function offsetHours(input: BirthData): number {
    const [y, m, d] = input.localDate.split('-').map(Number);
    const [hh, mm] = input.localTime.split(':').map(Number);
    const local = Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1, hh ?? 12, mm ?? 0);
    return Math.round(((local - input.date.getTime()) / 3600_000) * 100) / 100;
  }

  const chartHref = $derived.by(() => {
    if (!data) return href('/chart/');
    const params = new URLSearchParams({
      d: data.localDate,
      t: data.localTime,
      lat: String(data.latitude),
      lon: String(data.longitude),
      tz: data.timezone,
      place: data.placeLabel,
      u: data.timeUnknown ? '1' : '0',
      off: String(offsetHours(data)),
    });
    return `${href('/chart/')}?${params.toString()}`;
  });

  const cards = $derived.by(() => {
    if (!chart || !data) return [];
    return [
      {
        key: 'sun',
        label: 'Sun',
        glyph: '☉',
        body: sun!,
        text: sun!.sign.sun,
        note: 'Your core identity and the style of your vitality.',
        color: '#f2c56b',
        unknown: false,
      },
      {
        key: 'moon',
        label: 'Moon',
        glyph: '☽',
        body: moon!,
        text: moon!.sign.moon,
        note: 'Your emotional needs and the way you self-soothe.',
        color: '#d8d6ef',
        unknown: false,
      },
      {
        key: 'rising',
        label: 'Rising',
        glyph: chart.ascendant.sign.glyph,
        body: {
          sign: chart.ascendant.sign,
          degreeText: chart.ascendant.degreeText,
        },
        text: chart.ascendant.sign.rising,
        note: 'Your first impression and the instinctive way you meet the world.',
        color: '#e8c47c',
        unknown: data.timeUnknown,
      },
    ];
  });
</script>

<div class="big-three">
  <div class="form-card card card-pad">
    <BirthForm {initial} {submitLabel} onCalculate={handleCalculate} />
  </div>

  {#if chart && data}
    <section class="result" bind:this={resultEl} tabindex="-1" aria-live="polite" aria-label="Your big three results">
      <div class="result-head">
        <div>
          <p class="eyebrow">Your big three</p>
          <h2 class="display result-title">
            {sun?.sign.name} sun. <span class="soft">{moon?.sign.name} moon.</span><br />
            {#if data.timeUnknown}
              <span class="gold">Rising needs a time.</span>
            {:else}
              <span class="gold">{chart.ascendant.sign.name} rising.</span>
            {/if}
          </h2>
          <p class="result-meta">
            {data.placeLabel} · {data.localDate} · {data.localTime}
            {#if data.timeUnknown} (noon){/if}
            · {data.tzLabel}
          </p>
        </div>
        <a class="btn btn-ghost btn-sm" href={chartHref}>Open full chart <span class="arrow">↗</span></a>
      </div>

      <div class="three-grid">
        {#each cards as card (card.key)}
          <article class="three-card card" style={`--accent:${card.color}`}>
            <div class="three-top">
              <span class="three-glyph glyph" aria-hidden="true">{card.unknown ? '?' : card.glyph}</span>
              <div class="three-id">
                <span class="three-label">{card.label}</span>
                {#if card.unknown}
                  <span class="three-sign">Needs birth time</span>
                {:else}
                  <a class="three-sign" href={href(`/zodiac/${card.body.sign.slug}/`)}>
                    {card.body.sign.name}
                    <span class="three-degree">{card.body.degreeText}</span>
                  </a>
                {/if}
              </div>
            </div>

            {#if card.unknown}
              <p class="three-copy">
                The rising sign changes roughly every two hours, so we can’t place it without a birth
                time. Add one above for the full picture.
              </p>
            {:else}
              <p class="three-copy">{card.text}</p>
              <div class="three-tags">
                <span class="chip">
                  <span class="element-dot" style={`color:${card.body.sign.element === 'Fire' ? '#ff8a5c' : card.body.sign.element === 'Earth' ? '#7fcf9d' : card.body.sign.element === 'Air' ? '#8fb8ff' : '#b79dff'}`}></span>
                  {card.body.sign.element}
                </span>
                <span class="chip">{card.body.sign.modality}</span>
                <span class="chip">{card.body.sign.rulerGlyph} {card.body.sign.ruler}</span>
              </div>
            {/if}
            <p class="three-note">{card.note}</p>
          </article>
        {/each}
      </div>

      <div class="result-foot">
        <p>
          This is a real chart calculated from the sky at your birth, not a date-range guess. The
          full chart adds houses, every planet, and the aspects between them.
        </p>
        <a class="text-link" href={chartHref}>See the whole map <span aria-hidden="true">→</span></a>
      </div>
    </section>
  {/if}
</div>

<style>
  .big-three {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .form-card {
    overflow: visible;
    position: relative;
    z-index: 2;
    background:
      linear-gradient(155deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.015) 55%),
      rgba(9, 10, 20, 0.72);
    border-radius: 26px;
    padding: clamp(1.2rem, 3vw, 2rem);
  }

  .result {
    padding-top: 0.4rem;
    scroll-margin-top: 100px;
    animation: result-in 0.7s var(--ease) both;
    outline: none;
  }

  .result-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .result-title {
    margin-top: 0.55rem;
    font-size: clamp(1.8rem, 3.4vw, 2.8rem);
    line-height: 1.02;
    max-width: 30ch;
  }

  .result-title .soft {
    color: var(--violet-soft);
  }

  .result-meta {
    margin-top: 0.6rem;
    font-size: 0.76rem;
    letter-spacing: 0.04em;
    color: var(--faint);
  }

  .three-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }

  .three-card {
    padding: 1.35rem;
    border-top: 1px solid color-mix(in srgb, var(--accent) 55%, transparent);
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .three-top {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  .three-glyph {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    flex-shrink: 0;
    border-radius: 50%;
    font-size: 1.7rem;
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
    box-shadow: 0 0 30px -8px var(--accent);
  }

  .three-id {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .three-label {
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--faint);
  }

  .three-sign {
    display: inline-flex;
    align-items: baseline;
    gap: 0.45rem;
    font-family: var(--font-serif);
    font-size: 1.7rem;
    line-height: 1.1;
    color: var(--ink);
    transition: color 0.2s ease;
  }

  a.three-sign:hover {
    color: var(--gold-bright);
  }

  .three-degree {
    font-family: var(--font-sans);
    font-size: 0.66rem;
    letter-spacing: 0.02em;
    color: var(--faint);
    font-variant-numeric: tabular-nums;
  }

  .three-copy {
    font-size: 0.9rem;
    line-height: 1.62;
    color: var(--muted);
  }

  .three-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: auto;
  }

  .three-note {
    padding-top: 0.8rem;
    border-top: 1px solid var(--line-soft);
    font-size: 0.7rem;
    line-height: 1.5;
    color: var(--faint);
  }

  .result-foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
    margin-top: 1.5rem;
    padding-top: 1.2rem;
    border-top: 1px solid var(--line-soft);
  }

  .result-foot p {
    max-width: 58ch;
    font-size: 0.78rem;
    color: var(--faint);
    line-height: 1.55;
  }

  .text-link {
    font-size: 0.82rem;
    color: var(--gold);
    white-space: nowrap;
    transition: color 0.2s ease;
  }

  .text-link:hover {
    color: var(--gold-bright);
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

  @media (max-width: 900px) {
    .three-grid {
      grid-template-columns: 1fr;
    }
    .three-card {
      display: grid;
      grid-template-columns: 1fr;
    }
    .result-head {
      flex-direction: column;
      align-items: flex-start;
    }
    .result-foot {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.7rem;
    }
  }

  @media (max-width: 560px) {
    .result-title {
      font-size: 1.9rem;
    }
  }
</style>
