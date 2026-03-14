import { useEffect, useRef } from 'react';

export default function SnowCursor() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = '*, *:hover, *:focus, *:active { cursor: none !important; } *[style*="cursor"] { cursor: none !important; }';
    document.head.appendChild(style);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const mouse = { x: -200, y: -200 };
    const prev = { x: -200, y: -200 };
    const particles = [];
    let hovering = false;
    let animId;
    let frame = 0;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e) => {
      prev.x = mouse.x; prev.y = mouse.y;
      mouse.x = e.clientX; mouse.y = e.clientY;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      hovering = !!(el && el.closest('button, a, input, textarea, select, [role="button"]'));

      const dx = mouse.x - prev.x, dy = mouse.y - prev.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      const count = Math.min(Math.floor(speed * 0.6) + 1, 5);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: mouse.x + (Math.random() - 0.5) * 8,
          y: mouse.y + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 1.5 - dx * 0.05,
          vy: (Math.random() - 0.5) * 1.5 - dy * 0.05 + 0.3,
          life: 1,
          decay: 0.03 + Math.random() * 0.03,
          size: 1.5 + Math.random() * 3,
          type: Math.random() > 0.5 ? 'dot' : 'crystal',
        });
      }
    };
    window.addEventListener('mousemove', onMove);

    const drawSnowflakeCursor = (x, y, hov) => {
      const size = hov ? 18 : 13;
      const color = hov ? '#5bb8f5' : '#ffffff';
      const glow = hov ? '#a8d8f0' : '#cce8ff';
      const pulse = Math.sin(frame * 0.08) * 0.15 + 1;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(frame * 0.02);

      // Outer glow
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2 * pulse);
      grad.addColorStop(0, hov ? 'rgba(91,184,245,0.35)' : 'rgba(200,235,255,0.25)');
      grad.addColorStop(1, 'rgba(200,235,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, size * 2 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // 6 arms
      ctx.strokeStyle = color;
      ctx.lineWidth = hov ? 2 : 1.5;
      ctx.shadowColor = glow;
      ctx.shadowBlur = hov ? 10 : 6;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
        ctx.stroke();
        // branches
        const bx = Math.cos(a) * size * 0.55, by = Math.sin(a) * size * 0.55;
        const ba = a + Math.PI / 2;
        const bl = size * 0.3;
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(ba) * bl, by + Math.sin(ba) * bl); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - Math.cos(ba) * bl, by - Math.sin(ba) * bl); ctx.stroke();
      }

      // Center dot
      ctx.beginPath();
      ctx.arc(0, 0, hov ? 3.5 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();
    };

    const drawMiniCrystal = (x, y, size, alpha) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#a8d8f0';
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.05;
        p.life -= p.decay;
        p.size *= 0.97;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        if (p.type === 'crystal') {
          drawMiniCrystal(p.x, p.y, p.size * 1.5, p.life * 0.8);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(p.size, 0.3), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200,235,255,${p.life * 0.9})`;
          ctx.fill();
        }
      }

      drawSnowflakeCursor(mouse.x, mouse.y, hovering);
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      document.head.removeChild(style);
      cancelAnimationFrame(animId);
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
