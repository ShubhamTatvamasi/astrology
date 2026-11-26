<script lang="ts">
  import { onMount, tick } from 'svelte';
  import BirthForm from './BirthForm.svelte';
  import SynastryWheel from './SynastryWheel.svelte';
  import VedicMatch from './VedicMatch.svelte';
  import { computeChart } from '../lib/astrology';
  import { buildSynastry } from '../lib/synastry';
  import { SYNASTRY_CATEGORIES, type SynastryCategoryKey } from '../data/synastry';
  import {
    saveBirthData,
    loadBirthData,
    clearBirthData,
    savePartnerData,
    loadPartnerData,
    clearPartnerData,
  } from '../lib/storage';
  import { initialFromSearch, resolveBirth, searchFromBirth } from '../lib/birth';
  import { href } from '../lib/url';
  import type { BirthData, BirthInitial } from '../lib/types';

  let personA = $state<BirthData | null>(null);
  let personB = $state<BirthData | null>(null);
  let ready = $state(false);
  let editingA = $state(true);
  let editingB = $state(true);
  let formInitialA = $state<BirthInitial | null>(null);
  let formInitialB = $state<BirthInitial | null>(null);
  let formIdA = $state(0);
  let formIdB = $state(0);
  let copied = $state(false);
  let copyTimer: ReturnType<typeof setTimeout> | undefined;
  let resultEl = $state<HTMLElement | null>(null);
  let formElA = $state<HTMLElement | null>(null);
  let formElB = $state<HTMLElement | null>(null);

  const chartA = $derived(
    personA
      ? computeChart({
          date: personA.date,
          latitude: personA.latitude,
          longitude: personA.longitude,
        })
      : null,
  );
  const chartB = $derived(
    personB
      ? computeChart({
          date: personB.date,
          latitude: personB.latitude,
          longitude: personB.longitude,
        })
      : null,
  );
  const report = $derived(
    chartA && chartB
      ? buildSynastry(chartA, chartB, {
          timeUnknownA: personA?.timeUnknown,
          timeUnknownB: personB?.timeUnknown,
        })
      : null,
  );

  const showResults = $derived(report && !editingA && !editingB);
  const categoryByKey = (key: SynastryCategoryKey) => SYNASTRY_CATEGORIES.find((c) => c.key === key)!;
  const categoryLabel = (key: SynastryCategoryKey) => categoryByKey(key).label;
  const scorePct = (score: number) => `${Math.max(2, score)}%`;
  const toneLabel = (tone: string) => (tone === 'ease' ? 'Ease' : tone === 'friction' ? 'Friction' : 'Intense');

  function initialFor(data: BirthData | null): BirthInitial | null {
    return data ? initialFromSearch(`?${searchFromBirth(data, 'whole')}`) : null;
  }

  function syncUrl() {
    const params = new URLSearchParams();
    if (personA) params.set('a', searchFromBirth(personA, 'whole'));
    if (personB) params.set('b', searchFromBirth(personB, 'whole'));
    const query = params.toString();
    try {
      history.replaceState(null, '', query ? `${window.location.pathname}?${query}` : window.location.pathname);
    } catch {
      /* ignore */
    }
  }

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const aRaw = params.get('a');
    const bRaw = params.get('b');
    const parsedA = aRaw ? initialFromSearch(`?${aRaw}`) : null;
    const parsedB = bRaw ? initialFromSearch(`?${bRaw}`) : null;
    const resolvedA = parsedA ? resolveBirth(parsedA) : null;
    const resolvedB = parsedB ? resolveBirth(parsedB) : null;

    if (resolvedA) {
      personA = resolvedA;
      formInitialA = parsedA;
      saveBirthData(resolvedA);
      editingA = false;
    }
    if (resolvedB) {
      personB = resolvedB;
      formInitialB = parsedB;
      savePartnerData(resolvedB);
      editingB = false;
    }

    if (!personA) {
      const savedA = loadBirthData();
      if (savedA) {
        personA = savedA;
        formInitialA = initialFor(savedA);
        editingA = false;
      }
    }
    if (!personB) {
      const savedB = loadPartnerData();
      if (savedB) {
        personB = savedB;
        formInitialB = initialFor(savedB);
        editingB = false;
      }
    }

    ready = true;
  });

  async function handleA(input: BirthData) {
    personA = input;
    saveBirthData(input);
    formInitialA = initialFor(input);
    editingA = false;
    syncUrl();
    await tick();
    if (personB) {
      resultEl?.focus({ preventScroll: true });
      if (window.innerWidth < 900) resultEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      editingB = true;
      formElB?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  async function handleB(input: BirthData) {
    personB = input;
    savePartnerData(input);
    formInitialB = initialFor(input);
    editingB = false;
    syncUrl();
    await tick();
    if (personA) {
      resultEl?.focus({ preventScroll: true });
      if (window.innerWidth < 900) resultEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function editA() {
    formInitialA = initialFor(personA);
    formIdA += 1;
    editingA = true;
    tick().then(() => {
      formElA?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      formElA?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });
    });
  }

  function editB() {
    formInitialB = initialFor(personB);
    formIdB += 1;
    editingB = true;
    tick().then(() => {
      formElB?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      formElB?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });
    });
  }

  function clearA() {
    clearBirthData();
    personA = null;
    editingA = true;
    formInitialA = null;
    formIdA += 1;
    syncUrl();
    tick().then(() => formElA?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }

  function clearB() {
    clearPartnerData();
    personB = null;
    editingB = true;
    formInitialB = null;
    formIdB += 1;
    syncUrl();
    tick().then(() => formElB?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }

  function startOver() {
    clearBirthData();
    clearPartnerData();
    personA = null;
    personB = null;
    editingA = true;
    editingB = true;
    formInitialA = null;
    formInitialB = null;
    formIdA += 1;
    formIdB += 1;
    syncUrl();
    tick().then(() => formElA?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }

  async function copyLink() {
    syncUrl();
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

</script>

<div class="compat-app">
  {#if !ready}
    <div class="loading card" aria-busy="true">
      <span class="loading-spinner" aria-hidden="true"></span>
      Reading the two charts…
    </div>
  {:else}
    <div class="pair-grid">
      <section class="person-panel card" bind:this={formElA} aria-labelledby="person-a-heading">
        <div class="person-head">
          <div>
            <p class="eyebrow">Chart one</p>
            <h2 id="person-a-heading" class="person-title">{personA ? 'You' : 'Your chart'}</h2>
          </div>
          {#if personA && !editingA}
            <button class="btn btn-ghost btn-sm" type="button" onclick={editA}>Edit</button>
          {/if}
        </div>

        {#if personA && !editingA}
          <div class="profile">
            <div class="profile-place">
              <strong>{personA.placeLabel}</strong>
              <span>{personA.localDate} · {personA.localTime}{personA.timeUnknown ? ' (noon)' : ''} · {personA.tzLabel}</span>
            </div>
            <div class="profile-three">
              <span><span class="glyph">☉</span> {chartA!.positions[0]!.sign.name}</span>
              <span><span class="glyph" style="color:#d8d6ef">☽</span> {chartA!.positions[1]!.sign.name}</span>
              <span><span class="glyph" style="color:var(--gold)">{chartA!.ascendant.sign.glyph}</span> {chartA!.ascendant.sign.name} rising</span>
            </div>
            {#if personA.timeUnknown}<span class="profile-warning">Birth time unknown · houses approximate</span>{/if}
            <button class="text-link" type="button" onclick={clearA}>Forget this chart</button>
          </div>
        {:else}
          <p class="panel-note">Enter the birth details for the first person. Saved only in this browser.</p>
          {#key formIdA}
            <BirthForm
              initial={formInitialA}
              idPrefix="person-a"
              submitLabel="Save my chart"
              onCalculate={handleA}
            />
          {/key}
          {#if personA}
            <button class="btn btn-ghost btn-sm cancel-edit" type="button" onclick={() => (editingA = false)}>
              Cancel
            </button>
          {/if}
        {/if}
      </section>

      <section class="person-panel card" bind:this={formElB} aria-labelledby="person-b-heading">
        <div class="person-head">
          <div>
            <p class="eyebrow">Chart two</p>
            <h2 id="person-b-heading" class="person-title">{personB ? 'Partner' : 'Partner’s chart'}</h2>
          </div>
          {#if personB && !editingB}
            <button class="btn btn-ghost btn-sm" type="button" onclick={editB}>Edit</button>
          {/if}
        </div>

        {#if personB && !editingB}
          <div class="profile">
            <div class="profile-place">
              <strong>{personB.placeLabel}</strong>
              <span>{personB.localDate} · {personB.localTime}{personB.timeUnknown ? ' (noon)' : ''} · {personB.tzLabel}</span>
            </div>
            <div class="profile-three">
              <span><span class="glyph">☉</span> {chartB!.positions[0]!.sign.name}</span>
              <span><span class="glyph" style="color:#d8d6ef">☽</span> {chartB!.positions[1]!.sign.name}</span>
              <span><span class="glyph" style="color:var(--gold)">{chartB!.ascendant.sign.glyph}</span> {chartB!.ascendant.sign.name} rising</span>
            </div>
            {#if personB.timeUnknown}<span class="profile-warning">Birth time unknown · houses approximate</span>{/if}
            <button class="text-link" type="button" onclick={clearB}>Forget this chart</button>
          </div>
        {:else}
          <p class="panel-note">Enter the birth details for the second person. Saved only in this browser.</p>
          {#key formIdB}
            <BirthForm
              initial={formInitialB}
              idPrefix="person-b"
              submitLabel="Save partner’s chart"
              onCalculate={handleB}
            />
          {/key}
          {#if personB}
            <button class="btn btn-ghost btn-sm cancel-edit" type="button" onclick={() => (editingB = false)}>
              Cancel
            </button>
          {/if}
        {/if}
      </section>
    </div>

    {#if personA && !personB}
      <p class="waiting-note">One chart down. Add the second chart to see the synastry and Vedic match.</p>
    {:else if !personA && personB}
      <p class="waiting-note">One chart down. Add your chart to compare the two.</p>
    {/if}

    {#if showResults && report && chartA && chartB && personA && personB}
      <div class="results" bind:this={resultEl} tabindex="-1">
        <div class="result-head">
          <div>
            <p class="kicker">Synastry report</p>
            <h2 class="display result-title">How your charts<br /><em class="gold">meet.</em></h2>
            <p class="result-meta">{personA.placeLabel} + {personB.placeLabel}</p>
          </div>
          <div class="result-actions">
            <button class="btn btn-ghost btn-sm" type="button" onclick={copyLink} aria-live="polite">
              {copied ? 'Link copied ✓' : 'Copy share link'}
            </button>
            <button class="btn btn-ghost btn-sm subtle" type="button" onclick={startOver}>Start over</button>
          </div>
        </div>

        {#if report.timeUnknown}
          <p class="time-banner">
            <span aria-hidden="true">☾</span>
            One or both birth times are unknown. Planet-to-planet contacts are still valid; the rising
            sign, houses, and house overlays are approximate.
          </p>
        {/if}
        {#if report.sameChart}
          <p class="same-banner">These two charts look identical. Add a different birth date or time to compare two people.</p>
        {/if}

        <section class="hero card" aria-labelledby="compat-heading">
          <div class="hero-wheel">
            <SynastryWheel {chartA} {chartB} aspects={report.aspects} score={report.overall} label={report.band.label} />
          </div>
          <div class="hero-copy">
            <p class="eyebrow">Compatibility index</p>
            <h2 id="compat-heading" class="display score-title">
              {report.overall}<span>/100</span>
            </h2>
            <p class="band">{report.band.label}</p>
            <p class="hero-summary">{report.summary}</p>
            <div class="category-bars">
              {#each report.categories as category}
                <div class="cat-bar-row" style={`--cat:${category.color}`}>
                  <span class="cat-name"><span class="glyph">{category.glyph}</span> {category.label}</span>
                  <span class="cat-track"><span style={`width:${scorePct(category.score)}`}></span></span>
                  <span class="cat-score">{category.score}</span>
                </div>
              {/each}
            </div>
            <p class="score-note">A symbolic index, not a verdict. Most charts land in the middle; the category detail matters more than the headline number.</p>
          </div>
        </section>

        <section class="category-section" aria-labelledby="categories-heading">
          <div class="block-head">
            <div>
              <p class="kicker">The five lenses</p>
              <h2 id="categories-heading" class="display block-title">Where you meet.</h2>
            </div>
            <p class="block-note">Each score is built from weighted inter-chart aspects. A lower number is an area for conversation, not a failure.</p>
          </div>
          <div class="category-grid">
            {#each report.categories as category}
              <article class="category-card card" style={`--cat:${category.color}`}>
                <div class="category-head">
                  <span class="category-glyph glyph" aria-hidden="true">{category.glyph}</span>
                  <div>
                    <h3>{category.label}</h3>
                    <span class="category-score">{category.score} / 100</span>
                  </div>
                </div>
                <p class="category-blurb">{category.blurb}</p>
                <p class="category-summary">{category.summary}</p>
                {#if category.aspects.length > 0}
                  <div class="category-aspects">
                    {#each category.aspects.slice(0, 2) as aspect}
                      <span class="mini-aspect">{aspect.a.glyph} {aspect.aspect.glyph} {aspect.b.glyph}</span>
                    {/each}
                  </div>
                {/if}
              </article>
            {/each}
          </div>
        </section>

        <section class="aspect-section" aria-labelledby="aspects-heading">
          <div class="block-head">
            <div>
              <p class="kicker">The contacts</p>
              <h2 id="aspects-heading" class="display block-title">The signature aspects.</h2>
            </div>
            <p class="block-note">The strongest inter-chart contacts, with tighter orbs carrying more weight.</p>
          </div>
          <div class="aspect-grid">
            {#each report.aspects.slice(0, 8) as aspect}
              <article class={`aspect-card card tone-${aspect.tone}`}>
                <div class="aspect-head">
                  <span class="aspect-glyphs">
                    <span class="glyph" style={`color:${aspect.a.color}`}>{aspect.a.glyph}</span>
                    <span class="glyph aspect-mark" style={`color:${aspect.aspect.color}`}>{aspect.aspect.glyph}</span>
                    <span class="glyph" style={`color:${aspect.b.color}`}>{aspect.b.glyph}</span>
                  </span>
                  <div>
                    <h3>{aspect.headline}</h3>
                    <span class="aspect-meta">{aspect.orb.toFixed(1)}° orb · {toneLabel(aspect.tone)}</span>
                  </div>
                </div>
                <p>{aspect.body}</p>
                <div class="aspect-tags">
                  {#each aspect.categories.slice(0, 2) as category}
                    <span class="chip">{categoryLabel(category)}</span>
                  {/each}
                </div>
              </article>
            {/each}
          </div>
        </section>

        <section class="split-section" aria-label="Strengths and growth edges">
          <article class="split-card card strengths-card">
            <p class="kicker">Natural support</p>
            <h2 class="serif split-title">What comes easily.</h2>
            {#if report.strengths.length > 0}
              <div class="split-list">
                {#each report.strengths as aspect}
                  <div class="split-item">
                    <span class="split-glyph">{aspect.a.glyph} {aspect.aspect.glyph} {aspect.b.glyph}</span>
                    <div>
                      <strong>{aspect.headline}</strong>
                      <p>{aspect.body}</p>
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <p class="empty-note">No major ease contacts within orb. The connection is not defined by obvious chemistry; look at the whole chart.</p>
            {/if}
          </article>
          <article class="split-card card growth-card">
            <p class="kicker">The work</p>
            <h2 class="serif split-title">Where it grows.</h2>
            {#if report.growth.length > 0}
              <div class="split-list">
                {#each report.growth as aspect}
                  <div class="split-item">
                    <span class="split-glyph">{aspect.a.glyph} {aspect.aspect.glyph} {aspect.b.glyph}</span>
                    <div>
                      <strong>{aspect.headline}</strong>
                      <p>{aspect.body}</p>
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <p class="empty-note">No major friction contacts within orb. The growth edge may be in the house overlays or the quieter parts of the chart.</p>
            {/if}
          </article>
        </section>

        <section class="overlay-section" aria-labelledby="overlays-heading">
          <div class="block-head">
            <div>
              <p class="kicker">House overlays</p>
              <h2 id="overlays-heading" class="display block-title">Where you land in each other’s lives.</h2>
            </div>
            <p class="block-note">Whole-sign houses. These are approximate when a birth time is unknown.</p>
          </div>
          <div class="overlay-grid">
            <article class="overlay-card card">
              <h3>You in their chart</h3>
              {#each report.overlays.filter((overlay) => overlay.side === 'a-in-b') as overlay (overlay.id)}
                <div class="overlay-item">
                  <span class="glyph" aria-hidden="true">{overlay.glyph}</span>
                  <p>{overlay.text}</p>
                </div>
              {:else}
                <p class="empty-note">No personal planets in the key relationship houses.</p>
              {/each}
            </article>
            <article class="overlay-card card">
              <h3>Partner in your chart</h3>
              {#each report.overlays.filter((overlay) => overlay.side === 'b-in-a') as overlay (overlay.id)}
                <div class="overlay-item">
                  <span class="glyph" aria-hidden="true">{overlay.glyph}</span>
                  <p>{overlay.text}</p>
                </div>
              {:else}
                <p class="empty-note">No personal planets in the key relationship houses.</p>
              {/each}
            </article>
          </div>
        </section>

        <section class="prompt-card card">
          <p class="kicker">Talk about it</p>
          <h2 class="serif split-title">Questions for the two of you.</h2>
          <div class="prompt-list">
            {#each report.prompts as prompt}
              <p>{prompt}</p>
            {/each}
            <p>What do you each need to feel safe enough to tell the truth?</p>
          </div>
        </section>

        <VedicMatch
          {chartA}
          {chartB}
          dateA={personA.date}
          dateB={personB.date}
          timeUnknown={personA.timeUnknown || personB.timeUnknown}
        />

        <section class="method-note card">
          <div>
            <p class="kicker">How to read this</p>
            <h2 class="serif split-title">Read it like a conversation.</h2>
          </div>
          <div>
            <p>
              Synastry compares two tropical charts: the Sun, Moon, planets, Node, Ascendant, and
              Midheaven by major aspect. Stronger contacts carry more weight, and the five category
              scores are a symbolic index — not a scientific prediction or a reason to stay or leave.
            </p>
            <p>
              The Vedic Ashtakoot layer above uses Lahiri sidereal Moon nakshatras and the traditional
              36-point system; it is a separate framework from the Western synastry. Read both as
              prompts for conversation, not as a decision made for you.
            </p>
            <div class="method-actions">
              <a class="btn btn-ghost btn-sm" href={href('/chart/')}>Open a birth chart</a>
              <a class="btn btn-ghost btn-sm" href={href('/learn/#method')}>Our method</a>
              <button class="btn btn-ghost btn-sm subtle" type="button" onclick={startOver}>Forget both charts</button>
            </div>
          </div>
        </section>
      </div>
    {/if}
  {/if}
</div>

<style>
  .compat-app {
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
  }

  .loading {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 1.4rem;
    font-size: 0.85rem;
    color: var(--muted);
  }

  .loading-spinner {
    width: 18px;
    height: 18px;
    border: 1.5px solid var(--line);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: spin 0.9s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .pair-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
    align-items: start;
  }

  .person-panel {
    padding: clamp(1rem, 2.4vw, 1.5rem);
    background:
      radial-gradient(400px 180px at 90% 0%, var(--gold-tint), transparent 70%),
      var(--card-bg);
  }

  .person-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.8rem;
    margin-bottom: 0.8rem;
  }

  .person-title {
    margin-top: 0.25rem;
    font-family: var(--font-serif);
    font-size: 1.65rem;
    font-weight: 400;
    line-height: 1;
  }

  .panel-note {
    margin-bottom: 0.9rem;
    font-size: 0.7rem;
    line-height: 1.5;
    color: var(--faint);
  }

  .cancel-edit {
    margin-top: 0.6rem;
  }

  .profile {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .profile-place {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .profile-place strong {
    font-size: 0.9rem;
    font-weight: 500;
  }

  .profile-place span {
    font-size: 0.68rem;
    color: var(--faint);
  }

  .profile-three {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    padding-top: 0.7rem;
    border-top: 1px solid var(--line-soft);
    font-size: 0.7rem;
    color: var(--muted);
  }

  .profile-three .glyph {
    margin-right: 0.15rem;
  }

  .profile-warning {
    font-size: 0.66rem;
    color: var(--rose);
  }

  .text-link {
    border: 0;
    background: none;
    padding: 0;
    font-size: 0.68rem;
    color: var(--faint);
    text-align: left;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .text-link:hover {
    color: var(--gold);
  }

  .waiting-note {
    padding: 0.75rem 0.9rem;
    border: 1px dashed var(--line);
    border-radius: 12px;
    font-size: 0.72rem;
    color: var(--faint);
  }

  .results {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    outline: none;
    scroll-margin-top: 100px;
  }

  .result-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 1.5rem;
  }

  .result-title {
    margin-top: 0.5rem;
    font-size: clamp(2rem, 4.5vw, 3.6rem);
    line-height: 0.96;
  }

  .result-meta {
    margin-top: 0.6rem;
    font-size: 0.7rem;
    color: var(--faint);
  }

  .result-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .subtle {
    color: var(--faint);
  }

  .time-banner,
  .same-banner {
    padding: 0.7rem 0.9rem;
    border: 1px solid var(--gold-line);
    border-radius: 12px;
    background: var(--gold-tint);
    font-size: 0.7rem;
    line-height: 1.55;
    color: var(--muted);
  }

  .time-banner {
    display: flex;
    gap: 0.45rem;
    align-items: baseline;
  }

  .time-banner span {
    color: var(--gold);
  }

  .same-banner {
    border-color: color-mix(in srgb, var(--rose) 35%, transparent);
    background: color-mix(in srgb, var(--rose) 7%, transparent);
    color: var(--rose);
  }

  .hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr);
    gap: 1rem 2rem;
    align-items: center;
    padding: clamp(1.1rem, 2.6vw, 1.5rem);
    background:
      radial-gradient(500px 240px at 10% 10%, var(--gold-tint), transparent 65%),
      radial-gradient(500px 260px at 90% 100%, var(--glow-violet), transparent 70%),
      var(--card-bg);
  }

  .hero-wheel {
    min-width: 0;
  }

  .hero-copy {
    min-width: 0;
  }

  .score-title {
    margin-top: 0.2rem;
    font-size: clamp(4rem, 8vw, 6.4rem);
    line-height: 0.85;
    color: var(--gold-bright);
  }

  .score-title span {
    margin-left: 0.3rem;
    font-family: var(--font-sans);
    font-size: 0.9rem;
    letter-spacing: 0.04em;
    color: var(--faint);
  }

  .band {
    margin-top: 0.3rem;
    font-family: var(--font-serif);
    font-size: 1.35rem;
    color: var(--gold);
  }

  .hero-summary {
    margin-top: 0.7rem;
    font-size: 0.8rem;
    line-height: 1.65;
    color: var(--muted);
  }

  .category-bars {
    display: flex;
    flex-direction: column;
    gap: 0.38rem;
    margin-top: 1rem;
  }

  .cat-bar-row {
    display: grid;
    grid-template-columns: 8.2rem minmax(0, 1fr) 1.5rem;
    gap: 0.5rem;
    align-items: center;
  }

  .cat-name {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.62rem;
    color: var(--faint);
    white-space: nowrap;
  }

  .cat-name .glyph {
    color: var(--cat);
    font-size: 0.7rem;
  }

  .cat-track {
    height: 3px;
    border-radius: 99px;
    background: var(--surface-strong);
    overflow: hidden;
  }

  .cat-track span {
    display: block;
    height: 100%;
    border-radius: 99px;
    background: var(--cat);
    filter: saturate(0.9);
  }

  .cat-score {
    font-size: 0.62rem;
    color: var(--muted);
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .score-note {
    margin-top: 0.75rem;
    font-size: 0.62rem;
    color: var(--faint);
  }

  .block-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 2rem;
  }

  .block-title {
    margin-top: 0.35rem;
    font-size: clamp(1.8rem, 3.5vw, 2.8rem);
    line-height: 1;
  }

  .block-note {
    max-width: 44ch;
    text-align: right;
    font-size: 0.7rem;
    line-height: 1.55;
    color: var(--faint);
  }

  .category-section,
  .aspect-section,
  .overlay-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .category-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.7rem;
  }

  .category-card {
    padding: 1rem;
    border-top: 1px solid color-mix(in srgb, var(--cat) 45%, transparent);
  }

  .category-head {
    display: flex;
    align-items: center;
    gap: 0.55rem;
  }

  .category-glyph {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    border-radius: 50%;
    color: var(--cat);
    background: color-mix(in srgb, var(--cat) 9%, transparent);
    border: 1px solid color-mix(in srgb, var(--cat) 24%, transparent);
    font-size: 0.95rem;
  }

  .category-head h3 {
    font-size: 0.8rem;
    font-weight: 500;
  }

  .category-score {
    font-size: 0.58rem;
    color: var(--faint);
  }

  .category-blurb {
    margin-top: 0.65rem;
    font-size: 0.68rem;
    line-height: 1.5;
    color: var(--faint);
  }

  .category-summary {
    margin-top: 0.55rem;
    font-size: 0.72rem;
    line-height: 1.55;
    color: var(--muted);
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .category-aspects {
    display: flex;
    gap: 0.3rem;
    margin-top: 0.6rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--line-soft);
  }

  .mini-aspect {
    padding: 0.18rem 0.35rem;
    border: 1px solid var(--line-soft);
    border-radius: 999px;
    font-size: 0.64rem;
    background: var(--surface);
  }

  .aspect-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.7rem;
  }

  .aspect-card {
    padding: 1rem;
    border-left: 2px solid transparent;
  }

  .aspect-card.tone-ease {
    border-left-color: color-mix(in srgb, var(--green) 55%, transparent);
  }

  .aspect-card.tone-friction {
    border-left-color: color-mix(in srgb, var(--rose) 55%, transparent);
  }

  .aspect-card.tone-intense {
    border-left-color: var(--gold-line);
  }

  .aspect-head {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .aspect-glyphs {
    display: inline-flex;
    align-items: center;
    gap: 0.1rem;
    font-size: 1rem;
    flex-shrink: 0;
  }

  .aspect-mark {
    font-size: 0.78rem;
  }

  .aspect-head h3 {
    font-size: 0.78rem;
    font-weight: 500;
  }

  .aspect-meta {
    font-size: 0.58rem;
    color: var(--faint);
  }

  .aspect-card > p {
    margin-top: 0.6rem;
    font-size: 0.72rem;
    line-height: 1.6;
    color: var(--muted);
  }

  .aspect-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin-top: 0.55rem;
  }

  .aspect-tags .chip {
    font-size: 0.55rem;
    padding: 0.2rem 0.45rem;
  }

  .split-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
    align-items: start;
  }

  .split-card {
    padding: 1.2rem;
  }

  .split-title {
    margin-top: 0.35rem;
    font-size: 1.6rem;
    line-height: 1;
  }

  .split-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    margin-top: 1rem;
  }

  .split-item {
    display: flex;
    gap: 0.6rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--line-soft);
  }

  .split-item:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }

  .split-glyph {
    flex-shrink: 0;
    font-size: 0.72rem;
    color: var(--gold);
    padding-top: 0.1rem;
  }

  .split-item strong {
    font-size: 0.74rem;
    font-weight: 500;
  }

  .split-item p {
    margin-top: 0.2rem;
    font-size: 0.67rem;
    line-height: 1.5;
    color: var(--faint);
  }

  .overlay-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
  }

  .overlay-card {
    padding: 1.1rem;
  }

  .overlay-card h3 {
    font-family: var(--font-serif);
    font-size: 1.25rem;
    font-weight: 400;
  }

  .overlay-item {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
    margin-top: 0.65rem;
  }

  .overlay-item .glyph {
    color: var(--gold);
    font-size: 0.75rem;
    padding-top: 0.1rem;
    flex-shrink: 0;
  }

  .overlay-item p {
    font-size: 0.68rem;
    line-height: 1.5;
    color: var(--muted);
  }

  .prompt-card {
    padding: 1.2rem;
    background:
      radial-gradient(500px 200px at 80% 0%, var(--gold-tint), transparent 70%),
      var(--card-bg);
  }

  .prompt-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem 1.2rem;
    margin-top: 0.8rem;
  }

  .prompt-list p {
    position: relative;
    padding-left: 1rem;
    font-size: 0.72rem;
    line-height: 1.55;
    color: var(--muted);
  }

  .prompt-list p::before {
    content: '✦';
    position: absolute;
    left: 0;
    top: 0.05rem;
    color: var(--gold);
    font-size: 0.55rem;
  }

  .method-note {
    display: grid;
    grid-template-columns: minmax(0, 0.7fr) minmax(0, 1.3fr);
    gap: 2rem;
    padding: clamp(1.2rem, 3vw, 1.8rem);
    background: var(--surface);
  }

  .method-note p {
    font-size: 0.72rem;
    line-height: 1.65;
    color: var(--muted);
  }

  .method-note p + p {
    margin-top: 0.5rem;
  }

  .method-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.8rem;
  }

  .empty-note {
    margin-top: 0.6rem;
    font-size: 0.7rem;
    line-height: 1.55;
    color: var(--faint);
  }

  @media (max-width: 1050px) {
    .pair-grid {
      grid-template-columns: 1fr;
    }
    .hero {
      grid-template-columns: 1fr;
    }
    .hero-wheel {
      max-width: 480px;
      margin-inline: auto;
    }
    .category-grid {
      grid-template-columns: 1fr 1fr;
    }
    .split-section,
    .overlay-grid {
      grid-template-columns: 1fr;
    }
    .method-note {
      grid-template-columns: 1fr;
      gap: 0.7rem;
    }
  }

  @media (max-width: 760px) {
    .result-head,
    .block-head {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.7rem;
    }
    .block-note {
      text-align: left;
    }
    .aspect-grid,
    .category-grid,
    .prompt-list {
      grid-template-columns: 1fr;
    }
    .result-actions {
      width: 100%;
    }
    .result-actions .btn {
      flex: 1;
      justify-content: center;
    }
    .category-bars {
      margin-top: 0.7rem;
    }
  }

  @media (max-width: 480px) {
    .cat-bar-row {
      grid-template-columns: 7.2rem minmax(0, 1fr) 1.3rem;
    }
    .hero {
      padding: 0.9rem;
    }
  }
</style>
