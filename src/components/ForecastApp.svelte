<script lang="ts">
  import { onMount, tick } from 'svelte';
  import BirthForm from './BirthForm.svelte';
  import MoonPhase from './MoonPhase.svelte';
  import { computeChart } from '../lib/astrology';
  import { buildForecast, type ForecastRange, type TransitAspect } from '../lib/transits';
  import { EVENT_KIND_LABELS } from '../data/transits';
  import { clearBirthData, loadBirthData, saveBirthData } from '../lib/storage';
  import { initialFromSearch, resolveBirth, searchFromBirth } from '../lib/birth';
  import { href } from '../lib/url';
  import type { BirthData, BirthInitial } from '../lib/types';

  let now = $state(new Date());
  let data = $state<BirthData | null>(null);
  let initial = $state<BirthInitial | null>(null);
  let ready = $state(false);
  let editing = $state(false);
  let range = $state<ForecastRange>(1);
  let formInitial = $state<BirthInitial | null>(null);
  let formId = $state(0);
  let resultEl = $state<HTMLElement | null>(null);
  let formEl = $state<HTMLElement | null>(null);

  onMount(() => {
    const parsed = initialFromSearch(window.location.search);
    if (parsed) {
      const resolved = resolveBirth(parsed);
      if (resolved) {
        initial = parsed;
        data = resolved;
        saveBirthData(resolved);
        formInitial = parsed;
      }
    }
    if (!data) {
      const saved = loadBirthData();
      if (saved) data = saved;
    }
    ready = true;
    const timer = setInterval(() => (now = new Date()), 5 * 60_000);
    return () => clearInterval(timer);
  });

  const chart = $derived(
    data
      ? computeChart({
          date: data.date,
          latitude: data.latitude,
          longitude: data.longitude,
        })
      : null,
  );

  const forecast = $derived(chart ? buildForecast(chart, now, range) : null);

  const activeAspects = $derived(
    forecast?.aspects.filter((aspect) => !aspect.upcoming) ?? [],
  );
  const upcomingAspects = $derived(
    forecast?.aspects.filter((aspect) => aspect.upcoming) ?? [],
  );

  const fullChartHref = $derived(
    data ? `${href('/chart/')}?${searchFromBirth(data, 'whole')}` : href('/chart/'),
  );

  const rangeLabel = $derived(range === 1 ? 'Today' : range === 7 ? 'This week' : 'This month');

  const dateLabel = $derived(
    new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(now),
  );

  const timeLabel = $derived(
    new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(now),
  );

  const shortDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);

  const eventDate = (date: Date) => {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const diff = Math.round((target - today) / 86_400_000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff > 1 && diff < 7) return `In ${diff} days`;
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
  };

  const exactLabel = (aspect: TransitAspect) => {
    if (!aspect.exactDate) return 'Active now';
    return `${aspect.applying ? 'Exact' : 'Next exact'} ${shortDate(aspect.exactDate)}`;
  };

  const signalBars = (signal: number) => Math.ceil(signal / 20);

  async function handleCalculate(input: BirthData) {
    data = input;
    saveBirthData(input);
    editing = false;
    range = 1;
    formInitial = initialFromSearch(`?${searchFromBirth(input, 'whole')}`);
    try {
      history.replaceState(null, '', `${window.location.pathname}?${searchFromBirth(input, 'whole')}`);
    } catch {
      /* ignore */
    }
    await tick();
    resultEl?.focus({ preventScroll: true });
    if (window.innerWidth < 900) resultEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function openEditor() {
    if (data) formInitial = initialFromSearch(`?${searchFromBirth(data, 'whole')}`);
    else formInitial = initial;
    formId += 1;
    editing = true;
    tick().then(() => {
      formEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      formEl?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });
    });
  }

  function forgetChart() {
    clearBirthData();
    data = null;
    editing = false;
    formInitial = null;
    formId += 1;
    try {
      history.replaceState(null, '', window.location.pathname);
    } catch {
      /* ignore */
    }
    tick().then(() => formEl?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }
</script>

<div class="forecast-app">
  {#if !ready}
    <div class="loading card" aria-busy="true">
      <span class="loading-spinner" aria-hidden="true"></span>
      Reading your chart…
    </div>
  {:else if !data}
    <div class="onboard">
      <div class="form-panel card" bind:this={formEl}>
        <p class="eyebrow">Your birth chart</p>
        <h2 class="display onboard-title">Start with the chart<br /><em class="gold">you were born with.</em></h2>
        <p class="onboard-copy">
          Enter your birth details once. Astra compares the sky right now to your natal chart, then
          translates the transits into daily, weekly, and monthly guidance.
        </p>
        {#key formId}
          <BirthForm
            initial={formInitial}
            submitLabel="Calculate my forecast"
            onCalculate={handleCalculate}
          />
        {/key}
        <p class="local-note">
          <span aria-hidden="true">✦</span>
          Saved only in this browser. No account, no server, no newsletter.
        </p>
      </div>

      <aside class="onboard-side">
        <p class="kicker">What you get</p>
        <div class="benefit-list">
          <div class="benefit">
            <span class="benefit-glyph glyph" aria-hidden="true">☽</span>
            <div>
              <h3>Your weather today</h3>
              <p>A real transit reading for your chart — not a generic sun-sign horoscope.</p>
            </div>
          </div>
          <div class="benefit">
            <span class="benefit-glyph glyph" aria-hidden="true">♀</span>
            <div>
              <h3>Life-area guidance</h3>
              <p>Love, work, mind, wellbeing, and growth, each with its own weather and next step.</p>
            </div>
          </div>
          <div class="benefit">
            <span class="benefit-glyph glyph" aria-hidden="true">△</span>
            <div>
              <h3>The exact timing</h3>
              <p>See which transits are applying, separating, or building toward a peak date.</p>
            </div>
          </div>
          <div class="benefit">
            <span class="benefit-glyph glyph" aria-hidden="true">✦</span>
            <div>
              <h3>A prompt, not a verdict</h3>
              <p>Use the forecast to reflect and choose. Nothing here is fixed fate.</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  {:else if editing}
    <div class="edit-panel card" bind:this={formEl}>
      <div class="edit-head">
        <div>
          <p class="eyebrow">Edit birth data</p>
          <h2 class="h3">Keep the same chart, or start again.</h2>
        </div>
        <button class="btn btn-ghost btn-sm" type="button" onclick={() => (editing = false)}>
          Cancel
        </button>
      </div>
      {#key formId}
        <BirthForm
          initial={formInitial}
          submitLabel="Update my forecast"
          onCalculate={handleCalculate}
        />
      {/key}
    </div>
  {:else if forecast && chart && data}
    <div class="results" bind:this={resultEl} tabindex="-1">
      <div class="chart-strip card">
        <div class="strip-id">
          <span class="strip-mark glyph" aria-hidden="true">✦</span>
          <div>
            <span class="strip-label">Forecast for</span>
            <strong>{data.placeLabel}</strong>
            <span class="strip-meta">
              {data.localDate} · {data.localTime}{data.timeUnknown ? ' (noon)' : ''} · {data.tzLabel}
              <span aria-hidden="true"> · </span>
              Sun {chart.positions[0]!.sign.glyph} · Moon {chart.positions[1]!.sign.glyph} · Rising {chart.ascendant.sign.glyph}
            </span>
          </div>
        </div>
        <div class="strip-actions">
          <button class="btn btn-ghost btn-sm" type="button" onclick={openEditor}>Edit</button>
          <a class="btn btn-ghost btn-sm" href={fullChartHref}>Full chart <span class="arrow">↗</span></a>
          <button class="btn btn-ghost btn-sm subtle" type="button" onclick={forgetChart}>Forget</button>
        </div>
      </div>

      {#if data.timeUnknown}
        <p class="time-note">
          <span aria-hidden="true">☾</span>
          Birth time is unknown. Houses and the rising sign are approximate; the planet-to-planet
          transits are still calculated from your birth date and place.
        </p>
      {/if}

      <div class="range-row">
        <div>
          <p class="kicker">Your forecast</p>
          <p class="range-date">{dateLabel} · refreshed {timeLabel}</p>
        </div>
        <div class="segmented" role="group" aria-label="Forecast range">
          <button type="button" aria-pressed={range === 1} onclick={() => (range = 1)}>Today</button>
          <button type="button" aria-pressed={range === 7} onclick={() => (range = 7)}>This week</button>
          <button type="button" aria-pressed={range === 30} onclick={() => (range = 30)}>This month</button>
        </div>
      </div>

      <section class="forecast-hero card" aria-live="polite">
        <div class="hero-main">
          <p class="eyebrow">{rangeLabel} · {forecast.moon.phase.name} in {forecast.moonSign.name}</p>
          <h2 class="display hero-title">{forecast.headline}</h2>
          <p class="hero-summary">{forecast.summary}</p>
          <div class="hero-chips">
            <span class="chip">{forecast.moon.illumination.toFixed(0)}% moon lit</span>
            <span class="chip">{forecast.moonSign.glyph} Moon in {forecast.moonSign.name}</span>
            {#each forecast.retrogrades as planet (planet.key)}
              <span class="chip chip-retro">{planet.glyph} {planet.name} ℞</span>
            {/each}
          </div>
        </div>
        <div class="hero-moon">
          <MoonPhase elongation={forecast.moon.elongation} size={150} />
          <p class="moon-phase-name">{forecast.moon.phase.name}</p>
          <p class="moon-phase-meta">
            {forecast.moon.ageDays.toFixed(1)} days into the cycle<br />
            Next new {forecast.moon.nextNew ? shortDate(forecast.moon.nextNew) : '—'} · full {forecast.moon.nextFull ? shortDate(forecast.moon.nextFull) : '—'}
          </p>
        </div>
      </section>

      <section class="focus-grid" aria-label="Today's focus">
        <article class="focus-card card do-card">
          <span class="focus-label">Lean into</span>
          <p>{forecast.doThis}</p>
        </article>
        <article class="focus-card card release-card">
          <span class="focus-label">Release</span>
          <p>{forecast.releaseThis}</p>
        </article>
        <article class="focus-card card prompt-card">
          <span class="focus-label">Sit with</span>
          <p>{forecast.journal}</p>
        </article>
      </section>

      <section class="area-section" aria-labelledby="areas-heading">
        <div class="block-head">
          <div>
            <p class="kicker">By life area</p>
            <h2 id="areas-heading" class="display block-title">Where the energy is.</h2>
          </div>
          <p class="block-note">
            These are areas of emphasis, not “good” or “bad” scores. A quiet area is space, not a
            failure.
          </p>
        </div>

        <div class="area-grid">
          {#each forecast.lifeAreas as area (area.key)}
            <article class="area-card card" style={`--area:${area.color}`}>
              <div class="area-head">
                <span class="area-glyph glyph" aria-hidden="true">{area.glyph}</span>
                <span class={`weather-chip weather-${area.weather}`}>{area.weatherLabel}</span>
              </div>
              <h3>{area.label}</h3>
              <div class="signal" role="img" aria-label={`${area.signal} percent emphasis`}>
                <span class="signal-track"><span class="signal-fill" style={`width:${area.signal}%`}></span></span>
                <span class="signal-bars" aria-hidden="true">
                  {#each [1, 2, 3, 4, 5] as bar}
                    <span class:on={bar <= signalBars(area.signal)}></span>
                  {/each}
                </span>
              </div>
              <p class="area-summary">{area.summary}</p>
              {#if area.aspects.length > 0}
                <div class="area-aspects" aria-label="Supporting transits">
                  {#each area.aspects.slice(0, 2) as aspect}
                    <span class="mini-aspect" title={aspect.headline}>
                      <span class="glyph" style={`color:${aspect.transit.color}`}>{aspect.transit.glyph}</span>
                      <span class="glyph" style={`color:${aspect.aspect.color}`}>{aspect.aspect.glyph}</span>
                      <span class="glyph" style={`color:${aspect.natal.color}`}>{aspect.natal.glyph}</span>
                    </span>
                  {/each}
                </div>
              {/if}
            </article>
          {/each}
        </div>
      </section>

      <section class="transit-section" aria-labelledby="transits-heading">
        <div class="block-head">
          <div>
            <p class="kicker">The mechanics</p>
            <h2 id="transits-heading" class="display block-title">The transits behind it.</h2>
          </div>
          <p class="block-note">
            Active aspects use tighter orbs. “Building” aspects are peaking within your selected
            window. Tap a row for the full reading.
          </p>
        </div>

        <div class="transit-columns">
          <div class="transit-column">
            <div class="transit-column-head">
              <h3>Active now</h3>
              <span>{activeAspects.length}</span>
            </div>
            {#if activeAspects.length > 0}
              <div class="transit-list">
                {#each activeAspects as aspect (aspect.id)}
                  <details class="transit-row">
                    <summary>
                      <span class="transit-glyphs" style={`--tc:${aspect.transit.color};--ac:${aspect.aspect.color};--nc:${aspect.natal.color}`}>
                        <span class="glyph">{aspect.transit.glyph}</span>
                        <span class="glyph aspect-mark">{aspect.aspect.glyph}</span>
                        <span class="glyph">{aspect.natal.glyph}</span>
                      </span>
                      <span class="transit-main">
                        <span class="transit-title">{aspect.headline}</span>
                        <span class="transit-meta">
                          {aspect.orb.toFixed(1)}° orb · {aspect.houseInfo.title}
                          {#if aspect.retrograde}· ℞{/if}
                        </span>
                      </span>
                      <span class="transit-when">{exactLabel(aspect)}</span>
                      <span class="transit-plus" aria-hidden="true"></span>
                    </summary>
                    <div class="transit-body">
                      <p>{aspect.body}</p>
                      <div class="transit-body-foot">
                        <span class="chip">{aspect.applying ? 'Applying' : 'Separating'}</span>
                        <span class="chip">{aspect.natal.sign.glyph} natal {aspect.natal.name} {aspect.natal.degreeText}</span>
                        <span class="chip">House {aspect.houseInfo.number}</span>
                      </div>
                    </div>
                  </details>
                {/each}
              </div>
            {:else}
              <p class="empty-note">
                No tight transit is active right now. The forecast still uses the Moon phase and the
                slower cycles below.
              </p>
            {/if}
          </div>

          <div class="transit-column">
            <div class="transit-column-head">
              <h3>Building</h3>
              <span>{upcomingAspects.length}</span>
            </div>
            {#if upcomingAspects.length > 0}
              <div class="transit-list">
                {#each upcomingAspects as aspect (aspect.id)}
                  <details class="transit-row upcoming">
                    <summary>
                      <span class="transit-glyphs" style={`--tc:${aspect.transit.color};--ac:${aspect.aspect.color};--nc:${aspect.natal.color}`}>
                        <span class="glyph">{aspect.transit.glyph}</span>
                        <span class="glyph aspect-mark">{aspect.aspect.glyph}</span>
                        <span class="glyph">{aspect.natal.glyph}</span>
                      </span>
                      <span class="transit-main">
                        <span class="transit-title">{aspect.headline}</span>
                        <span class="transit-meta">
                          {aspect.orb.toFixed(1)}° orb · peak {aspect.exactDate ? shortDate(aspect.exactDate) : '—'}
                        </span>
                      </span>
                      <span class="transit-when">{aspect.exactDate ? eventDate(aspect.exactDate) : 'Upcoming'}</span>
                      <span class="transit-plus" aria-hidden="true"></span>
                    </summary>
                    <div class="transit-body">
                      <p>{aspect.body}</p>
                      <div class="transit-body-foot">
                        <span class="chip">Building</span>
                        <span class="chip">{aspect.houseInfo.title}</span>
                      </div>
                    </div>
                  </details>
                {/each}
              </div>
            {:else}
              <p class="empty-note">
                Nothing new is becoming exact in this window. Work with what is already active.
              </p>
            {/if}
          </div>
        </div>
      </section>

      <section class="timeline-section" aria-labelledby="timeline-heading">
        <div class="block-head">
          <div>
            <p class="kicker">Timing</p>
            <h2 id="timeline-heading" class="display block-title">The dates to watch.</h2>
          </div>
          <p class="block-note">
            Exact aspects, stations, ingresses, and moon phases in the selected window. Dates are
            local to your device.
          </p>
        </div>

        {#if forecast.timeline.length > 0}
          <ol class="timeline">
            {#each forecast.timeline as event (event.id)}
              <li class="timeline-item" style={`--event:${event.color}`}>
                <span class="timeline-dot" aria-hidden="true"></span>
                <span class="timeline-date">{eventDate(event.date)}</span>
                <div class="timeline-card card">
                  <span class="timeline-glyph glyph" aria-hidden="true">{event.glyph}</span>
                  <div>
                    <h3>{event.title}</h3>
                    <p>{event.detail}</p>
                  </div>
                  <span class="timeline-kind">{EVENT_KIND_LABELS[event.kind]}</span>
                </div>
              </li>
            {/each}
          </ol>
        {:else}
          <p class="empty-note timeline-empty">
            No exact hits in this window. That is a quiet sky, not a closed door.
          </p>
        {/if}
      </section>

      <section class="method-note card">
        <div>
          <p class="kicker">How to use this</p>
          <h2 class="serif method-title">Weather, not fate.</h2>
        </div>
        <div class="method-copy">
          <p>
            Astra compares the <strong>transiting planets now</strong> to the planets in your natal
            chart. Aspects use tighter transit orbs than the natal chart, and applying aspects are
            weighted slightly higher. House themes use the whole-sign rising sign by default.
          </p>
          <p>
            This is a symbolic timing tool, not a promise of events. If a reading does not fit, leave
            it. Use what helps you make a more conscious choice. Read the full
            <a href={href('/learn/#method')}>methodology</a>.
          </p>
          <div class="method-actions">
            <a class="btn btn-ghost btn-sm" href={fullChartHref}>Open the full chart</a>
            <a class="btn btn-ghost btn-sm" href={href('/learn/')}>Learn the language</a>
            <button class="btn btn-ghost btn-sm subtle" type="button" onclick={forgetChart}>
              Forget my chart
            </button>
          </div>
          <p class="local-note">
            <span aria-hidden="true">✦</span> Your chart is saved only in this browser. Use “Forget”
            to remove it.
          </p>
        </div>
      </section>
    </div>
  {/if}
</div>

<style>
  .forecast-app {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
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

  .onboard {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
    gap: 1.2rem;
    align-items: start;
  }

  .form-panel {
    padding: clamp(1.2rem, 3vw, 2rem);
    background:
      radial-gradient(500px 200px at 85% 0%, var(--gold-tint), transparent 70%),
      var(--card-bg);
  }

  .onboard-title {
    margin-top: 0.7rem;
    font-size: clamp(2rem, 4vw, 3.2rem);
    line-height: 0.98;
  }

  .onboard-copy {
    margin-top: 0.8rem;
    max-width: 52ch;
    font-size: 0.88rem;
    line-height: 1.65;
    color: var(--muted);
  }

  .form-panel :global(.birth-form) {
    margin-top: 1.3rem;
  }

  .local-note {
    display: flex;
    gap: 0.45rem;
    align-items: baseline;
    margin-top: 1rem;
    font-size: 0.7rem;
    line-height: 1.5;
    color: var(--faint);
  }

  .local-note span {
    color: var(--gold);
  }

  .onboard-side {
    padding: 1.4rem 0.2rem;
  }

  .benefit-list {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
    margin-top: 1.2rem;
  }

  .benefit {
    display: flex;
    gap: 0.8rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--line-soft);
  }

  .benefit:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }

  .benefit-glyph {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border: 1px solid var(--line);
    border-radius: 50%;
    color: var(--gold);
    background: var(--surface);
    font-size: 0.95rem;
  }

  .benefit h3 {
    font-size: 0.88rem;
    font-weight: 500;
    color: var(--ink);
  }

  .benefit p {
    margin-top: 0.25rem;
    font-size: 0.76rem;
    line-height: 1.55;
    color: var(--faint);
  }

  .edit-panel {
    padding: clamp(1.2rem, 3vw, 2rem);
  }

  .edit-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 1rem;
    margin-bottom: 1.2rem;
  }

  .edit-head .h3 {
    margin-top: 0.35rem;
  }

  .results {
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
    outline: none;
    scroll-margin-top: 100px;
  }

  .chart-strip {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.2rem;
    padding: 0.85rem 1rem;
  }

  .strip-id {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
  }

  .strip-mark {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border-radius: 50%;
    color: var(--gold);
    background: var(--gold-tint);
    border: 1px solid var(--gold-line);
    font-size: 0.9rem;
  }

  .strip-id > div {
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.35;
  }

  .strip-label {
    font-size: 0.55rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--faint);
  }

  .strip-id strong {
    font-size: 0.82rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .strip-meta {
    font-size: 0.67rem;
    color: var(--faint);
  }

  .strip-actions {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .strip-actions .subtle {
    color: var(--faint);
  }

  .time-note {
    display: flex;
    gap: 0.5rem;
    align-items: baseline;
    padding: 0.7rem 0.9rem;
    border: 1px solid var(--gold-line);
    border-radius: 12px;
    background: var(--gold-tint);
    font-size: 0.72rem;
    line-height: 1.55;
    color: var(--muted);
  }

  .time-note span {
    color: var(--gold);
  }

  .range-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .range-date {
    margin-top: 0.25rem;
    font-size: 0.7rem;
    color: var(--faint);
  }

  .forecast-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.75fr);
    gap: clamp(1.2rem, 3vw, 2.5rem);
    padding: clamp(1.3rem, 3vw, 2rem);
    background:
      radial-gradient(600px 260px at 90% 10%, var(--gold-tint), transparent 65%),
      radial-gradient(500px 260px at 10% 100%, var(--glow-violet), transparent 70%),
      var(--card-bg);
  }

  .hero-title {
    margin-top: 0.55rem;
    font-size: clamp(2rem, 4.5vw, 3.8rem);
    line-height: 0.96;
    max-width: 20ch;
  }

  .hero-summary {
    margin-top: 0.9rem;
    max-width: 66ch;
    font-size: 0.9rem;
    line-height: 1.7;
    color: var(--muted);
  }

  .hero-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 1rem;
  }

  .chip-retro {
    border-color: color-mix(in srgb, var(--rose) 35%, transparent);
    background: color-mix(in srgb, var(--rose) 8%, transparent);
    color: var(--rose);
  }

  .hero-moon {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    border-left: 1px solid var(--line-soft);
    padding-left: clamp(1rem, 3vw, 2rem);
  }

  .moon-phase-name {
    margin-top: 0.4rem;
    font-family: var(--font-serif);
    font-size: 1.35rem;
  }

  .moon-phase-meta {
    margin-top: 0.25rem;
    font-size: 0.65rem;
    line-height: 1.55;
    color: var(--faint);
  }

  .focus-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1.2fr;
    gap: 0.7rem;
  }

  .focus-card {
    padding: 1rem 1.1rem;
    border-left: 2px solid var(--line);
  }

  .do-card {
    border-left-color: var(--gold-line);
  }

  .release-card {
    border-left-color: color-mix(in srgb, var(--rose) 45%, transparent);
  }

  .prompt-card {
    border-left-color: color-mix(in srgb, var(--violet) 45%, transparent);
  }

  .focus-label {
    font-size: 0.55rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--faint);
  }

  .focus-card p {
    margin-top: 0.35rem;
    font-family: var(--font-serif);
    font-size: 0.98rem;
    line-height: 1.4;
    color: var(--ink);
  }

  .area-section,
  .transit-section,
  .timeline-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .block-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 2rem;
  }

  .block-title {
    margin-top: 0.4rem;
    font-size: clamp(1.7rem, 3.3vw, 2.7rem);
    line-height: 1;
  }

  .block-note {
    max-width: 46ch;
    text-align: right;
    font-size: 0.72rem;
    line-height: 1.55;
    color: var(--faint);
  }

  .area-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.7rem;
  }

  .area-card {
    padding: 1.1rem;
    border-top: 1px solid color-mix(in srgb, var(--area) 45%, transparent);
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  .area-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .area-glyph {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    color: var(--area);
    background: color-mix(in srgb, var(--area) 9%, transparent);
    border: 1px solid color-mix(in srgb, var(--area) 24%, transparent);
    font-size: 0.95rem;
  }

  .weather-chip {
    padding: 0.22rem 0.5rem;
    border-radius: 999px;
    border: 1px solid var(--line);
    font-size: 0.55rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    background: var(--surface);
  }

  .weather-ease {
    border-color: color-mix(in srgb, var(--green) 30%, transparent);
    color: var(--green);
  }

  .weather-growth {
    border-color: color-mix(in srgb, var(--gold) 35%, transparent);
    color: var(--gold);
  }

  .weather-intensity {
    border-color: color-mix(in srgb, var(--rose) 35%, transparent);
    color: var(--rose);
  }

  .weather-reflect {
    border-color: color-mix(in srgb, var(--violet-soft) 35%, transparent);
    color: var(--violet-soft);
  }

  .area-card h3 {
    font-size: 0.92rem;
    font-weight: 500;
  }

  .signal {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  .signal-track {
    flex: 1;
    height: 3px;
    border-radius: 99px;
    background: var(--surface-strong);
    overflow: hidden;
  }

  .signal-fill {
    display: block;
    height: 100%;
    border-radius: 99px;
    background: var(--area);
    animation: signal-grow 0.9s var(--ease) both;
  }

  .signal-bars {
    display: inline-flex;
    gap: 2px;
  }

  .signal-bars span {
    width: 3px;
    height: 9px;
    border-radius: 1px;
    background: var(--surface-strong);
  }

  .signal-bars span.on {
    background: var(--area);
  }

  .area-summary {
    font-size: 0.73rem;
    line-height: 1.55;
    color: var(--muted);
  }

  .area-aspects {
    display: flex;
    gap: 0.3rem;
    margin-top: auto;
    padding-top: 0.45rem;
    border-top: 1px solid var(--line-soft);
  }

  .mini-aspect {
    display: inline-flex;
    align-items: center;
    gap: 0.1rem;
    padding: 0.18rem 0.35rem;
    border: 1px solid var(--line-soft);
    border-radius: 999px;
    font-size: 0.64rem;
    background: var(--surface);
  }

  .transit-columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.9rem;
    align-items: start;
  }

  .transit-column {
    padding: 1rem;
    border: 1px solid var(--line);
    border-radius: 18px;
    background: var(--card-bg);
  }

  .transit-column-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-bottom: 0.55rem;
    border-bottom: 1px solid var(--line-soft);
  }

  .transit-column-head h3 {
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gold);
  }

  .transit-column-head span {
    font-size: 0.65rem;
    color: var(--faint);
  }

  .transit-list {
    display: flex;
    flex-direction: column;
    max-height: 460px;
    overflow-y: auto;
    margin: 0 -0.25rem;
    padding: 0 0.25rem;
  }

  .transit-row {
    border-bottom: 1px solid var(--line-soft);
  }

  .transit-row:last-child {
    border-bottom: 0;
  }

  .transit-row summary {
    display: grid;
    grid-template-columns: 2.5rem minmax(0, 1fr) auto 0.9rem;
    align-items: center;
    gap: 0.55rem;
    padding: 0.65rem 0.15rem;
    cursor: pointer;
    list-style: none;
  }

  .transit-row summary::-webkit-details-marker {
    display: none;
  }

  .transit-glyphs {
    display: inline-flex;
    align-items: center;
    gap: 0.08rem;
    font-size: 0.86rem;
  }

  .transit-glyphs > span:nth-child(1) {
    color: var(--tc);
  }

  .transit-glyphs > .aspect-mark {
    color: var(--ac);
    font-size: 0.75rem;
  }

  .transit-glyphs > span:nth-child(3) {
    color: var(--nc);
  }

  .transit-main {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .transit-title {
    font-size: 0.75rem;
    color: var(--ink);
  }

  .transit-meta {
    font-size: 0.6rem;
    color: var(--faint);
  }

  .transit-when {
    font-size: 0.6rem;
    color: var(--faint);
    text-align: right;
    white-space: nowrap;
  }

  .transit-plus {
    position: relative;
    width: 10px;
    height: 10px;
  }

  .transit-plus::before,
  .transit-plus::after {
    content: '';
    position: absolute;
    background: var(--faint);
    transition: transform 0.25s ease, background 0.25s ease;
  }

  .transit-plus::before {
    top: 4.5px;
    left: 0;
    width: 10px;
    height: 1px;
  }

  .transit-plus::after {
    top: 0;
    left: 4.5px;
    width: 1px;
    height: 10px;
  }

  .transit-row[open] .transit-plus::after {
    transform: rotate(90deg);
  }

  .transit-row[open] .transit-plus::before,
  .transit-row[open] .transit-plus::after {
    background: var(--gold);
  }

  .transit-body {
    padding: 0 0.15rem 0.85rem 3.05rem;
    animation: detail-in 0.3s var(--ease);
  }

  .transit-body p {
    font-size: 0.73rem;
    line-height: 1.6;
    color: var(--muted);
  }

  .transit-body-foot {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    margin-top: 0.55rem;
  }

  .empty-note {
    padding: 0.8rem 0.15rem;
    font-size: 0.72rem;
    line-height: 1.55;
    color: var(--faint);
  }

  .timeline {
    list-style: none;
    margin: 0;
    padding: 0;
    position: relative;
  }

  .timeline::before {
    content: '';
    position: absolute;
    top: 0.4rem;
    bottom: 0.4rem;
    left: 6.4rem;
    width: 1px;
    background: var(--line-soft);
  }

  .timeline-item {
    position: relative;
    display: grid;
    grid-template-columns: 5.2rem 1.6rem minmax(0, 1fr);
    gap: 0.8rem;
    align-items: start;
    padding: 0 0 0.6rem;
  }

  .timeline-date {
    padding-top: 0.65rem;
    text-align: right;
    font-size: 0.6rem;
    letter-spacing: 0.04em;
    color: var(--faint);
    white-space: nowrap;
  }

  .timeline-dot {
    position: relative;
    z-index: 1;
    width: 9px;
    height: 9px;
    margin-top: 0.95rem;
    justify-self: center;
    border-radius: 50%;
    background: var(--event);
    box-shadow: 0 0 0 4px var(--bg), 0 0 12px color-mix(in srgb, var(--event) 50%, transparent);
  }

  .timeline-card {
    display: grid;
    grid-template-columns: 1.4rem minmax(0, 1fr) auto;
    gap: 0.6rem;
    align-items: start;
    padding: 0.65rem 0.8rem;
  }

  .timeline-glyph {
    color: var(--event);
    font-size: 0.9rem;
    padding-top: 0.1rem;
  }

  .timeline-card h3 {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--ink);
  }

  .timeline-card p {
    margin-top: 0.2rem;
    font-size: 0.68rem;
    line-height: 1.5;
    color: var(--faint);
  }

  .timeline-kind {
    font-size: 0.5rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--faint);
    padding-top: 0.15rem;
  }

  .timeline-empty {
    padding: 1rem;
    border: 1px dashed var(--line);
    border-radius: 14px;
  }

  .method-note {
    display: grid;
    grid-template-columns: minmax(0, 0.7fr) minmax(0, 1.3fr);
    gap: 2rem;
    padding: clamp(1.2rem, 3vw, 1.8rem);
    background: var(--surface);
  }

  .method-title {
    margin-top: 0.4rem;
    font-size: 1.7rem;
  }

  .method-copy p {
    font-size: 0.75rem;
    line-height: 1.65;
    color: var(--muted);
  }

  .method-copy p + p {
    margin-top: 0.5rem;
  }

  .method-copy a {
    color: var(--gold);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .method-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.8rem;
  }

  .method-actions .subtle {
    color: var(--faint);
  }

  @keyframes signal-grow {
    from {
      width: 0;
    }
  }

  @keyframes detail-in {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  @media (max-width: 1050px) {
    .onboard {
      grid-template-columns: 1fr;
    }
    .onboard-side {
      padding: 0.5rem 0;
    }
    .area-grid {
      grid-template-columns: 1fr 1fr;
    }
    .focus-grid {
      grid-template-columns: 1fr 1fr;
    }
    .prompt-card {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 900px) {
    .chart-strip {
      align-items: flex-start;
      flex-direction: column;
    }
    .strip-actions {
      justify-content: flex-start;
      width: 100%;
    }
    .transit-columns {
      grid-template-columns: 1fr;
    }
    .forecast-hero {
      grid-template-columns: 1fr;
    }
    .hero-moon {
      border-left: 0;
      border-top: 1px solid var(--line-soft);
      padding: 1.2rem 0 0;
    }
    .method-note {
      grid-template-columns: 1fr;
      gap: 0.8rem;
    }
  }

  @media (max-width: 720px) {
    .block-head {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.6rem;
    }
    .block-note {
      text-align: left;
    }
    .area-grid {
      grid-template-columns: 1fr;
    }
    .focus-grid {
      grid-template-columns: 1fr;
    }
    .prompt-card {
      grid-column: auto;
    }
    .timeline::before {
      left: 4.7rem;
    }
    .timeline-item {
      grid-template-columns: 3.8rem 1.2rem minmax(0, 1fr);
      gap: 0.5rem;
    }
    .timeline-date {
      font-size: 0.55rem;
    }
    .timeline-card {
      grid-template-columns: 1.2rem minmax(0, 1fr);
    }
    .timeline-kind {
      display: none;
    }
    .edit-head {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  @media (max-width: 540px) {
    .range-row {
      flex-direction: column;
      align-items: flex-start;
    }
    .range-row .segmented {
      width: 100%;
    }
    .range-row .segmented button {
      flex: 1;
    }
    .strip-actions .btn {
      flex: 1;
      justify-content: center;
    }
    .transit-row summary {
      grid-template-columns: 2.3rem minmax(0, 1fr) 0.9rem;
    }
    .transit-when {
      display: none;
    }
    .transit-body {
      padding-left: 0.15rem;
    }
  }
</style>
