import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProject } from '../firebase';
import Starfield from '../components/Starfield';
import SpaceshipCursor from '../components/SpaceshipCursor';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

function YoutubeEmbed({ url }) {
  const match = url?.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
  if (!match) return null;
  return (
    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,245,255,0.2)' }}>
      <iframe
        src={`https://www.youtube.com/embed/${match[1]}`}
        title="Demo"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  );
}

function Section({ title, color, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h3 style={{
        fontFamily: 'Orbitron', fontSize: '0.8rem', letterSpacing: 3,
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

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProject(id).then(p => { setProject(p); setLoading(false); });
  }, [id]);

  if (loading) return (
    <>
      <Starfield />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Orbitron', color: '#00f5ff', letterSpacing: 3 }}>
        LOADING...
      </div>
    </>
  );

  if (!project) return (
    <>
      <Starfield />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <p style={{ fontFamily: 'Orbitron', color: '#ef4444', letterSpacing: 2 }}>PROJECT NOT FOUND</p>
        <button onClick={() => navigate('/')} style={backBtnStyle}>← BACK</button>
      </div>
    </>
  );

  const color = project.color || '#00f5ff';

  return (
    <>
      <SpaceshipCursor />
      <Starfield />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', padding: '40px 5vw 80px', maxWidth: 900, margin: '0 auto' }}>

        {/* Back button */}
        <motion.button {...fadeUp(0)} onClick={() => navigate('/')} style={backBtnStyle}>
          ← BACK TO PORTFOLIO
        </motion.button>

        {/* Header */}
        <motion.div {...fadeUp(0.1)} style={{ marginBottom: 48, marginTop: 16 }}>
          <h1 style={{
            fontFamily: 'Orbitron', fontWeight: 900,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            background: `linear-gradient(135deg, #ffffff, ${color})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            marginBottom: 12,
          }}>{project.title}</h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 680 }}>{project.description}</p>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20 }}>
            {(project.tags || []).map(tag => (
              <span key={tag} style={{
                padding: '5px 12px', borderRadius: 4, fontSize: '0.78rem',
                background: `${color}15`, color,
                border: `1px solid ${color}30`,
                fontFamily: 'Orbitron', letterSpacing: 0.5,
              }}>{tag}</span>
            ))}
          </div>
        </motion.div>

        {/* Links row */}
        <motion.div {...fadeUp(0.2)} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 48 }}>
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noreferrer" style={{ ...linkBtnStyle, borderColor: color, color }}>
              ⌥ GITHUB REPO
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" style={{ ...linkBtnStyle, background: color, color: '#020408', border: 'none', fontWeight: 700 }}>
              ◉ LIVE DEMO
            </a>
          )}
        </motion.div>

        {/* Video Demo */}
        {project.videoUrl && (
          <motion.div {...fadeUp(0.25)} style={{ marginBottom: 48 }}>
            <Section title="VIDEO DEMO" color={color}>
              <YoutubeEmbed url={project.videoUrl} />
            </Section>
          </motion.div>
        )}

        {/* Description / Overview */}
        {project.overview && (
          <motion.div {...fadeUp(0.3)}>
            <Section title="OVERVIEW" color={color}>
              <p style={{ color: '#94a3b8', lineHeight: 1.9, fontSize: '0.95rem', whiteSpace: 'pre-line' }}>{project.overview}</p>
            </Section>
          </motion.div>
        )}

        {/* Tech Stack */}
        {project.techStack && (
          <motion.div {...fadeUp(0.35)}>
            <Section title="TECH STACK" color={color}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {project.techStack.map(t => (
                  <div key={t.name} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${color}22`,
                    borderRadius: 8, padding: '12px 16px',
                  }}>
                    <div style={{ fontFamily: 'Orbitron', fontSize: '0.82rem', color, marginBottom: 4 }}>{t.name}</div>
                    {t.purpose && <div style={{ fontSize: '0.78rem', color: '#475569' }}>{t.purpose}</div>}
                  </div>
                ))}
              </div>
            </Section>
          </motion.div>
        )}

        {/* Architecture */}
        {project.architecture && (
          <motion.div {...fadeUp(0.4)}>
            <Section title="ARCHITECTURE" color={color}>
              <p style={{ color: '#94a3b8', lineHeight: 1.9, fontSize: '0.95rem', whiteSpace: 'pre-line' }}>{project.architecture}</p>
            </Section>
          </motion.div>
        )}

        {/* Documentation */}
        {project.documentation && (
          <motion.div {...fadeUp(0.45)}>
            <Section title="DOCUMENTATION" color={color}>
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${color}22`,
                borderRadius: 10, padding: 24,
                color: '#94a3b8', lineHeight: 1.9, fontSize: '0.92rem', whiteSpace: 'pre-line',
              }}>
                {project.documentation}
              </div>
            </Section>
          </motion.div>
        )}

        {/* Challenges */}
        {project.challenges && (
          <motion.div {...fadeUp(0.5)}>
            <Section title="CHALLENGES & SOLUTIONS" color={color}>
              <p style={{ color: '#94a3b8', lineHeight: 1.9, fontSize: '0.95rem', whiteSpace: 'pre-line' }}>{project.challenges}</p>
            </Section>
          </motion.div>
        )}

        {/* Status / Meta */}
        <motion.div {...fadeUp(0.55)}>
          <Section title="PROJECT INFO" color={color}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
              {project.status && <Meta label="STATUS" value={project.status} color={color} />}
              {project.year && <Meta label="YEAR" value={project.year} color={color} />}
              {project.role && <Meta label="ROLE" value={project.role} color={color} />}
              {project.teamSize && <Meta label="TEAM SIZE" value={project.teamSize} color={color} />}
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
      <div style={{ fontSize: '0.7rem', color: '#475569', fontFamily: 'Orbitron', letterSpacing: 2, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1rem', color, fontFamily: 'Orbitron', fontWeight: 700 }}>{value}</div>
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

const linkBtnStyle = {
  padding: '10px 24px',
  borderRadius: 4,
  border: '1px solid',
  fontFamily: 'Orbitron',
  fontSize: '0.78rem',
  letterSpacing: 1,
  textDecoration: 'none',
  transition: 'opacity 0.2s',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
};
