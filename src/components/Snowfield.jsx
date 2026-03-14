import { useEffect, useRef } from 'react';

function randBetween(a, b) { return a + Math.random() * (b - a); }

export default function Snowfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // ── Snowflakes ──
    const flakes = Array.from({ length: 280 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: randBetween(1.5, 5.5),
      speed: randBetween(0.6, 2.2),
      drift: randBetween(-0.4, 0.4),
      opacity: randBetween(0.4, 1),
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: randBetween(0.01, 0.03),
    }));

    // ── Snowballs (large slow ones) ──
    const balls = Array.from({ length: 12 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: randBetween(14, 32),
      speed: randBetween(0.15, 0.5),
      drift: randBetween(-0.15, 0.15),
      opacity: randBetween(0.12, 0.28),
    }));

    // ── Sparkle crystals ──
    const crystals = Array.from({ length: 18 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: randBetween(6, 14),
      speed: randBetween(0.3, 0.9),
      drift: randBetween(-0.2, 0.2),
      rot: Math.random() * Math.PI * 2,
      rotSpeed: randBetween(-0.02, 0.02),
      opacity: randBetween(0.3, 0.7),
    }));

    // ── Burst particles ──
    const bursts = [];
    let burstTimer = 0;

    const spawnBurst = () => {
      const bx = Math.random() * canvas.width;
      const by = randBetween(canvas.height * 0.1, canvas.height * 0.6);
      for (let i = 0; i < 18; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = randBetween(1.5, 4.5);
        bursts.push({
          x: bx, y: by,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          r: randBetween(2, 5),
          life: 1,
          decay: randBetween(0.012, 0.022),
        });
      }
    };

    const drawCrystal = (x, y, size, rot, opacity) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = '#a8d8f0';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
        ctx.stroke();
        // small branches
        const bx = Math.cos(a) * size * 0.55;
        const by = Math.sin(a) * size * 0.55;
        const ba = a + Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(ba) * size * 0.28, by + Math.sin(ba) * size * 0.28);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx - Math.cos(ba) * size * 0.28, by - Math.sin(ba) * size * 0.28);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Soft blue-white gradient blobs (like snow clouds)
      [
        { x: 0.2, y: 0.15, r: 400, c: 'rgba(180,220,255,0.07)' },
        { x: 0.75, y: 0.4,  r: 350, c: 'rgba(200,235,255,0.05)' },
        { x: 0.5,  y: 0.8,  r: 300, c: 'rgba(210,240,255,0.06)' },
      ].forEach(n => {
        const g = ctx.createRadialGradient(n.x * canvas.width, n.y * canvas.height, 0, n.x * canvas.width, n.y * canvas.height, n.r);
        g.addColorStop(0, n.c);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Snowballs (large blurry)
      balls.forEach(b => {
        b.y += b.speed;
        b.x += b.drift;
        if (b.y - b.r > canvas.height) { b.y = -b.r; b.x = Math.random() * canvas.width; }
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, `rgba(255,255,255,${b.opacity})`);
        g.addColorStop(0.6, `rgba(220,240,255,${b.opacity * 0.5})`);
        g.addColorStop(1, 'rgba(200,230,255,0)');
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      // Snowflakes
      flakes.forEach(f => {
        f.wobble += f.wobbleSpeed;
        f.y += f.speed;
        f.x += f.drift + Math.sin(f.wobble) * 0.5;
        if (f.y - f.r > canvas.height) { f.y = -f.r; f.x = Math.random() * canvas.width; }
        if (f.x < -f.r) f.x = canvas.width + f.r;
        if (f.x > canvas.width + f.r) f.x = -f.r;

        const g = ctx.createRadialGradient(f.x - f.r * 0.3, f.y - f.r * 0.3, 0, f.x, f.y, f.r);
        g.addColorStop(0, `rgba(255,255,255,${f.opacity})`);
        g.addColorStop(1, `rgba(180,220,255,${f.opacity * 0.3})`);
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      // Crystals
      crystals.forEach(c => {
        c.y += c.speed;
        c.x += c.drift;
        c.rot += c.rotSpeed;
        if (c.y > canvas.height + 20) { c.y = -20; c.x = Math.random() * canvas.width; }
        drawCrystal(c.x, c.y, c.size, c.rot, c.opacity);
      });

      // Burst particles
      burstTimer++;
      if (burstTimer > 180) { spawnBurst(); burstTimer = 0; }

      for (let i = bursts.length - 1; i >= 0; i--) {
        const p = bursts[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.08;
        p.life -= p.decay;
        if (p.life <= 0) { bursts.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.life * 0.9})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}
