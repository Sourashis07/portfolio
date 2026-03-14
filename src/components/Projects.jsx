import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../firebase';
import { useTheme } from '../context/ThemeContext';

// Fallback while Firestore loads or if empty
const FALLBACK = [
  { id: 'nebulai',    title: 'NebulAI',     desc: 'AI-powered dashboard with real-time ML visualization.', tags: ['React', 'Python', 'TensorFlow'], color: '#00f5ff', icon: '🤖' },
  { id: 'orbichat',  title: 'OrbitChat',   desc: 'Real-time encrypted workspace with WebRTC video.',      tags: ['Next.js', 'WebRTC', 'Redis'],    color: '#a855f7', icon: '🛰️' },
  { id: 'starforge', title: 'StarForge',   desc: 'Procedural WebGL game engine with multiplayer.',        tags: ['WebGL', 'TypeScript', 'Node.js'],color: '#3b82f6', icon: '⭐' },
  { id: 'cosmosdb',  title: 'CosmosDB UI', desc: 'Sleek MongoDB management with schema visualization.',   tags: ['React', 'MongoDB', 'D3.js'],     color: '#f59e0b', icon: '🌌' },
  { id: 'pulseapi',  title: 'PulseAPI',    desc: 'High-performance GraphQL gateway with monitoring.',     tags: ['Go', 'GraphQL', 'Docker'],       color: '#10b981', icon: '⚡' },
  { id: 'voidos',    title: 'VoidOS',      desc: 'Browser-based OS with terminal and file system.',       tags: ['React', 'TypeScript', 'CSS'],    color: '#ec4899', icon: '💻' },
];

export default function Projects() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(null);
  const [projects, setProjects] = useState(FALLBACK);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    getProjects().then(data => { if (data.length > 0) setProjects(data); }).catch(() => {});
  }, []);

  const N = projects.length;
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const onWheel = useCallback((e) => {
    e.preventDefault();
    if (e.deltaY > 30) setActive(a => (a + 1) % N);
    else if (e.deltaY < -30) setActive(a => (a - 1 + N) % N);
  }, [N]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  const touchStart = useRef(null);
  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStart.current === null) return;
    const dx = touchStart.current - e.changedTouches[0].clientX;
    if (dx > 40) setActive(a => (a + 1) % N);
    else if (dx < -40) setActive(a => (a - 1 + N) % N);
    touchStart.current = null;
  };

  return (
    <section id="projects" ref={sectionRef} style={{ minHeight: '100vh', padding: '100px 0 60px', position: 'relative', overflow: 'hidden' }}>
      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        PROJECTS
      </motion.h2>

      <div
        ref={scrollRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ position: 'relative', height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {projects.map((p, i) => {
          const offset = ((i - active + N) % N + Math.floor(N / 2)) % N - Math.floor(N / 2);
          const absOff = Math.abs(offset);
          const scale = absOff === 0 ? 1 : absOff === 1 ? 0.78 : 0.58;
          const opacity = absOff === 0 ? 1 : absOff === 1 ? 0.55 : absOff === 2 ? 0.25 : 0;
          const zIndex = 10 - absOff;
          const translateX = offset * 310;
          const rotateY = offset * -18;
          const isActive = offset === 0;
          const isHov = hovered === i && isActive;

          return (
            <motion.div
              key={p.id || p.title}
              animate={{ x: translateX, scale, opacity, rotateY, z: isActive ? 100 : 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              onMouseEnter={() => { if (isActive) setHovered(i); }}
              onMouseLeave={() => setHovered(null)}
              onClick={() => isActive ? navigate(`/project/${p.id}`) : setActive(i)}
              style={{ position: 'absolute', width: 320, zIndex, transformStyle: 'preserve-3d', perspective: 1000 }}
            >
              <div style={{
                background: isHov
                  ? `linear-gradient(135deg, ${p.color}18, ${isLight ? 'rgba(240,248,255,0.95)' : 'rgba(2,4,8,0.95)'})`
                  : isActive ? (isLight ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.04)') : (isLight ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.02)'),
                border: `1px solid ${isActive ? p.color + '55' : (isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)')}`,
                borderRadius: 16, padding: isActive ? 32 : 24,
                transition: 'all 0.3s ease',
                boxShadow: isActive ? `0 0 60px ${p.color}22, 0 30px 80px rgba(0,0,0,0.5)` : 'none',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: isActive ? `linear-gradient(90deg, transparent, ${p.color}, transparent)` : 'transparent' }} />

                <div style={{ fontSize: isActive ? '2.4rem' : '1.8rem', marginBottom: 14 }}>{p.icon || '🚀'}</div>

                <h3 style={{
                  fontFamily: 'Orbitron', fontWeight: 700,
                  fontSize: isActive ? '1.15rem' : '0.95rem',
                  color: isActive ? p.color : (isLight ? '#4a7fa5' : '#94a3b8'),
                  marginBottom: 12,
                  textShadow: isActive ? `0 0 20px ${p.color}88` : 'none',
                  transition: 'all 0.3s',
                }}>{p.title}</h3>

                {isActive && (
                  <p style={{ color: isLight ? '#2d5a8e' : '#64748b', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: 20 }}>
                    {p.desc || p.description}
                  </p>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: isActive ? 20 : 0 }}>
                  {(isActive ? p.tags : (p.tags || []).slice(0, 2)).map(tag => (
                    <span key={tag} style={{
                      padding: '3px 8px', borderRadius: 4, fontSize: '0.72rem',
                      background: `${p.color}15`, color: p.color,
                      border: `1px solid ${p.color}30`,
                      fontFamily: 'Orbitron', letterSpacing: 0.5,
                    }}>{tag}</span>
                  ))}
                </div>

                {isActive && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: p.color, fontSize: '0.78rem', fontFamily: 'Orbitron', letterSpacing: 1 }}>
                    VIEW PROJECT <span style={{ transform: isHov ? 'translateX(4px)' : 'translateX(0)', transition: 'transform 0.2s' }}>→</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 32 }}>
        {projects.map((p, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            width: i === active ? 24 : 8, height: 8, borderRadius: 4,
            background: i === active ? p.color : (isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.15)'),
            border: 'none', cursor: 'pointer', padding: 0,
            boxShadow: i === active ? `0 0 10px ${p.color}` : 'none',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-faint)', fontSize: '0.75rem', fontFamily: 'Orbitron', letterSpacing: 2 }}>
        SCROLL · SWIPE · CLICK TO NAVIGATE
      </p>
    </section>
  );
}
