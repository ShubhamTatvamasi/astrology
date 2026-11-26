<script lang="ts">
  import type { Chart, BodyPosition } from '../lib/astrology';
  import { ASPECTS } from '../data/aspects';
  import { SIGNS } from '../data/signs';

  interface Props {
    chart: Chart;
    selectedKey?: string | null;
    onSelect?: (key: string) => void;
    showLegend?: boolean;
    compact?: boolean;
  }

  let { chart, selectedKey = null, onSelect = () => {}, showLegend = true, compact = false }: Props =
    $props();

  const uid = $props.id();
  let hovered = $state<string | null>(null);

  const CX = 310;
  const CY = 310;
  const R_OUTER = 296;
  const R_SIGN_IN = 252;
  const R_GLYPH = 274;
  const R_PLANET = 198;
  const R_ASPECT = 150;
  const R_CENTER = 64;

  const elementFill: Record<string, string> = {
    Fire: 'rgba(255, 138, 92, 0.085)',
    Earth: 'rgba(127, 207, 157, 0.075)',
    Air: 'rgba(143, 184, 255, 0.08)',
    Water: 'rgba(183, 157, 255, 0.085)',
  };

  function angleFor(longitude: number): number {
    return 180 - (longitude - chart.ascendant.longitude);
  }

  function point(longitude: number, radius: number): { x: number; y: number } {
    const a = (angleFor(longitude) * Math.PI) / 180;
    return { x: CX + radius * Math.cos(a), y: CY + radius * Math.sin(a) };
  }

  function pathFor(longitude: number, r1: number, r2: number): string {
    const a = point(longitude, r1);
    const b = point(longitude + 30, r1);
    const c = point(longitude + 30, r2);
    const d = point(longitude, r2);
    return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r1} ${r1} 0 0 0 ${b.x.toFixed(2)} ${b.y.toFixed(2)} L ${c.x.toFixed(2)} ${c.y.toFixed(2)} A ${r2} ${r2} 0 0 1 ${d.x.toFixed(2)} ${d.y.toFixed(2)} Z`;
  }

  function lineFor(longitude: number, r1: number, r2: number) {
    return { a: point(longitude, r1), b: point(longitude, r2) };
  }

  function anchorFor(longitude: number, radius: number): 'start' | 'middle' | 'end' {
    const x = point(longitude, radius).x;
    if (x > CX + radius * 0.45) return 'start';
    if (x < CX - radius * 0.45) return 'end';
    return 'middle';
  }

  const activeKey = $derived(hovered ?? selectedKey);

  const planets = $derived.by(() => {
    const sorted = [...chart.positions].sort((a, b) => a.longitude - b.longitude);
    // Rotate the list so the largest gap sits at the wrap point; a cluster that
    // straddles 0° Aries then stays together.
    let largestGap = -1;
    let start = 0;
    for (let i = 0; i < sorted.length; i++) {
      const next = sorted[(i + 1) % sorted.length]!;
      const gap = (next.longitude - sorted[i]!.longitude + 360) % 360;
      if (gap > largestGap) {
        largestGap = gap;
        start = (i + 1) % sorted.length;
      }
    }
    const ordered = [...sorted.slice(start), ...sorted.slice(0, start)];
    const placed: { body: BodyPosition; radius: number; index: number }[] = [];
    let cluster: BodyPosition[] = [];
    const flush = () => {
      const size = cluster.length;
      const step = size > 5 ? 18 : 24;
      cluster.forEach((body, i) => {
        placed.push({
          body,
          radius: R_PLANET + (i - (size - 1) / 2) * step,
          index: placed.length,
        });
      });
      cluster = [];
    };
    for (const body of ordered) {
      const last = cluster[cluster.length - 1];
      const separation = last ? (body.longitude - last.longitude + 360) % 360 : 0;
      if (!last || separation <= 9) cluster.push(body);
      else {
        flush();
        cluster.push(body);
      }
    }
    flush();
    return placed;
  });

  const selectedBody = $derived(chart.positions.find((p) => p.key === activeKey) ?? null);
  const mcOuterPoint = $derived(point(chart.midheaven.longitude, R_OUTER + 12));
  const mcInnerPoint = $derived(point(chart.midheaven.longitude, R_OUTER - 7));

  function degreeLabel(body: BodyPosition): string {
    const deg = Math.floor(body.degree);
    const min = Math.floor((body.degree - deg) * 60);
    return `${deg}°${String(min).padStart(2, '0')}′${body.retrograde ? ' ℞' : ''}`;
  }
</script>

<div class:compact class="wheel-shell">
  {#key chart}
    <svg
      class="wheel"
      viewBox="-20 -20 660 660"
      role="group"
      aria-label={`Interactive birth chart wheel. Sun in ${chart.positions[0]?.sign.name}, Moon in ${chart.positions[1]?.sign.name}, ${chart.ascendant.sign.name} rising.`}
    >
      <defs>
        <radialGradient id={`center-${uid}`} cx="50%" cy="42%" r="65%">
          <stop offset="0%" stop-color="rgba(232,196,124,0.16)" />
          <stop offset="70%" stop-color="rgba(15,16,30,0.92)" />
          <stop offset="100%" stop-color="rgba(8,9,18,0.98)" />
        </radialGradient>
        <filter id={`glow-${uid}`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx={CX} cy={CY} r="306" class="deco-ring" />
      <circle cx={CX} cy={CY} r={R_OUTER} class="outer-circle" />

      <!-- degree ticks -->
      <g class="ticks">
        {#each Array.from({ length: 72 }, (_, i) => i) as i}
          {@const lon = i * 5}
          {@const tick = lineFor(lon, R_OUTER, i % 2 === 0 ? 303 : 300)}
          <line x1={tick.a.x} y1={tick.a.y} x2={tick.b.x} y2={tick.b.y} />
        {/each}
      </g>

      <!-- zodiac ring -->
      <g class="sign-ring">
        {#each Array.from({ length: 12 }, (_, i) => i) as i}
          {@const start = i * 30}
          {@const currentSign = SIGNS[i]!}
          {@const mid = start + 15}
          {@const active =
            activeKey !== null &&
            chart.positions.find((p) => p.key === activeKey)?.signIndex === i}
          <path
            d={pathFor(start, R_OUTER, R_SIGN_IN)}
            fill={elementFill[currentSign.element]}
            class:active
            class="sign-sector"
          />
          <line
            x1={point(start, R_SIGN_IN).x}
            y1={point(start, R_SIGN_IN).y}
            x2={point(start, R_OUTER).x}
            y2={point(start, R_OUTER).y}
            class="sign-boundary"
          />
          <text
            x={point(mid, R_GLYPH).x}
            y={point(mid, R_GLYPH).y}
            text-anchor="middle"
            dominant-baseline="central"
            class="sign-glyph"
            class:active
            style={`--d:${i}`}
          >
            {currentSign.glyph}
          </text>
        {/each}
        <circle cx={CX} cy={CY} r={R_SIGN_IN} class="ring-line" />
        <circle cx={CX} cy={CY} r={R_OUTER} class="ring-line" />
      </g>

      <!-- house cusps & numbers -->
      <g class="houses">
        {#each chart.cusps as cusp, i}
          {@const line = lineFor(cusp, R_CENTER + 8, R_SIGN_IN - 4)}
          <line x1={line.a.x} y1={line.a.y} x2={line.b.x} y2={line.b.y} class="cusp" />
          {@const mid = cusp + 15}
          {@const pos = point(mid, 88)}
          <text x={pos.x} y={pos.y} text-anchor="middle" dominant-baseline="central" class="house-num">
            {i + 1}
          </text>
        {/each}
      </g>

      <!-- aspects -->
      <g class="aspects">
        {#each chart.aspects as aspect, i}
          {@const a = point(aspect.a.longitude, R_ASPECT)}
          {@const b = point(aspect.b.longitude, R_ASPECT)}
          {@const dim =
            activeKey !== null && aspect.a.key !== activeKey && aspect.b.key !== activeKey}
          <line
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={aspect.aspect.color}
            stroke-width={0.7 + aspect.strength * 1.1}
            stroke-opacity={0.28 + aspect.strength * 0.5}
            class:dim
            class="aspect-line"
            style={`--i:${Math.min(i, 20)}`}
          >
            <title>{aspect.a.name} {aspect.aspect.name.toLowerCase()} {aspect.b.name} — orb {aspect.orb.toFixed(1)}°</title>
          </line>
        {/each}
      </g>

      <!-- planets -->
      <g class="planets">
        {#each planets as item (item.body.key)}
          {@const body = item.body}
          {@const tickPoint = point(body.longitude, R_SIGN_IN - 2)}
          {@const glyphPoint = point(body.longitude, item.radius)}
          {@const labelPoint = point(body.longitude, item.radius - 14)}
          {@const active = activeKey === body.key}
          {@const dim = activeKey !== null && !active}
          <g
            class:active
            class:dim
            class="planet"
            style={`--i:${item.index}`}
            role="button"
            tabindex="0"
            aria-label={`${body.name} in ${body.sign.name}${body.retrograde ? ', retrograde' : ''}. View details.`}
            onclick={() => onSelect(body.key)}
            onkeydown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(body.key);
              }
            }}
            onpointerenter={() => (hovered = body.key)}
            onpointerleave={() => (hovered = null)}
          >
            <title>{body.name} in {body.sign.name} · {body.degreeText}</title>
            <line
              x1={tickPoint.x}
              y1={tickPoint.y}
              x2={glyphPoint.x}
              y2={glyphPoint.y}
              stroke={body.color}
              stroke-opacity={active ? 0.8 : 0.32}
              class="planet-stem"
            />
            <circle cx={tickPoint.x} cy={tickPoint.y} r={active ? 3.2 : 2.2} fill={body.color} />
            <circle
              cx={glyphPoint.x}
              cy={glyphPoint.y}
              r="13"
              fill="rgba(8,9,18,0.72)"
              stroke={active ? body.color : 'transparent'}
              stroke-opacity="0.5"
              class="planet-hit"
            />
            <text
              x={glyphPoint.x}
              y={glyphPoint.y}
              text-anchor="middle"
              dominant-baseline="central"
              fill={body.color}
              class="planet-glyph"
              filter={active ? `url(#glow-${uid})` : undefined}
            >
              {body.glyph}
            </text>
            {#if active}
              <text
                x={labelPoint.x}
                y={labelPoint.y}
                text-anchor="middle"
                dominant-baseline="central"
                class="planet-degree"
              >
                {degreeLabel(body)}
              </text>
            {/if}
          </g>
        {/each}
      </g>

      <!-- angles -->
      <g class="angles">
        <line x1={CX - R_OUTER} y1={CY} x2={CX - R_OUTER - 14} y2={CY} class="angle-mark" />
        <text x={CX - R_OUTER - 20} y={CY} text-anchor="end" dominant-baseline="central" class="angle-label">
          ASC
        </text>
        <line
          x1={mcInnerPoint.x}
          y1={mcInnerPoint.y}
          x2={mcOuterPoint.x}
          y2={mcOuterPoint.y}
          class="angle-mark"
        />
        <text
          x={mcOuterPoint.x}
          y={mcOuterPoint.y}
          text-anchor={anchorFor(chart.midheaven.longitude, R_OUTER)}
          dominant-baseline="central"
          class="angle-label"
        >
          MC
        </text>
      </g>

      <!-- center -->
      <g class="center">
        <circle cx={CX} cy={CY} r={R_CENTER} fill={`url(#center-${uid})`} stroke="rgba(232,196,124,0.25)" />
        <circle cx={CX} cy={CY} r="52" class="center-dash" />
        {#if selectedBody}
          <text x={CX} y={CY - 12} text-anchor="middle" class="center-glyph" fill={selectedBody.color}>
            {selectedBody.glyph}
          </text>
          <text x={CX} y={CY + 10} text-anchor="middle" class="center-name">
            {selectedBody.name.toUpperCase()}
          </text>
          <text x={CX} y={CY + 26} text-anchor="middle" class="center-sub">
            {selectedBody.sign.name} · {selectedBody.degreeText}
          </text>
        {:else}
          <text x={CX} y={CY - 8} text-anchor="middle" class="center-glyph small">
            {chart.positions[0]?.glyph} {chart.positions[1]?.glyph} {chart.ascendant.sign.glyph}
          </text>
          <text x={CX} y={CY + 16} text-anchor="middle" class="center-name">SUN · MOON · RISING</text>
        {/if}
      </g>
    </svg>
  {/key}

  {#if showLegend}
    <div class="legend" aria-hidden="true">
      {#each ASPECTS as aspect}
        <span class="legend-item">
          <span class="legend-dot" style={`background:${aspect.color}`}></span>
          {aspect.name}
        </span>
      {/each}
    </div>
  {/if}
</div>

<style>
  .wheel-shell {
    width: 100%;
    max-width: 620px;
    margin-inline: auto;
  }

  .wheel {
    width: 100%;
    height: auto;
    overflow: visible;
  }

  .deco-ring {
    fill: none;
    stroke: rgba(232, 196, 124, 0.14);
    stroke-width: 0.8;
    stroke-dasharray: 1 9;
    transform-origin: 310px 310px;
    animation: slow-spin 140s linear infinite;
  }

  @keyframes slow-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .outer-circle,
  .ring-line {
    fill: none;
    stroke: rgba(255, 255, 255, 0.11);
    stroke-width: 1;
  }

  .ticks line {
    stroke: rgba(255, 255, 255, 0.2);
    stroke-width: 0.7;
  }

  .sign-sector {
    transition: fill 0.35s ease;
  }

  .sign-sector.active {
    fill: rgba(232, 196, 124, 0.12);
  }

  .sign-boundary {
    stroke: rgba(255, 255, 255, 0.1);
    stroke-width: 0.8;
  }

  .sign-glyph {
    fill: rgba(237, 234, 246, 0.86);
    font-family: var(--font-glyph);
    font-size: 21px;
    opacity: 0;
    animation: glyph-in 0.8s var(--ease) forwards;
    animation-delay: calc(var(--d, 0) * 35ms + 180ms);
    transition: fill 0.3s ease;
  }

  .sign-glyph.active {
    fill: var(--gold-bright);
  }

  .cusp {
    stroke: rgba(255, 255, 255, 0.1);
    stroke-width: 0.75;
  }

  .house-num {
    fill: rgba(237, 234, 246, 0.3);
    font-family: var(--font-sans);
    font-size: 8.5px;
    font-weight: 500;
    letter-spacing: 0.06em;
  }

  .aspect-line {
    stroke-dasharray: 400;
    stroke-dashoffset: 400;
    animation: draw-line 1.3s var(--ease) forwards;
    animation-delay: calc(var(--i, 0) * 55ms + 650ms);
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .aspect-line.dim {
    opacity: 0.12;
  }

  .planet {
    cursor: pointer;
    opacity: 0;
    animation: planet-in 0.7s var(--ease) forwards;
    animation-delay: calc(var(--i) * 60ms + 420ms);
    transition: opacity 0.3s ease;
    outline: none;
  }

  .planet.dim {
    opacity: 0.28;
  }

  .planet:focus-visible .planet-hit {
    stroke: var(--gold);
    stroke-width: 1.5;
  }

  .planet-hit {
    transition: stroke 0.25s ease, fill 0.25s ease;
  }

  .planet:hover .planet-hit {
    fill: rgba(232, 196, 124, 0.12);
  }

  .planet-glyph {
    font-family: var(--font-glyph);
    font-variant-emoji: text;
    font-size: 20px;
    pointer-events: none;
  }

  .planet-degree {
    fill: rgba(237, 234, 246, 0.62);
    font-family: var(--font-sans);
    font-size: 8.2px;
    letter-spacing: 0.03em;
    pointer-events: none;
  }

  .planet-stem {
    stroke-width: 0.8;
    pointer-events: none;
  }

  .angle-mark {
    stroke: var(--gold);
    stroke-width: 1.4;
    stroke-opacity: 0.65;
  }

  .angle-label {
    fill: var(--gold);
    font-family: var(--font-sans);
    font-size: 8.5px;
    font-weight: 600;
    letter-spacing: 0.14em;
  }

  .center-glyph {
    font-family: var(--font-glyph);
    font-size: 24px;
  }

  .center-glyph.small {
    font-size: 18px;
    fill: var(--gold-bright);
  }

  .center-name {
    fill: rgba(237, 234, 246, 0.72);
    font-family: var(--font-sans);
    font-size: 6.6px;
    font-weight: 600;
    letter-spacing: 0.18em;
  }

  .center-sub {
    fill: rgba(237, 234, 246, 0.5);
    font-family: var(--font-sans);
    font-size: 7.5px;
  }

  .center-dash {
    fill: none;
    stroke: rgba(232, 196, 124, 0.18);
    stroke-width: 0.7;
    stroke-dasharray: 2 5;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.55rem 1.1rem;
    margin-top: 0.2rem;
  }

  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.67rem;
    letter-spacing: 0.06em;
    color: var(--faint);
  }

  .legend-dot {
    width: 14px;
    height: 1.5px;
    border-radius: 2px;
  }

  @keyframes glyph-in {
    from {
      opacity: 0;
      transform: translateY(3px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  @keyframes planet-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes draw-line {
    to {
      stroke-dashoffset: 0;
    }
  }

  @media (max-width: 560px) {
    .planet-degree {
      font-size: 8.5px;
    }
    .sign-glyph {
      font-size: 19px;
    }
  }
</style>
