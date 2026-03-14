import { useEffect, useRef } from 'react';

export default function SpaceshipCursor() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -200, y: -200 });
  const prev = useRef({ x: -200, y: -200 });
  const particles = useRef([]);
  const animId = useRef(null);
  const hovering = useRef(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = '*, *:hover, *:focus, *:active { cursor: none !important; } *[style*="cursor"] { cursor: none !important; }';
    document.head.appendChild(style);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e) => {
      prev.current = { ...mouse.current };
      mouse.current = { x: e.clientX, y: e.clientY };

      // Detect if over a clickable element
      const el = document.elementFromPoint(e.clientX, e.clientY);
      hovering.current = !!(el && el.closest('button, a, input, textarea, select, [role="button"]'));

      const dx = mouse.current.x - prev.current.x;
      const dy = mouse.current.y - prev.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      const count = Math.min(Math.floor(speed * 0.8) + 1, 6);

      for (let i = 0; i < count; i++) {
        const spread = (Math.random() - 0.5) * 10;
        const isHov = hovering.current;
        const colors = isHov
          ? [
              `rgba(255,220,0,`,
              `rgba(255,160,0,`,
              `rgba(255,255,100,`,
            ]
          : [
              `rgba(255,${100 + Math.random() * 80 | 0},0,`,
              `rgba(255,${180 + Math.random() * 60 | 0},0,`,
              `rgba(0,245,255,`,
              `rgba(255,255,${100 + Math.random() * 100 | 0},`,
            ];
        particles.current.push({
          x: mouse.current.x + spread,
          y: mouse.current.y + spread,
          vx: -dx * (0.1 + Math.random() * 0.15),
          vy: -dy * (0.1 + Math.random() * 0.15),
          life: 1,
          decay: 0.04 + Math.random() * 0.04,
          size: 2 + Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    window.addEventListener('mousemove', onMove);

    const drawShip = (x, y, angle, highlight) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + Math.PI / 2);

      const accent   = highlight ? '#ffdd00' : '#00f5ff';
      const bodyTop  = highlight ? '#ffffff' : '#e2e8f0';
      const bodyBot  = highlight ? '#fbbf24' : '#64748b';
      const wingCol  = highlight ? '#f59e0b' : '#94a3b8';
      const glowRGB  = highlight ? '255,200,0' : '0,245,255';
      const glowSize = highlight ? 22 : 14;
      const glowAlpha= highlight ? 0.75 : 0.4;

      // Outer halo on hover
      if (highlight) {
        const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
        halo.addColorStop(0, 'rgba(255,220,0,0.2)');
        halo.addColorStop(1, 'rgba(255,220,0,0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fill();
      }

      // Engine glow
      const glow = ctx.createRadialGradient(0, 8, 0, 0, 8, glowSize);
      glow.addColorStop(0, `rgba(${glowRGB},${glowAlpha})`);
      glow.addColorStop(1, `rgba(${glowRGB},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 8, glowSize, 0, Math.PI * 2);
      ctx.fill();

      // Ship body
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(7, 8);
      ctx.lineTo(3, 5);
      ctx.lineTo(0, 7);
      ctx.lineTo(-3, 5);
      ctx.lineTo(-7, 8);
      ctx.closePath();
      const bodyGrad = ctx.createLinearGradient(0, -14, 0, 8);
      bodyGrad.addColorStop(0, bodyTop);
      bodyGrad.addColorStop(1, bodyBot);
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Glowing outline on hover
      if (highlight) {
        ctx.shadowColor = '#ffdd00';
        ctx.shadowBlur = 12;
        ctx.strokeStyle = '#ffdd00';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Wings
      ctx.beginPath();
      ctx.moveTo(-3, 2);
      ctx.lineTo(-12, 10);
      ctx.lineTo(-5, 6);
      ctx.closePath();
      ctx.fillStyle = wingCol;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(3, 2);
      ctx.lineTo(12, 10);
      ctx.lineTo(5, 6);
      ctx.closePath();
      ctx.fillStyle = wingCol;
      ctx.fill();

      // Cockpit
      ctx.beginPath();
      ctx.ellipse(0, -4, 3, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = highlight ? 'rgba(255,220,0,0.95)' : `rgba(0,245,255,0.7)`;
      ctx.fill();

      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current = particles.current.filter(p => p.life > 0);
      particles.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        p.size *= 0.96;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(p.size, 0.1), 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.life.toFixed(2)})`;
        ctx.fill();
      });

      const dx = mouse.current.x - prev.current.x;
      const dy = mouse.current.y - prev.current.y;
      const angle = Math.atan2(dy, dx);

      drawShip(mouse.current.x, mouse.current.y, angle, hovering.current);

      animId.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      document.head.removeChild(style);
      cancelAnimationFrame(animId.current);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }}
    />
  );
}
