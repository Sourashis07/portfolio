import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { getEducation } from '../firebase';

const FALLBACK = [
  { id: '1', degree: 'B.Tech in Computer Science', institution: 'Example University', startYear: '2019', endYear: '2023', grade: '8.9 CGPA', description: 'Specialized in software engineering and distributed systems.' },
];

export default function Education() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [items, setItems] = useState([]);

  useEffect(() => {
    getEducation()
      .then(d => setItems(d.length > 0 ? d : FALLBACK))
      .catch(() => setItems(FALLBACK));
  }, []);

  return (
    <section id="education" ref={ref} className="section">
      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        EDUCATION
      </motion.h2>

      <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
        {/* vertical line */}
        <div style={{ position: 'absolute', left: 18, top: 0, bottom: 0, width: 1, background: 'linear-gradient(to bottom, var(--accent), var(--accent2), transparent)', opacity: 0.4 }} />

        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            style={{ display: 'flex', gap: 32, marginBottom: 40, paddingLeft: 8 }}
          >
            {/* dot */}
            <div style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', background: 'var(--bg)', border: '2px solid var(--accent)', boxShadow: '0 0 10px var(--accent)', marginTop: 4, zIndex: 1 }} />

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 12, padding: '20px 24px', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: 'Orbitron', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{item.degree}</span>
                <span style={{ fontFamily: 'Orbitron', fontSize: '0.72rem', color: 'var(--accent)', letterSpacing: 1 }}>
                  {item.startYear} — {item.endYear || 'Present'}
                </span>
              </div>
              <div style={{ fontFamily: 'Orbitron', fontSize: '0.78rem', color: 'var(--accent2)', marginBottom: 8, letterSpacing: 1 }}>{item.institution}</div>
              {item.grade && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'Orbitron', letterSpacing: 1 }}>
                  {item.grade}
                </div>
              )}
              {item.description && (
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{item.description}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
