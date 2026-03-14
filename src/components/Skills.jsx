import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { getSkills, getProfile } from '../firebase';
import { useTheme } from '../context/ThemeContext';

const FALLBACK_SKILLS = [
  { name: 'React',      level: 92, color: '#00f5ff' },
  { name: 'Node.js',    level: 85, color: '#a855f7' },
  { name: 'TypeScript', level: 80, color: '#3b82f6' },
  { name: 'Python',     level: 75, color: '#f59e0b' },
  { name: 'AWS',        level: 70, color: '#10b981' },
  { name: 'Docker',     level: 65, color: '#ec4899' },
];

function drawLiquidPlanet(ctx, x, y, radius, level, color, hovered, frame, isLight) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.clip();
  // In light mode: white snowball base; dark mode: dark bg
  ctx.fillStyle = isLight ? '#e8f4ff' : '#020408';
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);

  const fillTop = y + radius - (level / 100) * radius * 2;
  const waveAmp = hovered ? 3 : 1.8;
  ctx.beginPath();
  ctx.moveTo(x - radius, y + radius);
  for (let px = x - radius; px <= x + radius; px++) {
    const wave = Math.sin((px - x) * 0.15 + frame * 0.05) * waveAmp
               + Math.sin((px - x) * 0.25 + frame * 0.03) * waveAmp * 0.5;
    ctx.lineTo(px, fillTop + wave);
  }
  ctx.lineTo(x + radius, y + radius);
  ctx.closePath();
  const grad = ctx.createLinearGradient(x, fillTop, x, y + radius);
  // Light mode: icy blue water fill
  grad.addColorStop(0, isLight ? color + 'cc' : color + 'dd');
  grad.addColorStop(1, isLight ? color + '66' : color + '55');
  ctx.fillStyle = grad;
  ctx.fill();

  // Snow cap on top in light mode
  if (isLight) {
    ctx.beginPath();
    ctx.ellipse(x, fillTop, radius * 0.55, radius * 0.18, 0, Math.PI, 0);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fill();
  }

  const shine = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
  shine.addColorStop(0, 'rgba(255,255,255,0.28)');
  shine.addColorStop(0.5, 'rgba(255,255,255,0.06)');
  shine.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = shine;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = hovered ? color : color + '99';
  ctx.lineWidth = hovered ? 2 : 1.2;
  ctx.stroke();
  if (hovered) {
    ctx.beginPath();
    ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
    ctx.strokeStyle = color + '44';
    ctx.lineWidth = 6;
    ctx.stroke();
  }
}

function drawStar(ctx, cx, cy, radius, name, frame, dead, isLight) {
  const pulse = Math.sin(frame * 0.03) * 0.3 + 0.7;
  if (!dead) {
    // Light mode: snowflake sun; dark mode: golden star glow
    const glowColor = isLight ? '100,180,255' : '255,215,0';
    const outerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 2.5);
    outerGlow.addColorStop(0, `rgba(${glowColor},${0.2 * pulse})`);
    outerGlow.addColorStop(1, `rgba(${glowColor},0)`);
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  const starGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 0, cx, cy, radius);
  if (dead) {
    starGrad.addColorStop(0, isLight ? '#c8e8f8' : '#1a1a2e');
    starGrad.addColorStop(0.5, isLight ? '#a0c8e0' : '#0d0d1a');
    starGrad.addColorStop(1, isLight ? '#80aac8' : '#050508');
  } else if (isLight) {
    starGrad.addColorStop(0, '#ffffff');
    starGrad.addColorStop(0.4, '#b8e0ff');
    starGrad.addColorStop(0.75, '#64b4f0');
    starGrad.addColorStop(1, '#2a7abf');
  } else {
    starGrad.addColorStop(0, '#fff9e6');
    starGrad.addColorStop(0.4, '#ffd700');
    starGrad.addColorStop(0.75, '#ff8c00');
    starGrad.addColorStop(1, '#ff4500');
  }
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = starGrad;
  ctx.fill();
  ctx.strokeStyle = dead ? (isLight ? '#a0c8e0' : '#333') : (isLight ? '#64b4f066' : '#ff8c0066');
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = dead ? (isLight ? '#6090b0' : '#333') : (isLight ? '#0f2744' : '#020408');
  ctx.font = `bold ${Math.max(radius * 0.28, 7)}px Orbitron, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const words = (name || 'ME').toUpperCase().split(' ');
  if (words.length > 1) {
    ctx.fillText(words[0], cx, cy - radius * 0.18);
    ctx.fillText(words.slice(1).join(' '), cx, cy + radius * 0.22);
  } else {
    ctx.fillText((name || 'ME').toUpperCase(), cx, cy);
  }
}

export default function Skills() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const isLightRef = useRef(isLight);
  useEffect(() => { isLightRef.current = isLight; }, [isLight]);

  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const animRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });

  const [skills, setSkills] = useState([]);
  const [starName, setStarName] = useState('ME');
  const [gravityOff, setGravityOff] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState(null); // { index, x, y, canvasRect }
  const [dialogPos, setDialogPos] = useState({ x: 0, y: 0 });

  // Shared mutable state via refs (avoid re-render in animation loop)
  const gravityRef = useRef(false);
  const restoringRef = useRef(false); // true while pulling back to orbit
  const anglesRef = useRef([]);
  const physicsRef = useRef([]);
  const selectedRef = useRef(null);
  const hoveredRef = useRef(null);
  const skillsRef = useRef([]);
  const starNameRef = useRef('ME');

  useEffect(() => { skillsRef.current = skills; }, [skills]);
  useEffect(() => { starNameRef.current = starName; }, [starName]);

  useEffect(() => {
    getSkills()
      .then(d => setSkills(d.length > 0 ? d : FALLBACK_SKILLS))
      .catch(() => setSkills(FALLBACK_SKILLS));
    getProfile().then(p => {
      if (p?.fullName) setStarName(p.fullName.trim().split(' ')[0]);
    });
  }, []);

  useEffect(() => {
    anglesRef.current = skills.map((_, i) => (i / skills.length) * Math.PI * 2);
  }, [skills]);

  const getParams = useCallback((canvas) => {
    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2;
    const maxR = Math.min(w, h) / 2 - 50;
    const starR = Math.min(maxR * 0.14, 44);
    const minOrbit = starR + 40;
    const n = skillsRef.current.length;
    const orbitStep = n > 1 ? (maxR - minOrbit) / (n - 1) : 0;
    const orbits = skillsRef.current.map((_, i) => minOrbit + i * orbitStep);
    const sizes = skillsRef.current.map((_, i) => Math.max(maxR * 0.065 - i * 1.5, 14));
    const speeds = skillsRef.current.map((_, i) => 0.0012 / (1 + i * 0.2));
    return { cx, cy, starR, orbits, sizes, speeds, w, h };
  }, []);

  // Toggle gravity
  const toggleGravity = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { cx, cy, orbits, sizes, speeds } = getParams(canvas);
    const next = !gravityRef.current;
    gravityRef.current = next;
    setGravityOff(next);
    setSelectedPlanet(null);
    selectedRef.current = null;

    if (next) {
      // Launch planets tangentially
      physicsRef.current = skillsRef.current.map((_, i) => {
        const angle = anglesRef.current[i];
        const orbit = orbits[i];
        const speed = speeds[i] * orbit;
        return {
          x: cx + Math.cos(angle) * orbit,
          y: cy + Math.sin(angle) * orbit,
          vx: -Math.sin(angle) * speed * 60,
          vy:  Math.cos(angle) * speed * 60,
          r: sizes[i],
        };
      });
    } else {
      // Begin restoring — keep gravityRef=true so draw loop stays in physics branch
      // gravityRef will be set false only once all planets are back
      gravityRef.current = true;
      restoringRef.current = true;
      setRestoring(true);
      physicsRef.current.forEach((p, i) => {
        anglesRef.current[i] = Math.atan2(p.y - cy, p.x - cx);
      });
    }
  };

  useEffect(() => {
    if (!inView || skills.length === 0) return;
    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    let frame = 0;

    const resize = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Mouse events
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const { cx, cy, orbits, sizes } = getParams(canvas);
      let found = null;
      skillsRef.current.forEach((_, i) => {
        let px, py;
        if (gravityRef.current) {
          px = physicsRef.current[i]?.x ?? 0;
          py = physicsRef.current[i]?.y ?? 0;
        } else {
          px = cx + Math.cos(anglesRef.current[i]) * orbits[i];
          py = cy + Math.sin(anglesRef.current[i]) * orbits[i];
        }
        if (Math.hypot(mx - px, my - py) < sizes[i] + 8) found = i;
      });
      hoveredRef.current = found;
    };

    const onClick = (e) => {
      if (gravityRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const { cx, cy, orbits, sizes } = getParams(canvas);
      let found = null;
      skillsRef.current.forEach((_, i) => {
        const px = cx + Math.cos(anglesRef.current[i]) * orbits[i];
        const py = cy + Math.sin(anglesRef.current[i]) * orbits[i];
        if (Math.hypot(mx - px, my - py) < sizes[i] + 8) found = i;
      });
      if (found !== null) {
        if (selectedRef.current === found) {
          selectedRef.current = null;
          setSelectedPlanet(null);
        } else {
          selectedRef.current = found;
          const px = cx + Math.cos(anglesRef.current[found]) * orbits[found];
          const py = cy + Math.sin(anglesRef.current[found]) * orbits[found];
          const wrapRect = wrapperRef.current.getBoundingClientRect();
          setDialogPos({ x: px, y: py });
          setSelectedPlanet({ index: found });
        }
      } else {
        selectedRef.current = null;
        setSelectedPlanet(null);
      }
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', () => { hoveredRef.current = null; });
    canvas.addEventListener('click', onClick);

    const draw = () => {
      const ctx = canvas.getContext('2d');
      const { cx, cy, starR, orbits, sizes, speeds, w, h } = getParams(canvas);
      ctx.clearRect(0, 0, w, h);
      const dead = gravityRef.current;

      if (!dead) {
        // Orbit rings
        skillsRef.current.forEach((s, i) => {
          ctx.beginPath();
          ctx.arc(cx, cy, orbits[i], 0, Math.PI * 2);
          ctx.strokeStyle = s.color + '20';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 10]);
          ctx.stroke();
          ctx.setLineDash([]);
        });

        // Advance angles (freeze selected)
        skillsRef.current.forEach((_, i) => {
          if (selectedRef.current === i) return;
          anglesRef.current[i] += speeds[i] * (hoveredRef.current === i ? 0.15 : 1);
        });

        // Update dialog position for selected planet
        if (selectedRef.current !== null) {
          const si = selectedRef.current;
          const px = cx + Math.cos(anglesRef.current[si]) * orbits[si];
          const py = cy + Math.sin(anglesRef.current[si]) * orbits[si];
          setDialogPos({ x: px, y: py });
        }

        // Draw planets sorted by y
        const order = skillsRef.current.map((_, i) => i).sort((a, b) => {
          const ya = cy + Math.sin(anglesRef.current[a]) * orbits[a];
          const yb = cy + Math.sin(anglesRef.current[b]) * orbits[b];
          return ya - yb;
        });

        order.forEach(i => {
          const s = skillsRef.current[i];
          const px = cx + Math.cos(anglesRef.current[i]) * orbits[i];
          const py = cy + Math.sin(anglesRef.current[i]) * orbits[i];
          const hov = hoveredRef.current === i;
          const sel = selectedRef.current === i;
          const r = sizes[i] * (hov || sel ? 1.2 : 1);
          drawLiquidPlanet(ctx, px, py, r, s.level, s.color, hov || sel, frame, isLightRef.current);

          // Selected ring
          if (sel) {
            ctx.beginPath();
            ctx.arc(px, py, r + 8, 0, Math.PI * 2);
            ctx.strokeStyle = s.color;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          ctx.fillStyle = (hov || sel) ? s.color : s.color + 'cc';
          ctx.font = `${(hov || sel) ? 700 : 400} ${(hov || sel) ? 12 : 10}px Orbitron, monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.shadowColor = s.color;
          ctx.shadowBlur = (hov || sel) ? 8 : 0;
          ctx.fillText(s.name, px, py + r + 6);
          ctx.shadowBlur = 0;
        });

      } else {
        // ── GRAVITY OFF / RESTORING PHYSICS ──
        const ps = physicsRef.current;
        const restoring = restoringRef.current;

        ps.forEach((p, i) => {
          if (restoring) {
            // Compute target orbital position
            const targetX = cx + Math.cos(anglesRef.current[i]) * orbits[i];
            const targetY = cy + Math.sin(anglesRef.current[i]) * orbits[i];
            const dx = targetX - p.x;
            const dy = targetY - p.y;
            const dist = Math.hypot(dx, dy);

            // Gentle constant-strength pull toward target
            const pull = 0.06;
            if (dist > 0) {
              p.vx += (dx / dist) * pull;
              p.vy += (dy / dist) * pull;
            }

            // Dampen so it spirals in smoothly without overshooting
            p.vx *= 0.92;
            p.vy *= 0.92;

            p.x += p.vx;
            p.y += p.vy;

            // Advance angle slowly while restoring
            anglesRef.current[i] += speeds[i] * 0.3;

            // Snap once close enough
            if (dist < 2.5) {
              p.x = targetX;
              p.y = targetY;
              p.vx = 0;
              p.vy = 0;
            }
          } else {
            // Normal chaos physics
            p.x += p.vx;
            p.y += p.vy;

            if (p.x - p.r < 0)  { p.x = p.r;      p.vx = Math.abs(p.vx) * 0.85; }
            if (p.x + p.r > w)  { p.x = w - p.r;  p.vx = -Math.abs(p.vx) * 0.85; }
            if (p.y - p.r < 0)  { p.y = p.r;      p.vy = Math.abs(p.vy) * 0.85; }
            if (p.y + p.r > h)  { p.y = h - p.r;  p.vy = -Math.abs(p.vy) * 0.85; }

            p.vx *= 0.999;
            p.vy *= 0.999;
          }
        });

        // Planet-planet collisions (only in chaos mode)
        if (!restoring) {
          for (let i = 0; i < ps.length; i++) {
            for (let j = i + 1; j < ps.length; j++) {
              const p = ps[i], q = ps[j];
              const dx = q.x - p.x, dy = q.y - p.y;
              const dist = Math.hypot(dx, dy);
              const minDist = p.r + q.r;
              if (dist < minDist && dist > 0) {
                const overlap = (minDist - dist) / 2;
                const nx = dx / dist, ny = dy / dist;
                p.x -= nx * overlap; p.y -= ny * overlap;
                q.x += nx * overlap; q.y += ny * overlap;
                const dvx = p.vx - q.vx, dvy = p.vy - q.vy;
                const dot = dvx * nx + dvy * ny;
                if (dot > 0) {
                  const impulse = dot * 0.9;
                  p.vx -= impulse * nx; p.vy -= impulse * ny;
                  q.vx += impulse * nx; q.vy += impulse * ny;
                }
              }
            }
          }
        }

        // Check if all planets have returned to orbit
        if (restoring) {
          const allBack = ps.every((p, i) => {
            const tx = cx + Math.cos(anglesRef.current[i]) * orbits[i];
            const ty = cy + Math.sin(anglesRef.current[i]) * orbits[i];
            return Math.hypot(p.x - tx, p.y - ty) < 4;
          });
          if (allBack) {
            restoringRef.current = false;
            gravityRef.current = false;
            setGravityOff(false);
            setRestoring(false);
          }
        }

        // Draw planets
        ps.forEach((p, i) => {
          const s = skillsRef.current[i];
          if (!s) return;
          drawLiquidPlanet(ctx, p.x, p.y, p.r, s.level, s.color, false, frame, isLightRef.current);
          ctx.fillStyle = s.color + 'cc';
          ctx.font = '10px Orbitron, monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(s.name, p.x, p.y + p.r + 5);
        });
      }

      // Star
      drawStar(ctx, cx, cy, starR, starNameRef.current, frame, gravityRef.current && !restoringRef.current, isLightRef.current);

      frame++;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('click', onClick);
    };
  }, [inView, skills, getParams]);

  const selSkill = selectedPlanet !== null ? skills[selectedPlanet.index] : null;

  return (
    <section id="skills" ref={sectionRef} style={{ minHeight: '100vh', padding: '100px 5vw 60px' }}>
      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        SKILLS
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'Orbitron', fontSize: '0.72rem', letterSpacing: 3, marginBottom: 20 }}
      >
        CLICK A PLANET TO INSPECT · HOVER TO PREVIEW
      </motion.p>

      {/* Gravity button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <motion.button
          onClick={restoring ? undefined : toggleGravity}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '10px 28px', borderRadius: 6, border: 'none', cursor: 'pointer',
            background: gravityOff
              ? (isLight ? 'linear-gradient(135deg,#ddeeff,#c0d8f0)' : 'linear-gradient(135deg,#1a1a2e,#0d0d1a)')
              : (isLight ? 'linear-gradient(135deg,#5bb8f5,#2a7abf)' : 'linear-gradient(135deg,#ffd700,#ff8c00)'),
            color: gravityOff ? (isLight ? '#4a7fa5' : '#475569') : (isLight ? '#fff' : '#020408'),
            fontFamily: 'Orbitron', fontWeight: 700, fontSize: '0.78rem', letterSpacing: 2,
            boxShadow: gravityOff ? '0 0 20px rgba(0,0,0,0.5)' : '0 0 24px rgba(255,215,0,0.4)',
            transition: 'all 0.4s',
            border: gravityOff ? '1px solid #333' : 'none',
          }}
        >
          {gravityOff && !restoring ? 'GRAVITY OFF — CLICK TO RESTORE' : restoring ? 'RESTORING GRAVITY...' : 'STOP GRAVITY'}
        </motion.button>
      </div>

      <motion.div
        ref={wrapperRef}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.9, delay: 0.3 }}
        style={{ width: '100%', height: 'min(85vw, 680px)', maxWidth: 860, margin: '0 auto', position: 'relative' }}
      >
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

        {/* Planet dialog */}
        <AnimatePresence>
          {selectedPlanet !== null && selSkill && !gravityOff && (
            <motion.div
              key={selectedPlanet.index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                left: Math.min(dialogPos.x + 30, (wrapperRef.current?.offsetWidth ?? 860) - 240),
                top: Math.max(dialogPos.y - 80, 10),
                width: 220,
                background: 'var(--card-bg)',
                border: `1px solid ${selSkill.color}55`,
                borderRadius: 12,
                padding: 18,
                zIndex: 50,
                boxShadow: `0 0 30px ${selSkill.color}22`,
                pointerEvents: 'all',
              }}
            >
              {/* Close */}
              <button
                onClick={() => { setSelectedPlanet(null); selectedRef.current = null; }}
                style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}
              >×</button>

              {/* Title */}
              <div style={{ fontFamily: 'Orbitron', fontWeight: 700, fontSize: '0.9rem', color: selSkill.color, marginBottom: 12, textShadow: `0 0 10px ${selSkill.color}88` }}>
                {selSkill.name}
              </div>

              {/* Proficiency bar */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'Orbitron', letterSpacing: 1 }}>PROFICIENCY</span>
                  <span style={{ fontSize: '0.72rem', color: selSkill.color, fontFamily: 'Orbitron' }}>{selSkill.level}%</span>
                </div>
                <div style={{ height: 5, background: 'rgba(128,128,128,0.15)', borderRadius: 3, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${selSkill.level}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg,${selSkill.color},${selSkill.color}88)`, boxShadow: `0 0 8px ${selSkill.color}` }}
                  />
                </div>
              </div>

              {/* Related projects */}
              {selSkill.projects?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'Orbitron', letterSpacing: 1, marginBottom: 6 }}>RELATED PROJECTS</div>
                  {selSkill.projects.map((p, i) => (
                    <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 3, paddingLeft: 8, borderLeft: `2px solid ${selSkill.color}44` }}>
                      {p}
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications */}
              {selSkill.certifications?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'Orbitron', letterSpacing: 1, marginBottom: 6 }}>CERTIFICATIONS</div>
                  {selSkill.certifications.map((c, i) => (
                    <a key={i} href={c.url || '#'} target="_blank" rel="noreferrer"
                      style={{ display: 'block', fontSize: '0.75rem', color: selSkill.color, marginBottom: 4, textDecoration: 'none', paddingLeft: 8, borderLeft: `2px solid ${selSkill.color}44` }}
                      onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {c.name || c}
                    </a>
                  ))}
                </div>
              )}

              {!selSkill.projects?.length && !selSkill.certifications?.length && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', fontFamily: 'Orbitron', letterSpacing: 1 }}>
                  ADD PROJECTS & CERTS IN ADMIN
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
