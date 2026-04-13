import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCertifications } from '../firebase';
import Starfield from '../components/Starfield';
import SpaceshipCursor from '../components/SpaceshipCursor';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

// Convert any Google Drive share link to an embeddable image URL
// For non-Drive URLs (imgur, imgbb, etc.) pass through directly
function driveImageUrl(url) {
  if (!url) return null;
  if (!url.includes('drive.google.com')) return url;
  if (url.includes('drive.google.com/thumbnail?')) return url;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  return url;
}

export default function CertificationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    getCertifications().then(list => {
      setCert(list.find(c => c.id === id) || null);
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

  if (!cert) return (
    <>
      <Starfield />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <p style={{ fontFamily: 'Orbitron', color: '#ef4444', letterSpacing: 2 }}>CERTIFICATION NOT FOUND</p>
        <button onClick={() => navigate('/')} style={backBtnStyle}>← BACK</button>
      </div>
    </>
  );

  const imgSrc = driveImageUrl(cert.imageUrl);

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
            CERTIFICATION
          </p>
          <h1 style={{
            fontFamily: 'Orbitron', fontWeight: 900,
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            background: 'linear-gradient(135deg, #ffffff, #00f5ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            marginBottom: 10, lineHeight: 1.2,
          }}>{cert.title}</h1>

          <div style={{ fontFamily: 'Orbitron', fontSize: '0.85rem', color: '#a855f7', letterSpacing: 2, marginBottom: 8 }}>
            {cert.issuer}
          </div>

          {cert.date && (
            <div style={{ fontFamily: 'Orbitron', fontSize: '0.7rem', color: '#475569', letterSpacing: 1 }}>
              {new Date(cert.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          )}
        </motion.div>

        {/* Certificate Image */}
        {imgSrc && !imgError && (
          <motion.div {...fadeUp(0.2)} style={{ marginBottom: 40 }}>
            <div style={{
              border: '1px solid rgba(0,245,255,0.2)',
              borderRadius: 16, overflow: 'hidden',
              boxShadow: '0 0 60px rgba(0,245,255,0.08)',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <img
                src={imgSrc}
                alt={cert.title}
                onError={() => setImgError(true)}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                style={{ width: '100%', display: 'block', borderRadius: 16 }}
              />
            </div>
          </motion.div>
        )}
        {imgError && cert.imageUrl && (
          <motion.div {...fadeUp(0.2)} style={{ marginBottom: 40 }}>
            <a href={cert.imageUrl} target="_blank" rel="noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 24px', borderRadius: 8,
                border: '1px solid rgba(0,245,255,0.25)',
                color: '#00f5ff', fontFamily: 'Orbitron', fontSize: '0.75rem',
                letterSpacing: 1, textDecoration: 'none',
              }}
            >
              VIEW CERTIFICATE IN DRIVE →
            </a>
          </motion.div>
        )}

        {/* Description */}
        {cert.description && (
          <motion.div {...fadeUp(0.3)} style={{ marginBottom: 36 }}>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: '0.75rem', letterSpacing: 3, color: '#00f5ff', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'inline-block', width: 24, height: 1, background: '#00f5ff' }} />
              ABOUT
            </h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.9, fontSize: '0.95rem' }}>{cert.description}</p>
          </motion.div>
        )}

        {/* Credential link */}
        {cert.credentialUrl && (
          <motion.div {...fadeUp(0.4)}>
            <a
              href={cert.credentialUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 28px', borderRadius: 6,
                background: 'linear-gradient(135deg, #00f5ff, #3b82f6)',
                color: '#020408', fontFamily: 'Orbitron', fontWeight: 700,
                fontSize: '0.78rem', letterSpacing: 1, textDecoration: 'none',
                boxShadow: '0 0 24px rgba(0,245,255,0.3)',
              }}
            >
              VERIFY CREDENTIAL →
            </a>
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
