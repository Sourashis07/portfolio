import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getCompetitions } from '../firebase';

const FALLBACK = [
  { id: '1', title: 'HackIndia 2024', result: '1st Place', organizer: 'HackIndia', date: '2024-03', description: 'Built an AI-powered disaster response system in 36 hours.', tags: 'React, Python, ML' },
];

const RESULT_COLOR = (result = '') => {
  const r = result.toLowerCase();
  if (r.includes('1st') || r.includes('winner') || r.includes('gold')) return '#f59e0b';
  if (r.includes('2nd') || r.includes('silver')) return '#94a3b8';
  if (r.includes('3rd') || r.includes('bronze')) return '#b45309';
  return 'var(--accent)';
};

export default function Competitions() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getCompetitions()
      .then(d => setItems(d.length > 0 ? d : FALLBACK))
      .catch(() => setItems(FALLBACK));
  }, []);

  return (
    <section id="competitions" ref={ref} className="section">
      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        COMPETITIONS
      </motion.h2>

      <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {items.map((item, i) => {
          const resultColor = RESULT_COLOR(item.result);
          const tags = typeof item.tags === 'string'
            ? item.tags.split(',').map(t => t.trim()).filter(Boolean)
            : (item.tags || []);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            onClick={() => navigate(`/competition/${item.id}`)}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: 12,
                padding: '24px 28px',
                display: 'flex',
                gap: 24,
                alignItems: 'flex-start',
                cursor: 'pointer',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
            >
              {/* Result badge */}
              <div style={{
                flexShrink: 0, width: 64, height: 64, borderRadius: 12,
                background: `${resultColor}15`,
                border: `1px solid ${resultColor}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Orbitron', fontWeight: 900, fontSize: '0.65rem',
                color: resultColor, textAlign: 'center', letterSpacing: 0.5,
                lineHeight: 1.3,
              }}>
                {item.result || 'PARTICIPATED'}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'Orbitron', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {item.title}
                  </span>
                  {item.date && (
                    <span style={{ fontFamily: 'Orbitron', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: 1 }}>
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
                {item.organizer && (
                  <div style={{ fontFamily: 'Orbitron', fontSize: '0.72rem', color: 'var(--accent2)', letterSpacing: 1, marginBottom: 8 }}>
                    {item.organizer}
                  </div>
                )}
                {item.description && (
                  <p style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                    {item.description}
                  </p>
                )}
                {tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {tags.map(tag => (
                      <span key={tag} style={{
                        padding: '3px 8px', borderRadius: 4, fontSize: '0.7rem',
                        background: 'var(--bg2)', color: 'var(--text-muted)',
                        border: '1px solid var(--border2)', fontFamily: 'Orbitron', letterSpacing: 0.5,
                      }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
