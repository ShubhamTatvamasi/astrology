<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;

  onMount(() => {
    const el = canvas;
    const ctx = el.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let last = 0;
    let meteorTimer = 2;

    interface Star {
      x: number;
      y: number;
      z: number;
      r: number;
      base: number;
      phase: number;
      speed: number;
      color: string;
    }

    interface Meteor {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      max: number;
    }

    let stars: Star[] = [];
    let meteors: Meteor[] = [];

    const palette = [
      '255, 255, 255',
      '255, 244, 216',
      '232, 196, 124',
      '201, 184, 255',
      '159, 199, 255',
    ];

    function build() {
      const area = width * height;
      const count = Math.max(90, Math.min(270, Math.round(area / 8600)));
      stars = Array.from({ length: count }, () => {
        const z = 0.25 + Math.random() * 0.75;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          z,
          r: (0.35 + Math.random() * 1.25) * z,
          base: 0.18 + Math.random() * 0.6,
          phase: Math.random() * Math.PI * 2,
          speed: 0.15 + Math.random() * 0.5,
          color: palette[Math.floor(Math.random() * palette.length)]!,
        };
      });
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      el.width = Math.floor(width * dpr);
      el.height = Math.floor(height * dpr);
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      if (reduced) draw(0);
    }

    function draw(time: number) {
      ctx!.clearRect(0, 0, width, height);
      pointer.x += (pointer.tx - pointer.x) * 0.035;
      pointer.y += (pointer.ty - pointer.y) * 0.035;

      for (const star of stars) {
        const px = star.x + pointer.x * 18 * star.z;
        const py = star.y + pointer.y * 18 * star.z;
        const twinkle = 0.55 + 0.45 * Math.sin(time * 0.001 * star.speed + star.phase);
        const alpha = star.base * (reduced ? 1 : twinkle);

        if (star.r > 1.25) {
          const g = ctx!.createRadialGradient(px, py, 0, px, py, star.r * 5);
          g.addColorStop(0, `rgba(${star.color},${alpha})`);
          g.addColorStop(0.35, `rgba(${star.color},${alpha * 0.35})`);
          g.addColorStop(1, `rgba(${star.color},0)`);
          ctx!.fillStyle = g;
          ctx!.beginPath();
          ctx!.arc(px, py, star.r * 5, 0, Math.PI * 2);
          ctx!.fill();
        }

        ctx!.fillStyle = `rgba(${star.color},${alpha})`;
        ctx!.beginPath();
        ctx!.arc(px, py, star.r, 0, Math.PI * 2);
        ctx!.fill();
      }

      if (!reduced) {
        for (const m of meteors) {
          const progress = 1 - m.life / m.max;
          const alpha = Math.sin(progress * Math.PI) * 0.8;
          const tailX = m.x - m.vx * 0.09;
          const tailY = m.y - m.vy * 0.09;
          const gradient = ctx!.createLinearGradient(m.x, m.y, tailX, tailY);
          gradient.addColorStop(0, `rgba(255, 244, 216, ${alpha})`);
          gradient.addColorStop(1, 'rgba(255, 244, 216, 0)');
          ctx!.strokeStyle = gradient;
          ctx!.lineWidth = 1.4;
          ctx!.beginPath();
          ctx!.moveTo(m.x, m.y);
          ctx!.lineTo(tailX, tailY);
          ctx!.stroke();
          m.x += m.vx;
          m.y += m.vy;
          m.life -= 1;
        }
        meteors = meteors.filter((m) => m.life > 0);
      }
    }

    function frame(time: number) {
      const delta = Math.min(50, time - last || 16);
      last = time;
      if (!document.hidden) {
        if (!reduced) {
          meteorTimer -= delta / 1000;
          if (meteorTimer <= 0) {
            meteorTimer = 5 + Math.random() * 9;
            const startX = width * (0.2 + Math.random() * 0.7);
            const startY = height * (0.05 + Math.random() * 0.35);
            const angle = Math.PI * (0.72 + Math.random() * 0.12);
            const speed = 5 + Math.random() * 4;
            meteors.push({
              x: startX,
              y: startY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 42,
              max: 42,
            });
          }
        }
        draw(time);
      }
      raf = requestAnimationFrame(frame);
    }

    function onPointerMove(event: PointerEvent) {
      pointer.tx = (event.clientX / Math.max(width, 1) - 0.5) * 2;
      pointer.ty = (event.clientY / Math.max(height, 1) - 0.5) * 2;
    }

    const onResize = () => resize();
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    resize();
    if (!reduced) raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
    };
  });
</script>

<canvas bind:this={canvas} class="starfield" aria-hidden="true"></canvas>

<style>
  .starfield {
    position: fixed;
    inset: 0;
    z-index: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    opacity: 0.85;
  }
</style>
