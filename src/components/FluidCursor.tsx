import { useEffect, useRef, useCallback } from "react";

interface Particle {
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

const COLORS: [number, number, number][] = [
  [140, 82, 255],   // Purple #8C52FF
  [160, 100, 255],  // Lighter purple
  [180, 255, 30],   // Lime
  [60, 180, 255],   // Electric blue
];

const FluidCursor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -999, y: -999, px: -999, py: -999, isDown: false });
  const animFrame = useRef<number>(0);
  const phase = useRef(0);
  const idleFrames = useRef(0);
  const isLoopRunning = useRef(false);

  // Detect mobile device
  const isMobile = useRef(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  const maxParticles = isMobile.current ? 35 : 75;

  const spawnParticles = useCallback((x: number, y: number, vx: number, vy: number) => {
    const speed = Math.sqrt(vx * vx + vy * vy);
    // Fewer particles on mobile for performance boost
    const count = Math.min(1 + Math.floor(speed * 0.08), isMobile.current ? 2 : 4);

    for (let i = 0; i < count; i++) {
      const angle = Math.atan2(vy, vx) + (Math.random() - 0.5) * 1.2;
      const spread = Math.random() * (isMobile.current ? 8 : 15);
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const maxLife = (isMobile.current ? 35 : 50) + Math.random() * (isMobile.current ? 40 : 60);
      const stretch = Math.min(1 + speed * 0.02, 2.5);

      particles.current.push({
        x: x + Math.cos(angle) * spread,
        y: y + Math.sin(angle) * spread,
        vx: vx * 0.05 + (Math.random() - 0.5) * 0.8,
        vy: vy * 0.05 + (Math.random() - 0.5) * 0.8,
        life: maxLife,
        maxLife,
        radius: (isMobile.current ? 15 : 25) + Math.random() * (isMobile.current ? 25 : 45),
        color,
        stretch,
        angle: Math.atan2(vy, vx),
      });
    }

    if (particles.current.length > maxParticles) {
      particles.current.splice(0, particles.current.length - maxParticles);
    }
  }, [maxParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = 0, h = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      // Lower DPR on mobile for massive pixel fill-rate gains (no lag)
      const dpr = isMobile.current ? 1 : Math.min(window.devicePixelRatio, 1.5);
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const section = canvas.parentElement;

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "screen";
      phase.current += 0.008;
      idleFrames.current++;

      const mx = mouse.current.x;
      const my = mouse.current.y;
      const isOnCanvas = mx > 0 && mx < w && my > 0 && my < h;

      // Glow at active cursor/touch position
      if (isOnCanvas && (mouse.current.isDown || !isMobile.current)) {
        const glowR = (isMobile.current ? 60 : 90) + 15 * Math.sin(phase.current * 3);
        const glowAlpha = (isMobile.current ? 0.05 : 0.08) + 0.02 * Math.sin(phase.current * 2);
        const gg = ctx.createRadialGradient(mx, my, 0, mx, my, glowR);
        gg.addColorStop(0, `rgba(140,82,255,${glowAlpha})`);
        gg.addColorStop(0.5, `rgba(60,180,255,${glowAlpha * 0.4})`);
        gg.addColorStop(1, `rgba(140,82,255,0)`);
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.arc(mx, my, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Spawn occasional particles while static but active
        if (idleFrames.current > 15 && idleFrames.current % (isMobile.current ? 12 : 8) === 0) {
          const color = COLORS[Math.floor(Math.random() * COLORS.length)];
          const a = Math.random() * Math.PI * 2;
          particles.current.push({
            x: mx + Math.cos(a) * 8,
            y: my + Math.sin(a) * 8,
            vx: Math.cos(a) * 0.3,
            vy: Math.sin(a) * 0.3,
            life: 60 + Math.random() * 40,
            maxLife: 100,
            radius: (isMobile.current ? 15 : 25) + Math.random() * 20,
            color,
            stretch: 1,
            angle: a,
          });
          if (particles.current.length > maxParticles) {
            particles.current.splice(0, particles.current.length - maxParticles);
          }
        }
      }

      const ps = particles.current;
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        if (--p.life <= 0) {
          ps.splice(i, 1);
          continue;
        }

        p.vx *= 0.94;
        p.vy *= 0.94;
        p.vx += Math.sin(phase.current + p.y * 0.005) * 0.05;
        p.vy += Math.cos(phase.current + p.x * 0.005) * 0.03;
        p.x += p.vx;
        p.y += p.vy;
        p.stretch += (1 - p.stretch) * 0.04;

        const t = p.life / p.maxLife;
        const alpha = Math.min(t * 3, 1) * t * (isMobile.current ? 0.12 : 0.16);
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

      // Ambient blobs only on desktop if fully idle
      if (!isMobile.current && idleFrames.current > 120 && Math.random() < 0.015 && ps.length < 15) {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        ps.push({
          x: w * 0.2 + Math.random() * w * 0.6,
          y: h * 0.2 + Math.random() * h * 0.6,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          life: 120 + Math.random() * 60,
          maxLife: 180,
          radius: 50 + Math.random() * 30,
          color,
          stretch: 1,
          angle: Math.random() * Math.PI * 2,
        });
      }

      ctx.globalCompositeOperation = "source-over";

      // Stop loop if no particles are rendering and no active interaction is ongoing
      if (ps.length > 0 || (isOnCanvas && (mouse.current.isDown || !isMobile.current))) {
        animFrame.current = requestAnimationFrame(animate);
      } else {
        isLoopRunning.current = false;
        ctx.clearRect(0, 0, w, h);
      }
    };

    const triggerAnimate = () => {
      if (!isLoopRunning.current) {
        isLoopRunning.current = true;
        animFrame.current = requestAnimationFrame(animate);
      }
    };

    // Mouse handlers
    const onMouseMove = (e: MouseEvent) => {
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const vx = x - mouse.current.px;
      const vy = y - mouse.current.py;
      
      mouse.current.px = mouse.current.x;
      mouse.current.py = mouse.current.y;
      mouse.current.x = x;
      mouse.current.y = y;
      idleFrames.current = 0;

      if (mouse.current.px !== -999) {
        spawnParticles(x, y, vx, vy);
      }
      triggerAnimate();
    };

    const onMouseEnter = () => {
      idleFrames.current = 0;
      triggerAnimate();
    };

    const onMouseLeave = () => {
      mouse.current.x = -999;
      mouse.current.y = -999;
    };

    // Touch handlers
    const onTouchStart = (e: TouchEvent) => {
      if (!section || e.touches.length === 0) return;
      const rect = section.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      mouse.current.isDown = true;
      mouse.current.x = x;
      mouse.current.y = y;
      mouse.current.px = x;
      mouse.current.py = y;
      idleFrames.current = 0;
      triggerAnimate();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!section || e.touches.length === 0) return;
      const rect = section.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      const vx = x - mouse.current.px;
      const vy = y - mouse.current.py;

      mouse.current.px = mouse.current.x;
      mouse.current.py = mouse.current.y;
      mouse.current.x = x;
      mouse.current.y = y;
      idleFrames.current = 0;

      spawnParticles(x, y, vx, vy);
      triggerAnimate();
    };

    const onTouchEnd = () => {
      mouse.current.isDown = false;
      mouse.current.x = -999;
      mouse.current.y = -999;
    };

    // Listeners
    section?.addEventListener("mousemove", onMouseMove);
    section?.addEventListener("mouseenter", onMouseEnter);
    section?.addEventListener("mouseleave", onMouseLeave);

    // Passive touch listeners to ensure scrolling is never blocked
    section?.addEventListener("touchstart", onTouchStart, { passive: true });
    section?.addEventListener("touchmove", onTouchMove, { passive: true });
    section?.addEventListener("touchend", onTouchEnd, { passive: true });

    // Initial render trigger
    triggerAnimate();

    return () => {
      cancelAnimationFrame(animFrame.current);
      window.removeEventListener("resize", resize);
      section?.removeEventListener("mousemove", onMouseMove);
      section?.removeEventListener("mouseenter", onMouseEnter);
      section?.removeEventListener("mouseleave", onMouseLeave);
      section?.removeEventListener("touchstart", onTouchStart);
      section?.removeEventListener("touchmove", onTouchMove);
      section?.removeEventListener("touchend", onTouchEnd);
    };
  }, [spawnParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[1] pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
};

export default FluidCursor;
