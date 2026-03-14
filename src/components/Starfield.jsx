import { useEffect, useRef } from 'react';

export default function Starfield() {
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

    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.2,
      speed: Math.random() * 0.25 + 0.05,
      opacity: Math.random(),
      twinkle: Math.random() * 0.015,
    }));

    const nebulae = [
      { x: 0.15, y: 0.25, r: 320, color: 'rgba(168,85,247,0.045)' },
      { x: 0.82, y: 0.65, r: 380, color: 'rgba(0,245,255,0.03)' },
      { x: 0.5,  y: 0.5,  r: 420, color: 'rgba(59,130,246,0.025)' },
    ];

    const meteors = [];
    const spawnMeteor = () => {
      meteors.push({
        x: Math.random() * canvas.width,
        y: -10,
        len: Math.random() * 220 + 120,
        speed: Math.random() * 5 + 4,
        opacity: 1,
        width: Math.random() * 2 + 1.5,
        color: Math.random() > 0.5 ? '0,245,255' : '168,85,247',
      });
    };

    spawnMeteor(); spawnMeteor();

    let meteorTimeout;
    const scheduleMeteor = () => {
      meteorTimeout = setTimeout(() => {
        spawnMeteor();
        scheduleMeteor();
      }, Math.random() * 3000 + 2500);
    };
    scheduleMeteor();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nebulae.forEach(n => {
        const g = ctx.createRadialGradient(
          n.x * canvas.width, n.y * canvas.height, 0,
          n.x * canvas.width, n.y * canvas.height, n.r
        );
        g.addColorStop(0, n.color);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.speed * 1.4;
        m.y += m.speed;
        m.opacity -= 0.005;
        if (m.opacity <= 0) { meteors.splice(i, 1); continue; }

        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.len * 1.4, m.y - m.len);
        grad.addColorStop(0, `rgba(${m.color},${m.opacity})`);
        grad.addColorStop(1, `rgba(${m.color},0)`);

        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.len * 1.4, m.y - m.len);
        ctx.strokeStyle = grad;
        ctx.lineWidth = m.width;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.width * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${m.opacity})`;
        ctx.fill();
      }

      stars.forEach(s => {
        s.opacity += s.twinkle;
        if (s.opacity > 1 || s.opacity < 0) s.twinkle *= -1;
        s.y += s.speed;
        if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.abs(s.opacity)})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(meteorTimeout);
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
