import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PlanetCanvas from './PlanetCanvas';
import { getHero } from '../firebase';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: 'easeOut' },
});

const DEFAULTS = {
  name: 'Sourav\nSharma',
  designation: 'FULL-STACK DEVELOPER',
  tagline: 'Crafting immersive digital experiences at the intersection of design, code, and innovation.',
};

export default function Hero() {
  const [hero, setHero] = useState(DEFAULTS);

  useEffect(() => {
    getHero().then(data => { if (data && Object.keys(data).length) setHero({ ...DEFAULTS, ...data }); });
  }, []);

  const nameParts = (hero.name || '').split(/\\n|\n/);

  return (
    <section id="hero" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      position: 'relative', overflow: 'hidden', padding: '0 5vw',
    }}>
      <PlanetCanvas />

      <div style={{
        position: 'absolute', inset: 0,
        background: 'var(--hero-overlay)',
        zIndex: 1,
      }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 620 }}>
        <motion.p {...fadeUp(0.1)} style={{ fontFamily: 'Orbitron', fontSize: '0.85rem', letterSpacing: 4, color: 'var(--accent)', marginBottom: 16 }}>
          {hero.designation}
        </motion.p>

        <motion.h1 {...fadeUp(0.25)} style={{
          fontFamily: 'Orbitron', fontWeight: 900,
          fontSize: 'clamp(2.4rem, 6vw, 5rem)',
          lineHeight: 1.1, marginBottom: 24,
          background: 'var(--hero-name-gradient)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          {nameParts.map((part, i) => <span key={i}>{part}{i < nameParts.length - 1 && <br />}</span>)}
        </motion.h1>

        <motion.p {...fadeUp(0.4)} style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 40, maxWidth: 480 }}>
          {hero.tagline}
        </motion.p>

        <motion.div {...fadeUp(0.55)} style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <button
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              padding: '14px 32px', borderRadius: 4, border: 'none', cursor: 'pointer',
              background: 'var(--btn-primary-bg)',
              color: 'var(--btn-primary-color)', fontFamily: 'Orbitron', fontWeight: 700, fontSize: '0.85rem', letterSpacing: 1,
              boxShadow: '0 0 24px var(--btn-primary-shadow)', transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 40px var(--btn-primary-shadow)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 24px var(--btn-primary-shadow)'; }}
          >
            VIEW PROJECTS
          </button>
          <button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              padding: '14px 32px', borderRadius: 4, cursor: 'pointer',
              background: 'transparent', color: 'var(--btn-outline-color)',
              border: '1px solid var(--btn-outline-border)',
              fontFamily: 'Orbitron', fontWeight: 700, fontSize: '0.85rem', letterSpacing: 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,245,255,0.08)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--btn-outline-border)'; }}
          >
            CONTACT ME
          </button>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ marginTop: 60, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-dim)', fontSize: '0.8rem', letterSpacing: 2 }}
        >
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, transparent, var(--accent))' }} />
          SCROLL
        </motion.div>
      </div>
    </section>
  );
}
