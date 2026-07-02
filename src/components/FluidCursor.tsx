import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  angle: number;
  angularVelocity: number;
  shapeType: "diamond" | "triangle" | "hexagon" | "circle";
  color: string; // rgba string
}

const COLORS = [
  "rgba(140, 82, 255, 1)",  // Purple
  "rgba(180, 255, 30, 1)",   // Lime
  "rgba(60, 180, 255, 1)",   // Electric blue
];

const SHAPES: ("diamond" | "triangle" | "hexagon" | "circle")[] = [
  "diamond",
  "triangle",
  "hexagon",
  "circle",
];

const FluidCursor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -999, y: -999, active: false });
  const nodes = useRef<Node[]>([]);
  const animFrame = useRef<number>(0);

  // Detect mobile
  const isMobile = useRef(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = 0, h = 0;
    const maxNodes = isMobile.current ? 12 : 28;
    const maxDistance = isMobile.current ? 100 : 150;
    const interactionDist = isMobile.current ? 120 : 180;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      // Cap DPR to 1 on mobile and 1.5 on desktop for optimal rendering performance
      const dpr = isMobile.current ? 1 : Math.min(window.devicePixelRatio, 1.5);
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Re-initialize or adjust node bounds on resize
      initNodes();
    };

    const initNodes = () => {
      if (nodes.current.length > 0) {
        // Just adjust positions if bounds changed
        nodes.current.forEach((n) => {
          n.x = Math.max(10, Math.min(w - 10, n.x));
          n.y = Math.max(10, Math.min(h - 10, n.y));
        });
        return;
      }

      // Populate nodes
      const newNodes: Node[] = [];
      for (let i = 0; i < maxNodes; i++) {
        newNodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * (isMobile.current ? 0.6 : 1.0),
          vy: (Math.random() - 0.5) * (isMobile.current ? 0.6 : 1.0),
          r: (isMobile.current ? 6 : 10) + Math.random() * (isMobile.current ? 10 : 12),
          angle: Math.random() * Math.PI * 2,
          angularVelocity: (Math.random() - 0.5) * 0.02,
          shapeType: SHAPES[Math.floor(Math.random() * SHAPES.length)],
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
      nodes.current = newNodes;
    };

    resize();
    window.addEventListener("resize", resize);

    const drawShape = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      r: number,
      angle: number,
      type: string,
      color: string
    ) => {
      c.save();
      c.translate(x, y);
      c.rotate(angle);
      c.strokeStyle = color;
      c.lineWidth = 1.5;
      
      // Semi-transparent fill matching stroke color
      c.fillStyle = color.replace("1)", "0.06)");

      c.beginPath();
      if (type === "diamond") {
        c.moveTo(0, -r);
        c.lineTo(r * 0.7, 0);
        c.lineTo(0, r);
        c.lineTo(-r * 0.7, 0);
      } else if (type === "triangle") {
        c.moveTo(0, -r);
        c.lineTo(r * 0.86, r * 0.5);
        c.lineTo(-r * 0.86, r * 0.5);
      } else if (type === "hexagon") {
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (i === 0) c.moveTo(px, py);
          else c.lineTo(px, py);
        }
      } else {
        c.arc(0, 0, r, 0, Math.PI * 2);
      }
      c.closePath();
      c.fill();
      c.stroke();
      c.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "screen";

      const mx = mouse.current.x;
      const my = mouse.current.y;
      const isInteractionActive = mouse.current.active && mx > 0 && mx < w && my > 0 && my < h;

      // 1. Move and draw nodes
      nodes.current.forEach((n) => {
        // Slow movement bounds bounce
        n.x += n.vx;
        n.y += n.vy;
        n.angle += n.angularVelocity;

        if (n.x < n.r) { n.x = n.r; n.vx *= -1; }
        if (n.x > w - n.r) { n.x = w - n.r; n.vx *= -1; }
        if (n.y < n.r) { n.y = n.r; n.vy *= -1; }
        if (n.y > h - n.r) { n.y = h - n.r; n.vy *= -1; }

        // Interaction (gentle attraction to mouse/touch)
        if (isInteractionActive) {
          const dx = mx - n.x;
          const dy = my - n.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < interactionDist) {
            const force = (interactionDist - dist) / interactionDist * 0.03;
            n.vx += (dx / dist) * force;
            n.vy += (dy / dist) * force;

            // Speed limit
            const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
            const limit = isMobile.current ? 1.0 : 1.8;
            if (speed > limit) {
              n.vx = (n.vx / speed) * limit;
              n.vy = (n.vy / speed) * limit;
            }
          }
        }

        drawShape(ctx, n.x, n.y, n.r, n.angle, n.shapeType, n.color);
      });

      // 2. Draw crystal lines (node network)
      const len = nodes.current.length;
      for (let i = 0; i < len; i++) {
        const nodeA = nodes.current[i];
        for (let j = i + 1; j < len; j++) {
          const nodeB = nodes.current[j];
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * (isMobile.current ? 0.22 : 0.35);
            // Blend line color based on electric blue
            ctx.strokeStyle = `rgba(90, 200, 255, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.stroke();
          }
        }

        // Draw connection to user mouse/touch pointer
        if (isInteractionActive) {
          const dx = nodeA.x - mx;
          const dy = nodeA.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < interactionDist) {
            const alpha = (1 - dist / interactionDist) * (isMobile.current ? 0.3 : 0.45);
            ctx.strokeStyle = `rgba(180, 255, 30, ${alpha})`; // Lime connector for interactive feel
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(mx, my);
            ctx.stroke();
          }
        }
      }

      ctx.globalCompositeOperation = "source-over";
      animFrame.current = requestAnimationFrame(animate);
    };

    animFrame.current = requestAnimationFrame(animate);

    // Event handlers
    const section = canvas.parentElement;

    const onMouseMove = (e: MouseEvent) => {
      if (!section) return;
      const rect = section.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
      mouse.current.active = true;
    };

    const onMouseLeave = () => {
      mouse.current.active = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (!section || e.touches.length === 0) return;
      const rect = section.getBoundingClientRect();
      const touch = e.touches[0];
      mouse.current.x = touch.clientX - rect.left;
      mouse.current.y = touch.clientY - rect.top;
      mouse.current.active = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!section || e.touches.length === 0) return;
      const rect = section.getBoundingClientRect();
      const touch = e.touches[0];
      mouse.current.x = touch.clientX - rect.left;
      mouse.current.y = touch.clientY - rect.top;
    };

    const onTouchEnd = () => {
      mouse.current.active = false;
    };

    section?.addEventListener("mousemove", onMouseMove);
    section?.addEventListener("mouseleave", onMouseLeave);
    
    // Passive touch handlers so scroll is never blocked
    section?.addEventListener("touchstart", onTouchStart, { passive: true });
    section?.addEventListener("touchmove", onTouchMove, { passive: true });
    section?.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      cancelAnimationFrame(animFrame.current);
      window.removeEventListener("resize", resize);
      section?.removeEventListener("mousemove", onMouseMove);
      section?.removeEventListener("mouseleave", onMouseLeave);
      section?.removeEventListener("touchstart", onTouchStart);
      section?.removeEventListener("touchmove", onTouchMove);
      section?.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[1] pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
};

export default FluidCursor;
