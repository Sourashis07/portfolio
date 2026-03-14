import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { getProfile } from '../firebase';

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [profile, setProfile] = useState({});

  useEffect(() => { getProfile().then(setProfile); }, []);

  const stats = [
    { value: profile.yearsExp || '3+', label: 'Years Experience' },
    { value: profile.projectsBuilt || '20+', label: 'Projects Built' },
    { value: profile.technologies || '10+', label: 'Technologies' },
  ];

  return (
    <section id="about" className="section" ref={ref}>
      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        ABOUT ME
      </motion.h2>

      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 48, alignItems: 'center' }}>
        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <div style={{ position: 'relative', width: 260, height: 260 }}>
            <div style={{
              width: 260, height: 260, borderRadius: '50%',
              background: 'var(--avatar-bg)',
              border: '2px solid var(--avatar-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--avatar-shadow)',
              overflow: 'hidden',
            }}>
              {profile.avatarUrl
                ? <img src={profile.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (
                  <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="38" r="22" fill="rgba(0,245,255,0.3)" stroke="#00f5ff" strokeWidth="1.5" />
                    <path d="M10 95 Q50 60 90 95" fill="rgba(0,245,255,0.15)" stroke="#00f5ff" strokeWidth="1.5" />
                  </svg>
                )
              }
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              style={{ position: 'absolute', inset: -16, border: '1px dashed var(--orbit-ring)', borderRadius: '50%' }}
            />
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <p style={{ color: 'var(--section-label)', fontFamily: 'Orbitron', fontSize: '0.8rem', letterSpacing: 3, marginBottom: 16 }}>
            WHO I AM
          </p>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 20 }}>
            {profile.bio1 || "I'm a passionate full-stack developer who loves building sleek, performant web applications. I thrive at the intersection of creative design and robust engineering."}
          </p>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 36 }}>
            {profile.bio2 || "When I'm not coding, I'm exploring the latest in AI, space tech, and open-source ecosystems. I believe great software should feel as good as it works."}
          </p>

          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              >
                <div style={{ fontFamily: 'Orbitron', fontSize: '2rem', fontWeight: 900, color: 'var(--stat-color)', textShadow: '0 0 20px var(--stat-shadow)' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
