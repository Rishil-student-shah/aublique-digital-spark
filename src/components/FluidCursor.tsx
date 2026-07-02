import { useEffect, useRef, useCallback } from "react";

interface FluidParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  color: [number, number, number];
  stretch: number;
  angle: number;
}

const FLUID_COLORS: [number, number, number][] = [
  [140, 82, 255],   // Purple #8C52FF
  [160, 100, 255],  // Lighter purple
  [180, 255, 30],   // Lime
  [60, 180, 255],   // Electric blue
];

const FluidCursor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrame = useRef<number>(0);
  const phase = useRef(0);
  const idleFrames = useRef(0);

  // Detect mobile user agent
  const isMobile = useRef(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

  const fluidParticles = useRef<FluidParticle[]>([]);
  const fluidMouse = useRef({ x: -999, y: -999, px: -999, py: -999 });
  const maxFluidParticles = 75;

  const spawnFluidParticles = useCallback((x: number, y: number, vx: number, vy: number) => {
    const speed = Math.sqrt(vx * vx + vy * vy);
    const count = Math.min(2 + Math.floor(speed * 0.1), 5);

    for (let i = 0; i < count; i++) {
      const angle = Math.atan2(vy, vx) + (Math.random() - 0.5) * 1.2;
      const spread = Math.random() * 15;
      const color = FLUID_COLORS[Math.floor(Math.random() * FLUID_COLORS.length)];
      const maxLife = 50 + Math.random() * 60;
      const stretch = Math.min(1 + speed * 0.025, 2.8);

      fluidParticles.current.push({
        x: x + Math.cos(angle) * spread,
        y: y + Math.sin(angle) * spread,
        vx: vx * 0.06 + (Math.random() - 0.5) * 1,
        vy: vy * 0.06 + (Math.random() - 0.5) * 1,
        life: maxLife,
        maxLife,
        radius: 25 + Math.random() * 45,
        color,
        stretch,
        angle: Math.atan2(vy, vx),
      });
    }

    if (fluidParticles.current.length > maxFluidParticles) {
      fluidParticles.current.splice(0, fluidParticles.current.length - maxFluidParticles);
    }
  }, []);

  useEffect(() => {
    // If mobile, do not initialize canvas or bind events
    if (isMobile.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = 0, h = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "screen";
      phase.current += 0.006;
      idleFrames.current++;

      const mx = fluidMouse.current.x;
      const my = fluidMouse.current.y;
      const isOnCanvas = mx > 0 && mx < w && my > 0 && my < h;

      // Radial glow at cursor
      if (isOnCanvas) {
        const glowR = 90 + 15 * Math.sin(phase.current * 3);
        const glowAlpha = 0.08 + 0.02 * Math.sin(phase.current * 2);
        const gg = ctx.createRadialGradient(mx, my, 0, mx, my, glowR);
        gg.addColorStop(0, `rgba(140,82,255,${glowAlpha})`);
        gg.addColorStop(0.5, `rgba(60,180,255,${glowAlpha * 0.4})`);
        gg.addColorStop(1, `rgba(140,82,255,0)`);
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.arc(mx, my, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Spontaneous static particles
        if (idleFrames.current > 10 && idleFrames.current % 8 === 0) {
          const color = FLUID_COLORS[Math.floor(Math.random() * FLUID_COLORS.length)];
          const a = Math.random() * Math.PI * 2;
          fluidParticles.current.push({
            x: mx + Math.cos(a) * 10,
            y: my + Math.sin(a) * 8,
            vx: Math.cos(a) * 0.4,
            vy: Math.sin(a) * 0.4,
            life: 70 + Math.random() * 40,
            maxLife: 110,
            radius: 25 + Math.random() * 25,
            color,
            stretch: 1,
            angle: a,
          });
          if (fluidParticles.current.length > maxFluidParticles) {
            fluidParticles.current.splice(0, fluidParticles.current.length - maxFluidParticles);
          }
        }
      }

      // Draw and update fluid particles
      const ps = fluidParticles.current;
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        if (--p.life <= 0) {
          ps.splice(i, 1);
          continue;
        }

        p.vx *= 0.95;
        p.vy *= 0.95;
        p.vx += Math.sin(phase.current + p.y * 0.004) * 0.06;
        p.vy += Math.cos(phase.current + p.x * 0.004) * 0.04;
        p.x += p.vx;
        p.y += p.vy;
        p.stretch += (1 - p.stretch) * 0.04;

        const t = p.life / p.maxLife;
        const alpha = Math.min(t * 3, 1) * t * 0.16;
        const r = p.radius * (0.85 + 0.15 * Math.sin(phase.current * 2 + i));

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.scale(p.stretch, 1 / Math.sqrt(p.stretch));

        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        const [cr, cg, cb] = p.color;
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha})`);
        g.addColorStop(0.45, `rgba(${cr},${cg},${cb},${alpha * 0.4})`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Ambient blobs when idle on desktop
      if (idleFrames.current > 90 && Math.random() < 0.02 && ps.length < 20) {
        const color = FLUID_COLORS[Math.floor(Math.random() * FLUID_COLORS.length)];
        ps.push({
          x: w * 0.15 + Math.random() * w * 0.7,
          y: h * 0.15 + Math.random() * h * 0.7,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          life: 100 + Math.random() * 50,
          maxLife: 150,
          radius: 50 + Math.random() * 35,
          color,
          stretch: 1,
          angle: Math.random() * Math.PI * 2,
        });
      }

      ctx.globalCompositeOperation = "source-over";
      animFrame.current = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);

    const section = canvas.parentElement;

    const onMouseMove = (e: MouseEvent) => {
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const vx = x - fluidMouse.current.px;
      const vy = y - fluidMouse.current.py;

      fluidMouse.current.px = fluidMouse.current.x;
      fluidMouse.current.py = fluidMouse.current.y;
      fluidMouse.current.x = x;
      fluidMouse.current.y = y;
      idleFrames.current = 0;

      spawnFluidParticles(x, y, vx, vy);
    };

    const onMouseLeave = () => {
      fluidMouse.current.x = -999;
      fluidMouse.current.y = -999;
    };

    section?.addEventListener("mousemove", onMouseMove);
    section?.addEventListener("mouseleave", onMouseLeave);

    animFrame.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrame.current);
      window.removeEventListener("resize", resize);
      section?.removeEventListener("mousemove", onMouseMove);
      section?.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [spawnFluidParticles]);

  if (isMobile.current) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[1] pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
};

export default FluidCursor;
