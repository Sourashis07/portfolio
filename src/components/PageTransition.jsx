import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { playWarp } from '../sounds';

// ── Dark mode: rocket on lemniscate ──────────────────────
function InfinityCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const a = Math.min(canvas.width * 0.22, 200);
    let t = 0, animId;
    const trail = [];

    const getPos = (angle) => ({
      x: cx + (a * Math.cos(angle)) / (1 + Math.sin(angle) ** 2),
      y: cy + (a * Math.sin(angle) * Math.cos(angle)) / (1 + Math.sin(angle) ** 2),
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      for (let i = 0; i <= 628; i++) {
        const p = getPos((i / 628) * Math.PI * 2);
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = 'rgba(0,245,255,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      const pos = getPos(t);
      const next = getPos(t + 0.01);
      const angle = Math.atan2(next.y - pos.y, next.x - pos.x);
      trail.push({ x: pos.x, y: pos.y });
      if (trail.length > 48) trail.shift();
      trail.forEach((pt, i) => {
        const alpha = (i / trail.length) * 0.6;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, Math.max((i / trail.length) * 3, 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,245,255,${alpha})`;
        ctx.fill();
      });

      drawRocket(ctx, pos.x, pos.y, angle);
      t += 0.022;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}

function drawRocket(ctx, x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI / 2);
  ctx.scale(1.6, 1.6);
  const glow = ctx.createRadialGradient(0, 8, 0, 0, 8, 14);
  glow.addColorStop(0, 'rgba(0,245,255,0.5)');
  glow.addColorStop(1, 'rgba(0,245,255,0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(0, 8, 14, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-3, 7); ctx.lineTo(0, 14 + Math.random() * 4); ctx.lineTo(3, 7); ctx.closePath();
  ctx.fillStyle = `rgba(255,${140 + Math.random() * 80 | 0},0,0.9)`; ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(7, 8); ctx.lineTo(3, 5); ctx.lineTo(0, 7); ctx.lineTo(-3, 5); ctx.lineTo(-7, 8); ctx.closePath();
  const bg = ctx.createLinearGradient(0, -14, 0, 8);
  bg.addColorStop(0, '#ffffff'); bg.addColorStop(1, '#64748b');
  ctx.fillStyle = bg; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-3, 2); ctx.lineTo(-12, 10); ctx.lineTo(-5, 6); ctx.closePath(); ctx.fillStyle = '#94a3b8'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(3, 2); ctx.lineTo(12, 10); ctx.lineTo(5, 6); ctx.closePath(); ctx.fillStyle = '#94a3b8'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -4, 3, 5, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,245,255,0.8)'; ctx.fill();
  ctx.restore();
}

// ── Light mode: snowflake spiraling inward ────────────────
function SnowSpiralCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    let t = 0, animId;
    const trail = [];
    const flakes = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: 1 + Math.random() * 3, speed: 0.5 + Math.random() * 1.5,
      drift: (Math.random() - 0.5) * 0.5, opacity: 0.3 + Math.random() * 0.5,
    }));

    const getPos = (angle) => {
      const radius = 180 * (1 - (t % (Math.PI * 4)) / (Math.PI * 4));
      return {
        x: cx + Math.cos(angle) * Math.max(radius, 10),
        y: cy + Math.sin(angle) * Math.max(radius, 10),
      };
    };

    const drawFlakeCursor = (x, y, size, alpha) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t * 2);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#5bb8f5';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#a8d8f0';
      ctx.shadowBlur = 8;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size); ctx.stroke();
        const bx = Math.cos(a) * size * 0.55, by = Math.sin(a) * size * 0.55;
        const ba = a + Math.PI / 2, bl = size * 0.3;
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(ba) * bl, by + Math.sin(ba) * bl); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - Math.cos(ba) * bl, by - Math.sin(ba) * bl); ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2); ctx.fillStyle = '#5bb8f5'; ctx.fill();
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background flakes
      flakes.forEach(f => {
        f.y += f.speed; f.x += f.drift;
        if (f.y > canvas.height) { f.y = -5; f.x = Math.random() * canvas.width; }
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150,210,255,${f.opacity})`; ctx.fill();
      });

      // Spiral guide
      ctx.beginPath();
      for (let i = 0; i < 400; i++) {
        const angle = (i / 400) * Math.PI * 4;
        const radius = 180 * (1 - (i / 400));
        const px = cx + Math.cos(angle) * radius;
        const py = cy + Math.sin(angle) * radius;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.strokeStyle = 'rgba(91,184,245,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      const pos = getPos(t);
      trail.push({ x: pos.x, y: pos.y });
      if (trail.length > 40) trail.shift();
      trail.forEach((pt, i) => {
        const alpha = (i / trail.length) * 0.5;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, Math.max((i / trail.length) * 3, 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(91,184,245,${alpha})`; ctx.fill();
      });

      drawFlakeCursor(pos.x, pos.y, 18, 1);
      t += 0.025;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}

export default function PageTransition({ children }) {
  const location = useLocation();
  const { theme } = useTheme();
  const [visible, setVisible] = useState(true);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [phase, setPhase] = useState('in');

  useEffect(() => {
    playWarp();
    setPhase('in');
    setVisible(true);
    const holdTimer = setTimeout(() => { setDisplayChildren(children); setPhase('out'); }, 1400);
    const hideTimer = setTimeout(() => { setVisible(false); }, 2200);
    return () => { clearTimeout(holdTimer); clearTimeout(hideTimer); };
  }, [location.pathname]);

  const isLight = theme === 'light';

  return (
    <>
      {displayChildren}
      <AnimatePresence>
        {visible && (
          <motion.div
            key={location.pathname}
            initial={{ opacity: 1 }}
            animate={{ opacity: phase === 'out' ? 0 : 1 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            style={{
              position: 'fixed', inset: 0, zIndex: 99999,
              background: isLight ? '#f5f0eb' : '#020408',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              pointerEvents: phase === 'out' ? 'none' : 'all',
            }}
          >
            {isLight ? <SnowSpiralCanvas /> : <InfinityCanvas />}
            <motion.p
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
              style={{
                position: 'absolute', bottom: '50%', marginBottom: -60,
                fontFamily: 'Orbitron', fontSize: '0.78rem', letterSpacing: 6,
                color: isLight ? '#5bb8f5' : '#ffffff',
                userSelect: 'none',
              }}
            >
              {isLight ? 'LOADING' : 'LOADING'}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
