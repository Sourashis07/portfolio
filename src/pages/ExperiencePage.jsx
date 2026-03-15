import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getExperiences } from '../firebase';
import Starfield from '../components/Starfield';
import SpaceshipCursor from '../components/SpaceshipCursor';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

function formatDate(dateStr, current) {
  if (current) return 'PRESENT';
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function Section({ title, color, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h3 style={{
        fontFamily: 'Orbitron', fontSize: '0.78rem', letterSpacing: 3,
        color, marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ display: 'inline-block', width: 24, height: 1, background: color }} />
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function ExperiencePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exp, setExp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExperiences().then(list => {
      const found = list.find(e => e.id === id);
      setExp(found || null);
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <>
      <Starfield />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Orbitron', color: '#00f5ff', letterSpacing: 3 }}>
        LOADING...
      </div>
    </>
  );

  if (!exp) return (
    <>
      <Starfield />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <p style={{ fontFamily: 'Orbitron', color: '#ef4444', letterSpacing: 2 }}>EXPERIENCE NOT FOUND</p>
        <button onClick={() => navigate('/')} style={backBtnStyle}>← BACK</button>
      </div>
    </>
  );

  const color = exp.current ? '#00f5ff' : '#a855f7';
  const techs = typeof exp.techUsed === 'string'
    ? exp.techUsed.split(',').map(t => t.trim()).filter(Boolean)
    : (exp.techUsed || []);
  const highlights = typeof exp.highlights === 'string'
    ? exp.highlights.split('\n').map(h => h.trim()).filter(Boolean)
    : (exp.highlights || []);

  return (
    <>
      <SpaceshipCursor />
      <Starfield />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', padding: '40px 5vw 80px', maxWidth: 860, margin: '0 auto' }}>

        <motion.button {...fadeUp(0)} onClick={() => navigate('/#experience')} style={backBtnStyle}>
          ← BACK TO EXPERIENCE
        </motion.button>

        {/* Header */}
        <motion.div {...fadeUp(0.1)} style={{ marginBottom: 48, marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            {exp.current && (
              <span style={{
                padding: '3px 12px', borderRadius: 20,
                background: 'linear-gradient(135deg,#00f5ff,#3b82f6)',
                color: '#020408', fontFamily: 'Orbitron', fontSize: '0.6rem', letterSpacing: 1, fontWeight: 700,
              }}>CURRENT</span>
            )}
            {exp.type && (
              <span style={{
                padding: '3px 12px', borderRadius: 20,
                background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)',
                color: '#a855f7', fontFamily: 'Orbitron', fontSize: '0.6rem', letterSpacing: 1,
              }}>{exp.type}</span>
            )}
          </div>

          <h1 style={{
            fontFamily: 'Orbitron', fontWeight: 900,
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            background: `linear-gradient(135deg, #ffffff, ${color})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            marginBottom: 8, lineHeight: 1.2,
          }}>{exp.role}</h1>

          <div style={{ fontFamily: 'Orbitron', fontSize: '1rem', color, marginBottom: 8, letterSpacing: 2 }}>
            {exp.company}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 12 }}>
            <span style={{ fontFamily: 'Orbitron', fontSize: '0.7rem', color: '#475569', letterSpacing: 1 }}>
              {formatDate(exp.startDate)} — {formatDate(exp.endDate, exp.current)}
            </span>
            {exp.location && (
              <span style={{ fontFamily: 'Orbitron', fontSize: '0.7rem', color: '#475569', letterSpacing: 1 }}>
                {exp.location}
              </span>
            )}
          </div>
        </motion.div>

        {/* Description */}
        {exp.description && (
          <motion.div {...fadeUp(0.2)}>
            <Section title="OVERVIEW" color={color}>
              <p style={{ color: '#94a3b8', lineHeight: 1.9, fontSize: '0.95rem', whiteSpace: 'pre-line' }}>{exp.description}</p>
            </Section>
          </motion.div>
        )}

        {/* Highlights */}
        {highlights.length > 0 && (
          <motion.div {...fadeUp(0.3)}>
            <Section title="KEY HIGHLIGHTS" color={color}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {highlights.map((h, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0, marginTop: 7 }} />
                    <span style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.7 }}>{h}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </motion.div>
        )}

        {/* Tech Stack */}
        {techs.length > 0 && (
          <motion.div {...fadeUp(0.4)}>
            <Section title="TECHNOLOGIES USED" color={color}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {techs.map(t => (
                  <span key={t} style={{
                    padding: '6px 14px', borderRadius: 4,
                    background: `${color}10`, color,
                    border: `1px solid ${color}30`,
                    fontFamily: 'Orbitron', fontSize: '0.75rem', letterSpacing: 0.5,
                  }}>{t}</span>
                ))}
              </div>
            </Section>
          </motion.div>
        )}

        {/* Meta */}
        <motion.div {...fadeUp(0.5)}>
          <Section title="DETAILS" color={color}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
              {exp.type && <Meta label="TYPE" value={exp.type} color={color} />}
              {exp.location && <Meta label="LOCATION" value={exp.location} color={color} />}
              <Meta label="DURATION" value={`${formatDate(exp.startDate)} — ${formatDate(exp.endDate, exp.current)}`} color={color} />
            </div>
          </Section>
        </motion.div>

      </div>
    </>
  );
}

function Meta({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: '0.65rem', color: '#475569', fontFamily: 'Orbitron', letterSpacing: 2, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '0.9rem', color, fontFamily: 'Orbitron', fontWeight: 700 }}>{value}</div>
    </div>
  );
}

const backBtnStyle = {
  background: 'transparent',
  border: '1px solid rgba(0,245,255,0.25)',
  color: '#00f5ff',
  fontFamily: 'Orbitron',
  fontSize: '0.75rem',
  letterSpacing: 2,
  padding: '10px 20px',
  borderRadius: 4,
  cursor: 'pointer',
  marginBottom: 32,
  display: 'inline-block',
  textDecoration: 'none',
  transition: 'all 0.2s',
};
