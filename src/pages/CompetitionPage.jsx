import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCompetitions } from '../firebase';
import Starfield from '../components/Starfield';
import SpaceshipCursor from '../components/SpaceshipCursor';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

function driveImageUrl(url) {
  if (!url) return null;
  if (!url.includes('drive.google.com')) return url;
  if (url.includes('drive.google.com/thumbnail?')) return url;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  return url;
}

const RESULT_COLOR = (result = '') => {
  const r = result.toLowerCase();
  if (r.includes('1st') || r.includes('winner') || r.includes('gold')) return '#f59e0b';
  if (r.includes('2nd') || r.includes('silver')) return '#94a3b8';
  if (r.includes('3rd') || r.includes('bronze')) return '#b45309';
  return '#00f5ff';
};

export default function CompetitionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comp, setComp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    getCompetitions().then(list => {
      setComp(list.find(c => c.id === id) || null);
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

  if (!comp) return (
    <>
      <Starfield />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <p style={{ fontFamily: 'Orbitron', color: '#ef4444', letterSpacing: 2 }}>COMPETITION NOT FOUND</p>
        <button onClick={() => navigate('/')} style={backBtnStyle}>← BACK</button>
      </div>
    </>
  );

  const color = RESULT_COLOR(comp.result);
  const imgSrc = driveImageUrl(comp.imageUrl);
  const tags = typeof comp.tags === 'string'
    ? comp.tags.split(',').map(t => t.trim()).filter(Boolean)
    : (comp.tags || []);

  return (
    <>
      <SpaceshipCursor />
      <Starfield />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', padding: '40px 5vw 80px', maxWidth: 860, margin: '0 auto' }}>

        <motion.button {...fadeUp(0)} onClick={() => navigate('/')} style={backBtnStyle}>
          ← BACK TO PORTFOLIO
        </motion.button>

        {/* Header */}
        <motion.div {...fadeUp(0.1)} style={{ marginBottom: 40, marginTop: 16 }}>
          <p style={{ fontFamily: 'Orbitron', fontSize: '0.72rem', color: '#00f5ff', letterSpacing: 3, marginBottom: 10 }}>
            COMPETITION
          </p>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontFamily: 'Orbitron', fontWeight: 900,
                fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                background: `linear-gradient(135deg, #ffffff, ${color})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                marginBottom: 10, lineHeight: 1.2,
              }}>{comp.title}</h1>

              {comp.organizer && (
                <div style={{ fontFamily: 'Orbitron', fontSize: '0.85rem', color: '#a855f7', letterSpacing: 2, marginBottom: 8 }}>
                  {comp.organizer}
                </div>
              )}

              {comp.date && (
                <div style={{ fontFamily: 'Orbitron', fontSize: '0.7rem', color: '#475569', letterSpacing: 1 }}>
                  {new Date(comp.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              )}
            </div>

            {/* Result badge */}
            {comp.result && (
              <div style={{
                flexShrink: 0, padding: '16px 24px', borderRadius: 12,
                background: `${color}15`, border: `1px solid ${color}44`,
                fontFamily: 'Orbitron', fontWeight: 900, fontSize: '1rem',
                color, textAlign: 'center', letterSpacing: 1,
                boxShadow: `0 0 30px ${color}22`,
              }}>
                {comp.result}
              </div>
            )}
          </div>
        </motion.div>

        {/* Certificate / proof image */}
        {imgSrc && !imgError && (
          <motion.div {...fadeUp(0.2)} style={{ marginBottom: 40 }}>
            <div style={{
              border: `1px solid ${color}33`,
              borderRadius: 16, overflow: 'hidden',
              boxShadow: `0 0 60px ${color}10`,
              background: 'rgba(255,255,255,0.02)',
            }}>
              <img
                src={imgSrc}
                alt={comp.title}
                onError={() => setImgError(true)}
                style={{ width: '100%', display: 'block', borderRadius: 16 }}
              />
            </div>
          </motion.div>
        )}

        {/* Description */}
        {comp.description && (
          <motion.div {...fadeUp(0.3)} style={{ marginBottom: 36 }}>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: '0.75rem', letterSpacing: 3, color, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'inline-block', width: 24, height: 1, background: color }} />
              ABOUT
            </h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.9, fontSize: '0.95rem' }}>{comp.description}</p>
          </motion.div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <motion.div {...fadeUp(0.4)} style={{ marginBottom: 36 }}>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: '0.75rem', letterSpacing: 3, color, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'inline-block', width: 24, height: 1, background: color }} />
              TECHNOLOGIES
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {tags.map(tag => (
                <span key={tag} style={{
                  padding: '6px 14px', borderRadius: 4,
                  background: `${color}10`, color,
                  border: `1px solid ${color}30`,
                  fontFamily: 'Orbitron', fontSize: '0.75rem', letterSpacing: 0.5,
                }}>{tag}</span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </>
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
