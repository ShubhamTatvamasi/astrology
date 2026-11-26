<script lang="ts">
  interface Props {
    elongation: number;
    size?: number;
    glow?: boolean;
  }

  let { elongation, size = 160, glow = true }: Props = $props();

  const uid = $props.id();
  const r = 50;
  const rad = (elongation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const waxing = elongation < 180;
  const rx = Math.abs(cos) * r;
  const outerSweep = waxing ? 1 : 0;
  const innerSweep = cos > 0 ? 1 - outerSweep : outerSweep;
  const litPath = `M 0 ${-r} A ${r} ${r} 0 0 ${outerSweep} 0 ${r} A ${rx.toFixed(3)} ${r} 0 0 ${innerSweep} 0 ${-r} Z`;
</script>

<svg
  class="moon"
  class:glow
  viewBox="-64 -64 128 128"
  style={`width:${size}px`}
  role="img"
  aria-label={`Moon illustration at ${elongation.toFixed(0)} degrees of elongation`}
>
  <defs>
    <radialGradient id={`lit-${uid}`} cx="38%" cy="32%" r="72%">
      <stop offset="0%" stop-color="#fff8e7" />
      <stop offset="42%" stop-color="#f3ddb0" />
      <stop offset="78%" stop-color="#d8b678" />
      <stop offset="100%" stop-color="#a77f3f" />
    </radialGradient>
    <radialGradient id={`dark-${uid}`} cx="45%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#24233f" />
      <stop offset="100%" stop-color="#0b0c18" />
    </radialGradient>
    <filter id={`blur-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="5" />
    </filter>
    <clipPath id={`clip-${uid}`}>
      <path d={litPath} />
    </clipPath>
  </defs>

  <circle r="57" fill="rgba(232,196,124,.13)" filter={`url(#blur-${uid})`} class="halo" />
  <circle r={r} fill={`url(#dark-${uid})`} stroke="rgba(255,255,255,.12)" stroke-width="0.6" />
  <path d={litPath} fill={`url(#lit-${uid})`} opacity=".18" filter={`url(#blur-${uid})`} />
  <path d={litPath} fill={`url(#lit-${uid})`} />
  <g clip-path={`url(#clip-${uid})`} fill="rgba(84,62,32,.16)">
    <circle cx="-16" cy="-18" r="7.5" />
    <circle cx="11" cy="-6" r="5.2" />
    <circle cx="-7" cy="14" r="9.5" />
    <circle cx="22" cy="21" r="4.2" />
    <circle cx="2" cy="32" r="3.4" />
    <circle cx="28" cy="-26" r="3.6" />
    <circle cx="-27" cy="6" r="4.8" />
  </g>
  <circle r={r} fill="none" stroke="rgba(255,255,255,.08)" stroke-width="0.7" />
</svg>

<style>
  .moon {
    max-width: 100%;
    height: auto;
    overflow: visible;
    display: block;
  }

  .moon.glow {
    filter: drop-shadow(0 0 28px rgba(232, 196, 124, 0.28));
  }

  .halo {
    animation: halo 7s ease-in-out infinite;
    transform-origin: center;
  }

  @keyframes halo {
    0%,
    100% {
      opacity: 0.55;
      transform: scale(1);
    }
    50% {
      opacity: 0.9;
      transform: scale(1.05);
    }
  }
</style>
