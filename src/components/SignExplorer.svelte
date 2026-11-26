<script lang="ts">
  import { flip } from 'svelte/animate';
  import { SIGNS, type ElementName } from '../data/signs';
  import { href } from '../lib/url';

  const elementColor: Record<string, string> = {
    Fire: '#ff8a5c',
    Earth: '#7fcf9d',
    Air: '#8fb8ff',
    Water: '#b79dff',
  };

  const filters: ('All' | ElementName)[] = ['All', 'Fire', 'Earth', 'Air', 'Water'];
  let active = $state<'All' | ElementName>('All');
  let modality = $state<'All' | 'Cardinal' | 'Fixed' | 'Mutable'>('All');

  const filtered = $derived(
    SIGNS.filter(
      (sign) =>
        (active === 'All' || sign.element === active) &&
        (modality === 'All' || sign.modality === modality),
    ),
  );
</script>

<div class="explorer">
  <div class="controls">
    <div class="filter-group" role="group" aria-label="Filter by element">
      {#each filters as filter}
        <button
          type="button"
          class:active={active === filter}
          aria-pressed={active === filter}
          onclick={() => (active = filter)}
        >
          {#if filter !== 'All'}
            <span class="dot" style={`background:${elementColor[filter]}`}></span>
          {/if}
          {filter}
        </button>
      {/each}
    </div>
    <div class="filter-group modality-group" role="group" aria-label="Filter by modality">
      {#each ['All', 'Cardinal', 'Fixed', 'Mutable'] as option}
        <button
          type="button"
          class:active={modality === option}
          aria-pressed={modality === option}
          onclick={() => (modality = option)}
        >
          {option}
        </button>
      {/each}
    </div>
  </div>

  <p class="count" aria-live="polite">
    {filtered.length} {filtered.length === 1 ? 'sign' : 'signs'}
    {#if active !== 'All'}of {active.toLowerCase()}{/if}
  </p>

  {#if filtered.length > 0}
    <div class="sign-grid">
      {#each filtered as sign, i (sign.slug)}
        <a
          class="sign-card card"
          href={href(`/zodiac/${sign.slug}/`)}
          style={`--c:${elementColor[sign.element]}; --i:${i}`}
          animate:flip={{ duration: 350 }}
        >
          <span class="ghost glyph" aria-hidden="true">{sign.glyph}</span>
          <div class="top">
            <span class="glyph" style={`color:${elementColor[sign.element]}`}>{sign.glyph}</span>
            <span class="dates">{sign.dates}</span>
          </div>
          <h3 class="name">{sign.name}</h3>
          <p class="tagline">{sign.tagline}</p>
          <p class="copy">{sign.short}</p>
          <div class="meta">
            <span class="meta-item">
              <span class="meta-dot" style={`background:${elementColor[sign.element]}`}></span>
              {sign.element}
            </span>
            <span class="meta-sep" aria-hidden="true">·</span>
            <span>{sign.modality}</span>
            <span class="meta-sep" aria-hidden="true">·</span>
            <span class="glyph ruler">{sign.rulerGlyph}</span>
            <span>{sign.ruler}</span>
            <span class="arrow" aria-hidden="true">↗</span>
          </div>
        </a>
      {/each}
    </div>
  {:else}
    <p class="empty">No signs match that combination. The zodiac is flexible; try another filter.</p>
  {/if}
</div>

<style>
  .explorer {
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
  }

  .controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--line-soft);
  }

  .filter-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }

  .filter-group button {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.45rem 0.85rem;
    border: 1px solid transparent;
    border-radius: 999px;
    background: transparent;
    font-size: 0.76rem;
    color: var(--muted);
    transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
  }

  .filter-group button:hover {
    background: var(--surface);
    color: var(--ink);
  }

  .filter-group button.active {
    border-color: rgba(232, 196, 124, 0.28);
    background: rgba(232, 196, 124, 0.09);
    color: var(--gold-bright);
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    box-shadow: 0 0 8px currentColor;
  }

  .modality-group {
    padding: 3px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--surface);
  }

  .modality-group button {
    padding: 0.36rem 0.7rem;
    font-size: 0.7rem;
  }

  .modality-group button.active {
    border-color: transparent;
    background: rgba(232, 196, 124, 0.1);
  }

  .count {
    margin-top: -0.6rem;
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--faint);
  }

  .sign-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.9rem;
  }

  .sign-card {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 300px;
    padding: 1.5rem;
    overflow: hidden;
    border-color: var(--line);
    animation: card-in 0.55s var(--ease) both;
    animation-delay: calc(var(--i) * 35ms);
    transition:
      transform 0.45s var(--ease),
      border-color 0.45s ease,
      box-shadow 0.45s ease;
  }

  .sign-card:hover {
    transform: translateY(-6px);
    border-color: color-mix(in srgb, var(--c) 42%, transparent);
    box-shadow: 0 30px 60px -34px color-mix(in srgb, var(--c) 55%, transparent);
  }

  .ghost {
    position: absolute;
    right: -1rem;
    bottom: -2.4rem;
    font-size: 11rem;
    line-height: 1;
    color: var(--c);
    opacity: 0.045;
    pointer-events: none;
    transition: opacity 0.4s ease, transform 0.6s var(--ease);
  }

  .sign-card:hover .ghost {
    opacity: 0.1;
    transform: rotate(-8deg);
  }

  .top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.7rem;
  }

  .top .glyph {
    font-size: 2.1rem;
    transition: transform 0.5s var(--ease);
  }

  .sign-card:hover .top .glyph {
    transform: rotate(10deg) scale(1.1);
  }

  .dates {
    padding-top: 0.5rem;
    font-size: 0.6rem;
    letter-spacing: 0.1em;
    color: var(--faint);
    text-align: right;
  }

  .name {
    margin-top: 1.1rem;
    font-family: var(--font-serif);
    font-size: 2.2rem;
    font-weight: 400;
    line-height: 1;
  }

  .tagline {
    margin-top: 0.3rem;
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 1.05rem;
    color: var(--c);
  }

  .copy {
    margin-top: 0.75rem;
    font-size: 0.82rem;
    line-height: 1.55;
    color: var(--muted);
  }

  .meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: auto;
    padding-top: 1.2rem;
    border-top: 1px solid var(--line-soft);
    font-size: 0.65rem;
    letter-spacing: 0.03em;
    color: var(--faint);
  }

  .meta-item {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }

  .meta-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
  }

  .meta-sep {
    opacity: 0.4;
  }

  .ruler {
    color: var(--gold);
  }

  .arrow {
    margin-left: auto;
    font-size: 1rem;
    color: var(--c);
    transition: transform 0.3s var(--ease);
  }

  .sign-card:hover .arrow {
    transform: translate(3px, -3px);
  }

  .empty {
    padding: 2rem;
    border: 1px dashed var(--line);
    border-radius: 18px;
    text-align: center;
    color: var(--faint);
    font-size: 0.85rem;
  }

  @keyframes card-in {
    from {
      opacity: 0;
      transform: translateY(14px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  @media (max-width: 1000px) {
    .sign-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 640px) {
    .sign-grid {
      grid-template-columns: 1fr;
    }
    .sign-card {
      min-height: 260px;
    }
    .controls {
      flex-direction: column;
      align-items: flex-start;
    }
    .modality-group {
      width: 100%;
    }
    .modality-group button {
      flex: 1;
    }
  }
</style>
