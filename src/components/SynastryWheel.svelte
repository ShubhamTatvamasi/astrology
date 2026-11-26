<script lang="ts">
  import type { Chart } from '../lib/astrology';
  import type { SynastryAspect } from '../lib/synastry';
  import { SIGNS } from '../data/signs';

  interface Props {
    chartA: Chart;
    chartB: Chart;
    aspects: SynastryAspect[];
    score: number;
    label: string;
  }

  let { chartA, chartB, aspects, score, label }: Props = $props();

  const uid = $props.id();
  const CX = 310;
  const CY = 310;
  const R_OUTER = 296;
  const R_SIGN_IN = 252;
  const R_GLYPH = 274;
  const R_ASPECT = 132;
  const R_A = 218;
  const R_B = 178;

  const elementFill: Record<string, string> = {
    Fire: 'rgba(255, 138, 92, 0.08)',
    Earth: 'rgba(127, 207, 157, 0.07)',
    Air: 'rgba(143, 184, 255, 0.075)',
    Water: 'rgba(183, 157, 255, 0.08)',
  };

  const angleFor = (longitude: number) => 180 - (longitude - chartA.ascendant.longitude);
  const point = (longitude: number, radius: number) => {
    const a = (angleFor(longitude) * Math.PI) / 180;
    return { x: CX + radius * Math.cos(a), y: CY + radius * Math.sin(a) };
  };
  const pathFor = (longitude: number, r1: number, r2: number) => {
    const a = point(longitude, r1);
    const b = point(longitude + 30, r1);
    const c = point(longitude + 30, r2);
    const d = point(longitude, r2);
    return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r1} ${r1} 0 0 0 ${b.x.toFixed(2)} ${b.y.toFixed(2)} L ${c.x.toFixed(2)} ${c.y.toFixed(2)} A ${r2} ${r2} 0 0 1 ${d.x.toFixed(2)} ${d.y.toFixed(2)} Z`;
  };

  function placed(chart: Chart, base: number) {
    const sorted = [...chart.positions].sort((a, b) => a.longitude - b.longitude);
    const result: { body: (typeof sorted)[number]; radius: number; index: number }[] = [];
    let cluster: typeof sorted = [];
    const flush = () => {
      const n = cluster.length;
      cluster.forEach((body, i) => {
        result.push({ body, radius: base + (i - (n - 1) / 2) * 14, index: result.length });
      });
      cluster = [];
    };
    for (const body of sorted) {
      const last = cluster[cluster.length - 1];
      const gap = last ? (body.longitude - last.longitude + 360) % 360 : 0;
      if (!last || gap <= 8) cluster.push(body);
      else {
        flush();
        cluster.push(body);
      }
    }
    flush();
    return result;
  }

  const planetsA = placed(chartA, R_A);
  const planetsB = placed(chartB, R_B);
  const lines = aspects.slice(0, 10);

  const toneColor = (tone: string) =>
    tone === 'ease' ? '#7fcf9d' : tone === 'friction' ? '#ff8a9b' : '#e8c47c';
</script>

<div class="synastry-wheel">
  <svg viewBox="-20 -20 660 660" role="img" aria-label={`Synastry wheel. Compatibility index ${score} out of 100, ${label}.`}>
    <defs>
      <radialGradient id={`sy-disc-${uid}`} cx="48%" cy="44%" r="58%">
        <stop offset="0%" stop-color="#16132b" />
        <stop offset="64%" stop-color="#0b0c18" />
        <stop offset="100%" stop-color="#070812" />
      </radialGradient>
      <radialGradient id={`sy-center-${uid}`} cx="50%" cy="40%" r="65%">
        <stop offset="0%" stop-color="rgba(232,196,124,.17)" />
        <stop offset="70%" stop-color="rgba(15,16,30,.95)" />
        <stop offset="100%" stop-color="rgba(8,9,18,.98)" />
      </radialGradient>
      <filter id={`sy-glow-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <circle cx={CX} cy={CY} r="312" fill={`url(#sy-disc-${uid})`} class="disc" />
    <circle cx={CX} cy={CY} r="306" class="deco" />
    <circle cx={CX} cy={CY} r={R_OUTER} class="ring" />
    <circle cx={CX} cy={CY} r={R_SIGN_IN} class="ring" />
    <circle cx={CX} cy={CY} r={R_A + 18} class="soft-ring" />
    <circle cx={CX} cy={CY} r={R_B - 18} class="soft-ring" />

    <g class="sign-ring">
      {#each Array.from({ length: 12 }, (_, i) => i) as i}
        {@const sign = SIGNS[i]!}
        {@const mid = i * 30 + 15}
        <path d={pathFor(i * 30, R_OUTER, R_SIGN_IN)} fill={elementFill[sign.element]} />
        <text
          x={point(mid, R_GLYPH).x}
          y={point(mid, R_GLYPH).y}
          text-anchor="middle"
          dominant-baseline="central"
          class="sign-glyph"
        >
          {sign.glyph}
        </text>
      {/each}
    </g>

    <g class="aspects">
      {#each lines as aspect, i}
        {@const a = point(aspect.a.longitude, R_ASPECT)}
        {@const b = point(aspect.b.longitude, R_ASPECT)}
        <line
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke={toneColor(aspect.tone)}
          stroke-width={0.7 + aspect.weight * 1.4}
          stroke-opacity={0.25 + aspect.weight * 0.6}
          class="aspect-line"
          style={`--i:${i}`}
        >
          <title>{aspect.headline}</title>
        </line>
      {/each}
    </g>

    <g class="planets-a">
      {#each planetsA as item (item.body.key)}
        {@const p = point(item.body.longitude, item.radius)}
        <circle cx={p.x} cy={p.y} r="14" fill="rgba(8,9,18,.78)" stroke="rgba(232,196,124,.25)" />
        <text x={p.x} y={p.y} text-anchor="middle" dominant-baseline="central" fill="#f7e3b0" class="planet-glyph">
          {item.body.glyph}
        </text>
      {/each}
    </g>

    <g class="planets-b">
      {#each planetsB as item (item.body.key)}
        {@const p = point(item.body.longitude, item.radius)}
        <circle cx={p.x} cy={p.y} r="14" fill="rgba(8,9,18,.78)" stroke="rgba(201,184,255,.25)" />
        <text x={p.x} y={p.y} text-anchor="middle" dominant-baseline="central" fill="#c9b8ff" class="planet-glyph">
          {item.body.glyph}
        </text>
      {/each}
    </g>

    <g class="center">
      <circle cx={CX} cy={CY} r="68" fill={`url(#sy-center-${uid})`} stroke="rgba(232,196,124,.28)" />
      <circle cx={CX} cy={CY} r="56" class="center-dash" />
      <text x={CX} y={CY - 9} text-anchor="middle" class="score" filter={`url(#sy-glow-${uid})`}>
        {score}
      </text>
      <text x={CX} y={CY + 12} text-anchor="middle" class="score-label">COMPATIBILITY</text>
      <text x={CX} y={CY + 27} text-anchor="middle" class="score-band">{label.toUpperCase()}</text>
    </g>
  </svg>

  <div class="legend" aria-hidden="true">
    <span><i class="dot you"></i> You</span>
    <span><i class="dot partner"></i> Partner</span>
    <span><i class="line ease"></i> Ease</span>
    <span><i class="line friction"></i> Friction</span>
  </div>
</div>

<style>
  .synastry-wheel {
    width: 100%;
    max-width: 620px;
    margin-inline: auto;
  }

  svg {
    width: 100%;
    height: auto;
    overflow: visible;
  }

  .disc {
    filter: drop-shadow(0 30px 58px rgba(10, 7, 24, 0.32));
  }

  .ring {
    fill: none;
    stroke: rgba(255, 255, 255, 0.1);
    stroke-width: 1;
  }

  .soft-ring {
    fill: none;
    stroke: rgba(232, 196, 124, 0.09);
    stroke-dasharray: 1 8;
  }

  .deco {
    fill: none;
    stroke: rgba(232, 196, 124, 0.14);
    stroke-width: 0.8;
    stroke-dasharray: 1 9;
    transform-origin: 310px 310px;
    animation: spin 150s linear infinite;
  }

  .sign-glyph {
    fill: rgba(237, 234, 246, 0.82);
    font-family: var(--font-glyph);
    font-size: 20px;
  }

  .aspect-line {
    stroke-dasharray: 400;
    stroke-dashoffset: 400;
    animation: draw 1.4s var(--ease) forwards;
    animation-delay: calc(var(--i) * 55ms + 400ms);
  }

  .planet-glyph {
    font-family: var(--font-glyph);
    font-size: 17px;
  }

  .score {
    fill: #f7e3b0;
    font-family: var(--font-serif);
    font-size: 32px;
  }

  .score-label {
    fill: rgba(237, 234, 246, 0.45);
    font-family: var(--font-sans);
    font-size: 6px;
    letter-spacing: 0.18em;
  }

  .score-band {
    fill: #e8c47c;
    font-family: var(--font-sans);
    font-size: 6.5px;
    letter-spacing: 0.12em;
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
    gap: 0.6rem 1rem;
    margin-top: 0.15rem;
    font-size: 0.65rem;
    color: var(--faint);
  }

  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .dot.you {
    background: #e8c47c;
  }

  .dot.partner {
    background: #c9b8ff;
  }

  .line {
    width: 13px;
    height: 1.5px;
    border-radius: 2px;
  }

  .line.ease {
    background: #7fcf9d;
  }

  .line.friction {
    background: #ff8a9b;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes draw {
    to {
      stroke-dashoffset: 0;
    }
  }
</style>
