<script lang="ts">
  import { onMount } from 'svelte';
  import MoonPhase from './MoonPhase.svelte';
  import { currentPositions, moonNow, moonSign, sunSign } from '../lib/astrology';
  import { href } from '../lib/url';

  interface SkyInfo {
    phaseName: string;
    phaseGlyph: string;
    elongation: number;
    illumination: number;
    moonSignName: string;
    moonSignGlyph: string;
    sunSignName: string;
    sunSignGlyph: string;
    mercuryRetrograde: boolean;
    mercurySign: string;
    updated: string;
  }

  let info = $state<SkyInfo | null>(null);

  function refresh() {
    const now = new Date();
    const moon = moonNow(now);
    const sun = sunSign(now);
    const moonSignNow = moonSign(now);
    const mercury = currentPositions(now).find((p) => p.key === 'Mercury');
    info = {
      phaseName: moon.phase.name,
      phaseGlyph: moon.phase.glyph,
      elongation: moon.elongation,
      illumination: Math.round(moon.illumination),
      moonSignName: moonSignNow.name,
      moonSignGlyph: moonSignNow.glyph,
      sunSignName: sun.name,
      sunSignGlyph: sun.glyph,
      mercuryRetrograde: Boolean(mercury?.retrograde),
      mercurySign: mercury?.sign.name ?? '',
      updated: new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }).format(now),
    };
  }

  onMount(() => {
    refresh();
    const timer = setInterval(refresh, 60_000);
    return () => clearInterval(timer);
  });
</script>

<div class="sky-strip glass">
  <div class="live">
    <span class="live-dot" aria-hidden="true"></span>
    Live sky
  </div>

  <div class="items">
    <div class="item moon-item">
      {#if info}
        <MoonPhase elongation={info.elongation} size={38} glow={false} />
      {:else}
        <span class="moon-placeholder" aria-hidden="true"></span>
      {/if}
      <div class="item-copy">
        <span class="item-label">Moon</span>
        <strong>{info?.phaseName ?? '—'}</strong>
        <small>{info ? `${info.illumination}% illuminated` : 'calculating…'}</small>
      </div>
    </div>

    <div class="item">
      <span class="item-glyph glyph" aria-hidden="true">{info ? info.sunSignGlyph : '☉'}</span>
      <div class="item-copy">
        <span class="item-label">Sun</span>
        <strong>{info ? `${info.sunSignName}` : '—'}</strong>
        <small>identity & vitality</small>
      </div>
    </div>

    <div class="item">
      <span class="item-glyph glyph" aria-hidden="true">{info ? info.moonSignGlyph : '☽'}</span>
      <div class="item-copy">
        <span class="item-label">Moon in</span>
        <strong>{info?.moonSignName ?? '—'}</strong>
        <small>emotional weather</small>
      </div>
    </div>

    <div class="item">
      <span class="item-glyph glyph" aria-hidden="true">☿</span>
      <div class="item-copy">
        <span class="item-label">Mercury</span>
        <strong class:retro={info?.mercuryRetrograde}>
          {info ? (info.mercuryRetrograde ? 'Retrograde ℞' : 'Direct') : '—'}
        </strong>
        <small>{info ? `in ${info.mercurySign}` : 'the messenger'}</small>
      </div>
    </div>
  </div>

  <div class="strip-foot">
    <span class="updated">Updated {info?.updated ?? '—'}</span>
    <a class="strip-link" href={href('/sky/')}>Sky now <span aria-hidden="true">→</span></a>
  </div>
</div>

<style>
  .sky-strip {
    display: flex;
    align-items: center;
    gap: 1.4rem;
    padding: 0.85rem 1rem 0.85rem 1.15rem;
    border-radius: 20px;
    background: var(--glass-bg);
  }

  .live {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding-right: 1.2rem;
    border-right: 1px solid var(--line-soft);
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--gold);
    white-space: nowrap;
    align-self: stretch;
  }

  .live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--gold);
    box-shadow: 0 0 10px 2px rgba(232, 196, 124, 0.6);
    animation: blink 2.4s ease-in-out infinite;
  }

  .items {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1.2rem;
    flex: 1;
  }

  .item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    min-width: 0;
  }

  .moon-item {
    gap: 0.35rem;
  }

  .moon-placeholder {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--surface-strong);
    flex-shrink: 0;
  }

  .item-glyph {
    font-size: 1.35rem;
    color: var(--gold);
    width: 1.5rem;
    text-align: center;
    flex-shrink: 0;
  }

  .item-copy {
    display: flex;
    flex-direction: column;
    line-height: 1.25;
    min-width: 0;
  }

  .item-label {
    font-size: 0.55rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--faint);
  }

  .item-copy strong {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-copy strong.retro {
    color: var(--rose);
  }

  .item-copy small {
    font-size: 0.62rem;
    color: var(--faint);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .strip-foot {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.15rem;
    padding-left: 1rem;
    border-left: 1px solid var(--line-soft);
    white-space: nowrap;
  }

  .updated {
    font-size: 0.55rem;
    letter-spacing: 0.06em;
    color: var(--faint);
  }

  .strip-link {
    font-size: 0.72rem;
    color: var(--gold);
    transition: color 0.2s ease;
  }

  .strip-link:hover {
    color: var(--gold-bright);
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

  @media (max-width: 1000px) {
    .sky-strip {
      flex-wrap: wrap;
      gap: 0.9rem 1.2rem;
    }
    .items {
      order: 3;
      flex-basis: 100%;
    }
    .live {
      align-self: auto;
    }
    .strip-foot {
      margin-left: auto;
      flex-direction: row;
      align-items: center;
      gap: 0.8rem;
      border-left: 0;
      padding-left: 0;
    }
  }

  @media (max-width: 720px) {
    .items {
      grid-template-columns: 1fr 1fr;
      gap: 0.9rem;
    }
    .live {
      border-right: 0;
      padding-right: 0;
    }
  }

  @media (max-width: 460px) {
    .sky-strip {
      padding: 0.9rem;
    }
    .strip-foot {
      display: none;
    }
    .item-copy small {
      display: none;
    }
  }
</style>
