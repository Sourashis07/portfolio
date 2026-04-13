import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getCertifications } from '../firebase';

const FALLBACK = [
  { id: '1', title: 'AWS Certified Developer', issuer: 'Amazon Web Services', date: '2024-01', credentialUrl: '', description: 'Associate level certification for cloud development.' },
];

export default function Certifications() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getCertifications()
      .then(d => setItems(d.length > 0 ? d : FALLBACK))
      .catch(() => setItems(FALLBACK));
  }, []);

  return (
    <section id="certifications" ref={ref} className="section">
      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        CERTIFICATIONS
      </motion.h2>

      <div className="grid-3" style={{ maxWidth: 1100, margin: '0 auto' }}>
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            onClick={() => navigate(`/certification/${item.id}`)}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: 12,
              padding: '24px',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'border-color 0.2s, transform 0.2s',
            }}
            whileHover={{ y: -4, borderColor: 'var(--accent)' }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }} />

            <div style={{ fontFamily: 'Orbitron', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 8 }}>
              {item.title}
            </div>
            <div style={{ fontFamily: 'Orbitron', fontSize: '0.72rem', color: 'var(--accent)', letterSpacing: 1, marginBottom: 6 }}>
              {item.issuer}
            </div>
            {item.date && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'Orbitron', letterSpacing: 1, marginBottom: 10 }}>
                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            )}
            {item.description && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 14 }}>
                {item.description}
              </p>
            )}
            {item.credentialUrl && (
              <a
                href={item.credentialUrl}
                target="_blank"
                rel="noreferrer"
                style={{ fontFamily: 'Orbitron', fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: 1, textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >
                VIEW CREDENTIAL →
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
