import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { getExperiences } from '../firebase';

function formatDate(dateStr, current) {
  if (current) return 'PRESENT';
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function Experience() {
  const sectionRef = useRef(null);
  const [experiences, setExperiences] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const inView = useInView(sectionRef, { once: true, margin: '-40px' });

  useEffect(() => {
    getExperiences()
      .then(d => { setExperiences(d); setLoaded(true); })
      .catch(() => { setExperiences([]); setLoaded(true); });
  }, []);

  if (loaded && experiences.length === 0) return null;

  const CARD_W = 260;
  const GAP = 60;
  const START_PAD = 100;
  const END_PAD = 60;

  const getTechs = (exp) => typeof exp.techUsed === 'string'
    ? exp.techUsed.split(',').map(t => t.trim()).filter(Boolean)
    : (exp.techUsed || []);

  const show = loaded && inView;

  return (
    <section id="experience" ref={sectionRef} style={{ padding: '100px 0 80px', position: 'relative' }}>
      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 30 }}
        animate={show ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        EXPERIENCE
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={show ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ textAlign: 'center', color: '#475569', fontFamily: 'Orbitron', fontSize: '0.68rem', letterSpacing: 3, marginBottom: 48 }}
      >
        SCROLL TO EXPLORE MISSION HISTORY
      </motion.p>

      {loaded && (
        <div style={{ overflowX: 'auto', overflowY: 'visible', scrollbarWidth: 'none' }}>
          <style>{`.exp-tl::-webkit-scrollbar{display:none}`}</style>

          <div
            className="exp-tl"
            style={{
              position: 'relative',
              width: Math.max(START_PAD + experiences.length * (CARD_W + GAP) + END_PAD, window.innerWidth),
              height: 440,
            }}
          >
            {/* Timeline line */}
            <div style={{
              position: 'absolute',
              left: START_PAD - 20,
              right: END_PAD,
              top: '50%',
              height: 2,
              background: 'linear-gradient(to right, #00f5ff, #a855f7, rgba(0,245,255,0.2))',
              transform: 'translateY(-50%)',
            }} />

            {/* Rocket start pointer */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={show ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7 }}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="12" cy="24" r="11" fill="rgba(0,245,255,0.06)" />
                <path d="M16 21 Q9 24 16 27" stroke="#ff8c00" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
                <path d="M13 22 Q5 24 13 26" stroke="#ff4500" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <path d="M16 18 L38 24 L16 30 L18 26 L16 24 L18 22 Z" fill="rgba(0,245,255,0.18)" stroke="#00f5ff" strokeWidth="1.3"/>
                <path d="M20 22 L16 15 L18 20 Z" fill="rgba(168,85,247,0.8)"/>
                <path d="M20 26 L16 33 L18 28 Z" fill="rgba(168,85,247,0.8)"/>
                <ellipse cx="30" cy="24" rx="4.5" ry="3.5" fill="rgba(0,245,255,0.55)" stroke="#00f5ff" strokeWidth="0.9"/>
              </svg>
              <div style={{ fontFamily: 'Orbitron', fontSize: '0.52rem', color: '#00f5ff', letterSpacing: 2 }}>
                START
              </div>
            </motion.div>

            {/* End cap */}
            <div style={{
              position: 'absolute',
              left: START_PAD + experiences.length * (CARD_W + GAP) - GAP / 2,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 14, height: 14,
              borderRadius: '50%',
              background: experiences[experiences.length - 1]?.current ? '#00f5ff' : '#a855f7',
              boxShadow: `0 0 14px ${experiences[experiences.length - 1]?.current ? '#00f5ff' : '#a855f7'}`,
              zIndex: 2,
            }} />

            {/* Experience nodes */}
            {experiences.map((exp, i) => {
              const above = i % 2 === 0;
              const cardLeft = START_PAD + i * (CARD_W + GAP);
              const MID = 220; // half of 440

              return (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: above ? -40 : 40 }}
                  animate={show ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.55, delay: 0.15 + i * 0.13 }}
                  style={{
                    position: 'absolute',
                    left: cardLeft,
                    width: CARD_W,
                    top: above ? MID - 215 : MID + 32,
                  }}
                >
                  {/* Card */}
                  <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${exp.current ? 'rgba(0,245,255,0.3)' : 'rgba(168,85,247,0.2)'}`,
                    borderRadius: 12,
                    padding: '16px 18px',
                    boxShadow: exp.current ? '0 0 28px rgba(0,245,255,0.08)' : '0 4px 24px rgba(0,0,0,0.3)',
                    position: 'relative',
                  }}>
                    {exp.current && (
                      <div style={{
                        position: 'absolute', top: -10, right: 12,
                        background: 'linear-gradient(135deg,#00f5ff,#3b82f6)',
                        color: '#020408', fontFamily: 'Orbitron', fontSize: '0.5rem',
                        letterSpacing: 1, padding: '2px 8px', borderRadius: 10, fontWeight: 700,
                      }}>CURRENT</div>
                    )}
                    <div style={{ fontFamily: 'Orbitron', fontWeight: 700, fontSize: '0.82rem', color: exp.current ? '#00f5ff' : '#e2e8f0', marginBottom: 4, lineHeight: 1.3 }}>
                      {exp.role}
                    </div>
                    <div style={{ fontFamily: 'Orbitron', fontSize: '0.68rem', color: '#a855f7', marginBottom: 6, letterSpacing: 1 }}>
                      {exp.company}
                    </div>
                    <div style={{ fontFamily: 'Orbitron', fontSize: '0.58rem', color: '#475569', marginBottom: 10, letterSpacing: 1 }}>
                      {formatDate(exp.startDate)} — {formatDate(exp.endDate, exp.current)}
                    </div>
                    {exp.description && (
                      <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.6, margin: '0 0 10px' }}>
                        {exp.description.length > 110 ? exp.description.slice(0, 110) + '…' : exp.description}
                      </p>
                    )}
                    {getTechs(exp).length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {getTechs(exp).slice(0, 4).map(t => (
                          <span key={t} style={{
                            padding: '2px 6px', borderRadius: 3,
                            background: 'rgba(0,245,255,0.08)',
                            border: '1px solid rgba(0,245,255,0.2)',
                            fontFamily: 'Orbitron', fontSize: '0.54rem', color: '#00f5ff',
                          }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Connector */}
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 1,
                    height: 32,
                    background: `linear-gradient(to ${above ? 'bottom' : 'top'}, ${exp.current ? '#00f5ff88' : '#a855f788'}, transparent)`,
                    [above ? 'bottom' : 'top']: -32,
                  }} />

                  {/* Dot on timeline */}
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    [above ? 'bottom' : 'top']: -42,
                    width: 14, height: 14,
                    borderRadius: '50%',
                    background: '#020408',
                    border: `2px solid ${exp.current ? '#00f5ff' : '#a855f7'}`,
                    boxShadow: `0 0 10px ${exp.current ? '#00f5ff' : '#a855f7'}`,
                    zIndex: 3,
                  }} />

                  {/* Date near dot */}
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    [above ? 'bottom' : 'top']: above ? -64 : -64,
                    fontFamily: 'Orbitron',
                    fontSize: '0.5rem',
                    color: '#334155',
                    letterSpacing: 1,
                    whiteSpace: 'nowrap',
                  }}>
                    {formatDate(exp.startDate)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
