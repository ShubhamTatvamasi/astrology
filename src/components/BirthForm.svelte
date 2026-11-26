<script lang="ts">
  import { searchPlaces, placeLabel, type Place } from '../lib/geo';
  import {
    offsetLabel,
    offsetTimeToUtc,
    zonedTimeToUtc,
    isValidLatitude,
    isValidLongitude,
    formatOffset,
  } from '../lib/time';
  import type { BirthData, BirthInitial } from '../lib/types';

  interface Props {
    initial?: BirthInitial | null;
    submitLabel?: string;
    onCalculate: (data: BirthData) => void;
  }

  let { initial = null, submitLabel = 'Reveal my big three', onCalculate }: Props = $props();

  let date = $state(initial?.date ?? '');
  let time = $state(initial?.time ?? '');
  let timeUnknown = $state(Boolean(initial?.timeUnknown));
  let manual = $state(Boolean(initial?.manual));
  let query = $state('');
  let results = $state<Place[]>([]);
  let selected = $state<Place | null>(initial?.place ?? null);
  let searching = $state(false);
  let searchError = $state('');
  let latitude = $state<string | number>(String(initial?.latitude ?? ''));
  let longitude = $state<string | number>(String(initial?.longitude ?? ''));
  let utcOffset = $state<string | number>(String(initial?.utcOffset ?? ''));
  let error = $state('');

  const inputId = 'birth-date';

  $effect(() => {
    const q = query.trim();
    if (manual || selected || q.length < 2) {
      results = [];
      searching = false;
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      searching = true;
      searchError = '';
      try {
        results = await searchPlaces(q, controller.signal);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          searchError = 'City search is unavailable right now. You can enter coordinates manually.';
          results = [];
        }
      } finally {
        if (!controller.signal.aborted) searching = false;
      }
    }, 380);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  });

  let placeOffset = $derived.by(() => {
    if (!selected || !date || (!timeUnknown && !time)) return '';
    try {
      const resolved = zonedTimeToUtc(date, timeUnknown ? '12:00' : time, selected.timezone);
      return offsetLabel(resolved, selected.timezone);
    } catch {
      return '';
    }
  });

  function choosePlace(place: Place) {
    selected = place;
    query = '';
    results = [];
    searchError = '';
    error = '';
  }

  function clearPlace() {
    selected = null;
    query = '';
    results = [];
  }

  function calculate() {
    error = '';

    if (!date) {
      error = 'Add your birth date to continue.';
      return;
    }
    const year = Number(date.slice(0, 4));
    if (!Number.isFinite(year) || year < 1800 || year > 2100) {
      error = 'Please use a birth year between 1800 and 2100.';
      return;
    }

    const clock = timeUnknown ? '12:00' : time;
    if (!clock) {
      error = 'Add a birth time, or mark it as unknown.';
      return;
    }

    let latitudeValue: number;
    let longitudeValue: number;
    let dateValue: Date;
    let tzLabel: string;
    let placeText: string;
    let timezone: string;

    if (manual) {
      const blank = (value: string | number | undefined | null) =>
        value === undefined || value === null || String(value).trim() === '';
      if (blank(latitude) || blank(longitude)) {
        error = 'Enter both a latitude and a longitude for manual coordinates.';
        return;
      }
      if (blank(utcOffset)) {
        error = 'Enter the UTC offset in hours, for example 5.5 for India or −4 for New York in summer.';
        return;
      }
      latitudeValue = Number(latitude);
      longitudeValue = Number(longitude);
      const offset = Number(utcOffset);
      if (!isValidLatitude(latitudeValue) || !isValidLongitude(longitudeValue)) {
        error = 'Enter a latitude between −90 and 90 and a longitude between −180 and 180.';
        return;
      }
      if (!Number.isFinite(offset) || offset < -14 || offset > 14) {
        error = 'Enter the UTC offset in hours, for example 5.5 for India or −4 for New York in summer.';
        return;
      }
      dateValue = offsetTimeToUtc(date, clock, offset);
      tzLabel = formatOffset(offset);
      timezone = tzLabel;
      placeText = 'Custom coordinates';
    } else {
      if (!selected) {
        error = 'Search for your birth city, or enter coordinates manually.';
        return;
      }
      latitudeValue = selected.latitude;
      longitudeValue = selected.longitude;
      try {
        dateValue = zonedTimeToUtc(date, clock, selected.timezone);
        tzLabel = offsetLabel(dateValue, selected.timezone);
      } catch {
        error = 'That time zone could not be resolved. Try entering coordinates manually.';
        return;
      }
      timezone = selected.timezone;
      placeText = placeLabel(selected);
    }

    if (Number.isNaN(dateValue.getTime())) {
      error = 'That date and time could not be resolved. Please check the values.';
      return;
    }

    onCalculate({
      date: dateValue,
      localDate: date,
      localTime: clock,
      timeUnknown,
      latitude: latitudeValue,
      longitude: longitudeValue,
      timezone,
      tzLabel,
      placeLabel: placeText,
    });
  }
</script>

<form class="birth-form" onsubmit={(event) => { event.preventDefault(); calculate(); }} novalidate>
  <div class="form-grid">
    <div class="field">
      <label for={inputId}>Birth date</label>
      <input
        id={inputId}
        class="input"
        type="date"
        min="1800-01-01"
        max="2100-12-31"
        bind:value={date}
        required
      />
    </div>

    <div class="field">
      <label for="birth-time">Birth time</label>
      <input
        id="birth-time"
        class="input"
        type="time"
        bind:value={time}
        disabled={timeUnknown}
      />
    </div>

    <div class="field time-unknown">
      <span class="field-label">Not sure?</span>
      <label class="checkbox">
        <input type="checkbox" bind:checked={timeUnknown} />
        <span>Time unknown</span>
      </label>
    </div>
  </div>

  <div class="place-block">
    <div class="place-head">
      <span class="field-label">Birth place</span>
      <button
        type="button"
        class="text-toggle"
        onclick={() => {
          manual = !manual;
          error = '';
        }}
      >
        {manual ? 'Search for a city instead' : 'Enter coordinates manually'}
      </button>
    </div>

    {#if manual}
      <div class="manual-grid">
        <div class="field">
          <label for="birth-lat">Latitude</label>
          <input
            id="birth-lat"
            class="input"
            type="number"
            step="0.0001"
            min="-90"
            max="90"
            placeholder="41.3083"
            bind:value={latitude}
          />
        </div>
        <div class="field">
          <label for="birth-lon">Longitude</label>
          <input
            id="birth-lon"
            class="input"
            type="number"
            step="0.0001"
            min="-180"
            max="180"
            placeholder="−72.9279"
            bind:value={longitude}
          />
        </div>
        <div class="field">
          <label for="birth-offset">UTC offset (hours)</label>
          <input
            id="birth-offset"
            class="input"
            type="number"
            step="0.25"
            min="-14"
            max="14"
            placeholder="−4"
            bind:value={utcOffset}
          />
        </div>
      </div>
      <p class="form-hint">
        The offset is the local clock time minus UTC at your birth moment. For example, New York in
        July is −4; India is 5.5; London in winter is 0.
      </p>
    {:else if selected}
      <div class="selected-place">
        <span class="pin" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        </span>
        <div class="selected-copy">
          <strong>{placeLabel(selected)}</strong>
          <span>
            {selected.latitude.toFixed(3)}, {selected.longitude.toFixed(3)}
            {#if placeOffset} · {placeOffset}{/if}
          </span>
        </div>
        <button type="button" class="clear-place" onclick={clearPlace}>Change</button>
      </div>
    {:else}
      <div class="search-wrap">
        <span class="search-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m15.5 15.5 4.5 4.5" />
          </svg>
        </span>
        <input
          id="birth-place"
          class="input place-input"
          type="text"
          role="combobox"
          aria-label="Search for your birth city"
          aria-autocomplete="list"
          aria-controls="place-results"
          aria-expanded={results.length > 0}
          placeholder="Start typing a city — e.g. New Haven"
          bind:value={query}
          autocomplete="off"
        />
        {#if searching}
          <span class="spinner" aria-label="Searching"></span>
        {/if}
      </div>

      {#if results.length > 0}
        <ul class="place-results" id="place-results">
          {#each results as place (place.id)}
            <li>
              <button type="button" onclick={() => choosePlace(place)}>
                <span class="result-name">{place.name}</span>
                <span class="result-region">{[place.admin1, place.country].filter(Boolean).join(', ')}</span>
                <span class="result-coords">{place.latitude.toFixed(2)}, {place.longitude.toFixed(2)}</span>
              </button>
            </li>
          {/each}
        </ul>
      {:else if query.trim().length >= 2 && !searching && !searchError}
        <p class="form-hint no-results">No matches yet. Try a nearby larger city.</p>
      {/if}

      {#if searchError}
        <p class="form-error" role="status">{searchError}</p>
      {/if}
    {/if}
  </div>

  {#if error}
    <p class="form-error" role="alert">{error}</p>
  {/if}

  {#if timeUnknown}
    <p class="form-hint time-note">
      Without a birth time we use 12:00 noon local time. Your Sun and most planets stay accurate;
      the Moon may shift by a few degrees, and the rising sign and houses cannot be trusted.
    </p>
  {/if}

  <div class="form-actions">
    <button class="btn btn-primary" type="submit">
      {submitLabel}
      <span class="arrow" aria-hidden="true">→</span>
    </button>
    <p class="privacy-note">
      Calculated in your browser. Only the city search leaves your device.
    </p>
  </div>
</form>

<style>
  .birth-form {
    display: flex;
    flex-direction: column;
    gap: 1.15rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr) minmax(0, 0.75fr);
    gap: 0.9rem;
  }

  .time-unknown {
    justify-content: flex-end;
  }

  .checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 46px;
    font-size: 0.86rem;
    color: var(--muted);
    cursor: pointer;
    user-select: none;
  }

  .checkbox input {
    appearance: none;
    width: 18px;
    height: 18px;
    border: 1px solid var(--line);
    border-radius: 5px;
    background: var(--surface);
    display: grid;
    place-items: center;
    transition: background 0.2s ease, border-color 0.2s ease;
  }

  .checkbox input:checked {
    border-color: var(--gold);
    background: var(--gold);
  }

  .checkbox input:checked::after {
    content: '';
    width: 9px;
    height: 5px;
    border-left: 2px solid #171106;
    border-bottom: 2px solid #171106;
    transform: rotate(-45deg) translateY(-1px);
  }

  .place-block {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .place-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .text-toggle {
    border: 0;
    background: none;
    padding: 0;
    font-size: 0.74rem;
    color: var(--gold);
    border-bottom: 1px solid rgba(232, 196, 124, 0.3);
    line-height: 1.4;
  }

  .text-toggle:hover {
    color: var(--gold-bright);
  }

  .search-wrap {
    position: relative;
  }

  .place-input {
    padding-left: 2.5rem;
    padding-right: 2.5rem;
  }

  .search-icon {
    position: absolute;
    left: 0.85rem;
    top: 50%;
    width: 17px;
    height: 17px;
    transform: translateY(-50%);
    color: var(--faint);
    pointer-events: none;
  }

  .spinner {
    position: absolute;
    right: 0.9rem;
    top: 50%;
    width: 15px;
    height: 15px;
    margin-top: -7.5px;
    border: 1.5px solid var(--line-strong);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .place-results {
    position: absolute;
    z-index: 20;
    top: calc(100% - 0.4rem);
    left: 0;
    right: 0;
    max-height: 280px;
    overflow-y: auto;
    padding: 0.4rem;
    border: 1px solid rgba(232, 196, 124, 0.2);
    border-radius: 16px;
    background: var(--dropdown-bg);
    backdrop-filter: blur(20px);
    box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.8);
  }

  .place-results button {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: baseline;
    width: 100%;
    padding: 0.6rem 0.7rem;
    border: 0;
    border-radius: 11px;
    background: transparent;
    text-align: left;
    transition: background 0.2s ease;
  }

  .place-results button:hover {
    background: rgba(232, 196, 124, 0.08);
  }

  .result-name {
    font-size: 0.93rem;
    color: var(--ink);
  }

  .result-region {
    grid-column: 1;
    font-size: 0.74rem;
    color: var(--muted);
  }

  .result-coords {
    grid-column: 2;
    grid-row: 1 / span 2;
    align-self: center;
    font-size: 0.68rem;
    color: var(--faint);
    font-variant-numeric: tabular-nums;
  }

  .selected-place {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.7rem 0.8rem;
    border: 1px solid rgba(232, 196, 124, 0.22);
    border-radius: 14px;
    background: rgba(232, 196, 124, 0.055);
  }

  .pin {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    color: var(--gold);
    background: rgba(232, 196, 124, 0.1);
    flex-shrink: 0;
  }

  .pin svg {
    width: 18px;
    height: 18px;
  }

  .selected-copy {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .selected-copy strong {
    font-size: 0.94rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .selected-copy span {
    font-size: 0.73rem;
    color: var(--muted);
    font-variant-numeric: tabular-nums;
  }

  .clear-place {
    margin-left: auto;
    border: 0;
    background: none;
    font-size: 0.73rem;
    color: var(--gold);
    white-space: nowrap;
  }

  .manual-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.7rem;
  }

  .no-results {
    margin-top: 0.1rem;
  }

  .time-note {
    padding: 0.7rem 0.9rem;
    border-left: 2px solid rgba(232, 196, 124, 0.4);
    background: rgba(232, 196, 124, 0.05);
    border-radius: 0 8px 8px 0;
    color: var(--muted);
  }

  .form-actions {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    flex-wrap: wrap;
    margin-top: 0.15rem;
  }

  .privacy-note {
    font-size: 0.7rem;
    color: var(--faint);
    max-width: 30ch;
    line-height: 1.45;
  }

  @media (max-width: 640px) {
    .form-grid {
      grid-template-columns: 1fr 1fr;
    }
    .time-unknown {
      grid-column: 1 / -1;
      justify-content: flex-start;
    }
    .time-unknown .field-label {
      display: none;
    }
    .checkbox {
      min-height: 30px;
    }
    .manual-grid {
      grid-template-columns: 1fr 1fr;
    }
    .manual-grid .field:last-child {
      grid-column: 1 / -1;
    }
    .form-actions {
      align-items: flex-start;
      flex-direction: column;
      gap: 0.7rem;
    }
    .form-actions .btn {
      width: 100%;
    }
  }
</style>
