<script lang="ts">
  import type { Chart } from '../lib/astrology';
  import { buildVedicMatch, type VedicRoleOrder } from '../lib/vedic';
  import { VEDIC_NOTE } from '../data/vedic';

  interface Props {
    chartA: Chart;
    chartB: Chart;
    dateA: Date;
    dateB: Date;
    timeUnknown?: boolean;
  }

  let { chartA, chartB, dateA, dateB, timeUnknown = false }: Props = $props();

  let order = $state<VedicRoleOrder>('a-bride');
  const match = $derived(buildVedicMatch(chartA, chartB, dateA, dateB, order));
  const youProfile = $derived(order === 'a-bride' ? match.bride : match.groom);
  const partnerProfile = $derived(order === 'a-bride' ? match.groom : match.bride);

  const fmt = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(1));
  const pct = (score: number, max: number) => Math.round((score / max) * 100);
</script>

<section class="vedic-section card" aria-labelledby="vedic-heading">
  <div class="vedic-head">
    <div>
      <p class="kicker">Traditional Vedic layer</p>
      <h3 id="vedic-heading" class="serif vedic-title">Ashtakoot Gun Milan</h3>
      <p class="vedic-sub">
        A 36-point Moon-based marriage assessment using Lahiri sidereal nakshatras. Separate from
        the Western synastry above.
      </p>
    </div>
    <div class="vedic-score">
      <span>{fmt(match.total)}</span>
      <small>/ 36</small>
    </div>
  </div>

  <div class="role-row">
    <span>Traditional role order</span>
    <div class="segmented" role="group" aria-label="Vedic role order">
      <button type="button" aria-pressed={order === 'a-bride'} onclick={() => (order = 'a-bride')}>
        You bride · Partner groom
      </button>
      <button type="button" aria-pressed={order === 'b-bride'} onclick={() => (order = 'b-bride')}>
        Partner bride · You groom
      </button>
    </div>
  </div>

  {#if timeUnknown}
    <p class="vedic-warning">
      <span aria-hidden="true">☾</span>
      One or both birth times are unknown. The Moon can move several degrees in a day, so the
      nakshatra and these kootas may change. Read this as an estimate.
    </p>
  {/if}

  <div class="vedic-summary">
    <span class={`vedic-band band-${match.band.label.toLowerCase().replaceAll(' ', '-')}`}>
      {match.band.label}
    </span>
    <p>{match.summary}</p>
  </div>

  <div class="moon-grid">
    <article class="moon-profile">
      <p class="moon-role">You</p>
      <h4>{youProfile.nakshatra.name} <span>pada {youProfile.pada}</span></h4>
      <p class="moon-line">{youProfile.rashi.name} ({youProfile.rashi.western}) · Moon {youProfile.rashi.lord}</p>
      <div class="profile-chips">
        <span class="chip">{youProfile.varna}</span>
        <span class="chip">{youProfile.vashya}</span>
        <span class="chip">{youProfile.gana}</span>
        <span class="chip">{youProfile.nadi} Nadi</span>
        <span class="chip">{youProfile.yoni} Yoni</span>
      </div>
    </article>
    <article class="moon-profile">
      <p class="moon-role">Partner</p>
      <h4>{partnerProfile.nakshatra.name} <span>pada {partnerProfile.pada}</span></h4>
      <p class="moon-line">{partnerProfile.rashi.name} ({partnerProfile.rashi.western}) · Moon {partnerProfile.rashi.lord}</p>
      <div class="profile-chips">
        <span class="chip">{partnerProfile.varna}</span>
        <span class="chip">{partnerProfile.vashya}</span>
        <span class="chip">{partnerProfile.gana}</span>
        <span class="chip">{partnerProfile.nadi} Nadi</span>
        <span class="chip">{partnerProfile.yoni} Yoni</span>
      </div>
    </article>
  </div>

  <div class="koota-list">
    {#each match.kootas as koota (koota.key)}
      <div class="koota-row">
        <div class="koota-name">
          <strong>{koota.label}</strong>
          <span>{koota.checks}</span>
        </div>
        <div class="koota-score">
          <span>{fmt(koota.score)}<small> / {koota.max}</small></span>
          <span class="koota-track"><span style={`width:${pct(koota.score, koota.max)}%`}></span></span>
        </div>
        <p class="koota-detail">{koota.detail}</p>
      </div>
    {/each}
  </div>

  {#if match.doshas.length > 0}
    <div class="dosha-row">
      <span class="dosha-label">Traditional flags</span>
      {#each match.doshas as dosha}
        <span class="dosha-chip">{dosha}</span>
      {/each}
      <span class="dosha-note">A traditional concern, not a verdict. Many astrologers weigh the full charts and cancellation rules.</span>
    </div>
  {:else}
    <p class="no-dosha">None of the four main koota doshas appear in this calculation.</p>
  {/if}

  <p class="vedic-note">
    {VEDIC_NOTE} Ayanamsa used: Lahiri ≈ {match.bride.ayanamsa.toFixed(2)}° (approximate).
    Tara boundary conventions vary by tradition. The role order affects Varna, Gana, and Tara;
    switch it above to see the other traditional orientation.
  </p>
</section>

<style>
  .vedic-section {
    padding: clamp(1.2rem, 3vw, 1.8rem);
    background:
      radial-gradient(500px 220px at 90% 0%, var(--gold-tint), transparent 70%),
      var(--card-bg);
  }

  .vedic-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .vedic-title {
    margin-top: 0.35rem;
    font-size: 1.8rem;
    line-height: 1;
  }

  .vedic-sub {
    margin-top: 0.45rem;
    max-width: 62ch;
    font-size: 0.72rem;
    line-height: 1.55;
    color: var(--faint);
  }

  .vedic-score {
    display: flex;
    align-items: baseline;
    gap: 0.2rem;
    flex-shrink: 0;
    font-family: var(--font-serif);
  }

  .vedic-score span {
    font-size: 3rem;
    line-height: 1;
    color: var(--gold-bright);
  }

  .vedic-score small {
    font-family: var(--font-sans);
    font-size: 0.7rem;
    color: var(--faint);
  }

  .role-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 1.1rem;
    padding-top: 0.9rem;
    border-top: 1px solid var(--line-soft);
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--faint);
  }

  .role-row .segmented button {
    font-size: 0.65rem;
    letter-spacing: 0;
    text-transform: none;
  }

  .vedic-warning {
    display: flex;
    gap: 0.45rem;
    align-items: baseline;
    margin-top: 0.8rem;
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--gold-line);
    border-radius: 10px;
    background: var(--gold-tint);
    font-size: 0.68rem;
    line-height: 1.5;
    color: var(--muted);
  }

  .vedic-warning span {
    color: var(--gold);
  }

  .vedic-summary {
    display: flex;
    align-items: flex-start;
    gap: 0.65rem;
    margin-top: 1rem;
  }

  .vedic-band {
    flex-shrink: 0;
    padding: 0.25rem 0.55rem;
    border: 1px solid var(--gold-line);
    border-radius: 999px;
    font-size: 0.55rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--gold);
    background: var(--gold-tint);
  }

  .band-average,
  .band-needs-context {
    border-color: color-mix(in srgb, var(--rose) 35%, transparent);
    color: var(--rose);
    background: color-mix(in srgb, var(--rose) 7%, transparent);
  }

  .vedic-summary p {
    font-size: 0.72rem;
    line-height: 1.55;
    color: var(--muted);
  }

  .moon-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
    margin-top: 1rem;
  }

  .moon-profile {
    padding: 0.9rem;
    border: 1px solid var(--line-soft);
    border-radius: 13px;
    background: var(--surface);
  }

  .moon-role {
    font-size: 0.55rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--gold);
  }

  .moon-profile h4 {
    margin-top: 0.25rem;
    font-family: var(--font-serif);
    font-size: 1.2rem;
    font-weight: 400;
  }

  .moon-profile h4 span {
    font-family: var(--font-sans);
    font-size: 0.58rem;
    color: var(--faint);
  }

  .moon-line {
    margin-top: 0.15rem;
    font-size: 0.65rem;
    color: var(--faint);
  }

  .profile-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin-top: 0.6rem;
  }

  .profile-chips .chip {
    font-size: 0.55rem;
    padding: 0.2rem 0.42rem;
  }

  .koota-list {
    display: flex;
    flex-direction: column;
    margin-top: 1.1rem;
  }

  .koota-row {
    display: grid;
    grid-template-columns: 8rem 8.5rem minmax(0, 1fr);
    gap: 0.8rem;
    align-items: center;
    padding: 0.6rem 0;
    border-bottom: 1px solid var(--line-soft);
  }

  .koota-row:last-child {
    border-bottom: 0;
  }

  .koota-name {
    display: flex;
    flex-direction: column;
  }

  .koota-name strong {
    font-size: 0.76rem;
    font-weight: 500;
  }

  .koota-name span {
    font-size: 0.58rem;
    line-height: 1.35;
    color: var(--faint);
  }

  .koota-score {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.72rem;
    color: var(--ink);
    font-variant-numeric: tabular-nums;
  }

  .koota-score small {
    font-size: 0.58rem;
    color: var(--faint);
  }

  .koota-track {
    flex: 1;
    height: 3px;
    border-radius: 99px;
    background: var(--surface-strong);
    overflow: hidden;
  }

  .koota-track span {
    display: block;
    height: 100%;
    border-radius: 99px;
    background: var(--gold);
  }

  .koota-detail {
    font-size: 0.62rem;
    line-height: 1.4;
    color: var(--faint);
  }

  .dosha-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem;
    margin-top: 0.9rem;
    padding-top: 0.8rem;
    border-top: 1px solid var(--line-soft);
  }

  .dosha-label {
    font-size: 0.55rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--rose);
  }

  .dosha-chip {
    padding: 0.22rem 0.48rem;
    border: 1px solid color-mix(in srgb, var(--rose) 35%, transparent);
    border-radius: 999px;
    background: color-mix(in srgb, var(--rose) 7%, transparent);
    font-size: 0.6rem;
    color: var(--rose);
  }

  .dosha-note {
    flex-basis: 100%;
    font-size: 0.62rem;
    line-height: 1.45;
    color: var(--faint);
  }

  .no-dosha {
    margin-top: 0.8rem;
    padding-top: 0.8rem;
    border-top: 1px solid var(--line-soft);
    font-size: 0.65rem;
    color: var(--faint);
  }

  .vedic-note {
    margin-top: 0.8rem;
    font-size: 0.62rem;
    line-height: 1.55;
    color: var(--faint);
  }

  @media (max-width: 760px) {
    .vedic-head {
      flex-direction: column;
    }
    .moon-grid {
      grid-template-columns: 1fr;
    }
    .koota-row {
      grid-template-columns: 7rem minmax(0, 1fr);
    }
    .koota-detail {
      grid-column: 1 / -1;
    }
    .role-row {
      align-items: flex-start;
      flex-direction: column;
    }
    .role-row .segmented {
      width: 100%;
    }
    .role-row .segmented button {
      flex: 1;
    }
  }
</style>
