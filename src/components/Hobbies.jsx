import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getHobbies } from '../firebase';

const FALLBACK = [
  { id: '1', name: 'Astrophotography', description: 'Capturing deep-sky objects with a DSLR and tracking mount.' },
  { id: '2', name: 'Open Source', description: 'Contributing to open-source projects and building dev tools.' },
  { id: '3', name: 'Music Production', description: 'Creating ambient and electronic music in Ableton Live.' },
];

const ACCENT_COLORS = ['#00f5ff', '#a855f7', '#3b82f6', '#f59e0b', '#10b981', '#ec4899'];

export default function Hobbies() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getHobbies()
      .then(d => setItems(d.length > 0 ? d : FALLBACK))
      .catch(() => setItems(FALLBACK));
  }, []);

  return (
    <section id="hobbies" ref={ref} className="section">
      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        HOBBIES
      </motion.h2>

      <div className="grid-3" style={{ maxWidth: 1100, margin: '0 auto' }}>
        {items.map((item, i) => {
          const color = ACCENT_COLORS[i % ACCENT_COLORS.length];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              onClick={() => navigate(`/hobby/${item.id}`)}
              whileHover={{ y: -6, borderColor: color }}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: 16,
                padding: '32px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
            >
              {/* Top accent line */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

              {/* Cover image if exists */}
              {item.coverUrl && (
                <div style={{ width: '100%', height: 120, borderRadius: 10, overflow: 'hidden', marginBottom: 18 }}>
                  <img src={item.coverUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <div style={{ fontFamily: 'Orbitron', fontWeight: 700, fontSize: '1rem', color, marginBottom: 10, letterSpacing: 1 }}>
                {item.name}
              </div>
              {item.description && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
                  {item.description}
                </p>
              )}
              <div style={{ fontFamily: 'Orbitron', fontSize: '0.65rem', color, letterSpacing: 2, opacity: 0.7 }}>
                VIEW POSTS →
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
