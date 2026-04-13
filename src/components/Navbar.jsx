import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { getExperiences } from '../firebase';
import { playClick, playNav, playHover, playModalOpen, playModalClose, playError, playSuccess } from '../sounds';

const ADMIN_PASSWORD = 'soura@admin2025';
const BASE_LINKS = ['About', 'Projects', 'Education', 'Certifications', 'Competitions', 'Hobbies', 'Contact'];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [hasExp, setHasExp] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    getExperiences().then(d => setHasExp(d.length > 0)).catch(() => {});
  }, []);

  const links = hasExp
    ? ['About', 'Experience', 'Projects', 'Education', 'Certifications', 'Competitions', 'Hobbies', 'Contact']
    : BASE_LINKS;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    playNav();
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setShowModal(false);
      setPassword('');
      setError('');
      playSuccess();
      navigate('/admin');
    } else {
      playError();
      setError('ACCESS DENIED — INVALID PASSWORD');
      setPassword('');
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          padding: '16px 5vw',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: scrolled ? 'var(--nav-bg)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--nav-border)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <span style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: '1.2rem', color: 'var(--accent)', letterSpacing: 2 }}>
          &lt;SOURA/&gt;
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="nav-desktop">
          {links.map(l => (
            <button key={l} onClick={() => scrollTo(l)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'Inter', fontSize: '0.9rem', letterSpacing: 1, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--accent)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
            >{l}</button>
          ))}
          {/* Theme toggle removed */}
          <button
            onClick={() => { setShowModal(true); setError(''); setPassword(''); playModalOpen(); }}
            style={{
              background: 'transparent', border: '1px solid rgba(168,85,247,0.4)',
              color: '#a855f7', cursor: 'pointer', fontFamily: 'Orbitron',
              fontSize: '0.72rem', letterSpacing: 1, padding: '6px 14px', borderRadius: 4,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.1)'; e.currentTarget.style.borderColor = '#a855f7'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)'; }}
          >
            ADMIN
          </button>
        </div>

        <button onClick={() => setOpen(!open)}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', flexDirection: 'column', gap: 5 }}
          className="nav-hamburger"
        >
          {[0,1,2].map(i => (
            <span key={i} style={{ display: 'block', width: 24, height: 2, background: 'var(--accent)', borderRadius: 2 }} />
          ))}
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: 'var(--nav-bg)', backdropFilter: 'blur(12px)', padding: '20px 5vw',
            display: 'flex', flexDirection: 'column', gap: 16,
            borderBottom: '1px solid var(--nav-border)',
          }}>
            {links.map(l => (
              <button key={l} onClick={() => scrollTo(l)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'Inter', fontSize: '1rem', textAlign: 'left' }}
              >{l}</button>
            ))}
            <button onClick={() => { setOpen(false); setShowModal(true); }}
              style={{ background: 'none', border: 'none', color: 'var(--accent2)', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.8rem', textAlign: 'left', letterSpacing: 1 }}
            >ADMIN MODE</button>
          </div>
        )}

        <style>{`
          @media (max-width: 640px) {
            .nav-desktop { display: none !important; }
            .nav-hamburger { display: flex !important; }
          }
        `}</style>
      </motion.nav>

      {/* Password Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9000,
              background: 'var(--modal-bg)', backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); playModalClose(); } }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              style={{
                background: 'var(--modal-card-bg)',
                border: '1px solid rgba(168,85,247,0.3)',
                borderRadius: 16, padding: 40, width: '100%', maxWidth: 400,
                boxShadow: '0 0 60px rgba(168,85,247,0.15)',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <h2 style={{ fontFamily: 'Orbitron', fontSize: '1rem', color: 'var(--accent2)', letterSpacing: 2, marginBottom: 8 }}>ADMIN ACCESS</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Enter your admin password to continue</p>
              </div>

              <form onSubmit={handleAdminSubmit}>
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Password"
                  autoFocus
                  style={{
                    width: '100%', background: 'var(--input-bg)',
                    border: `1px solid ${error ? '#ef4444' : 'rgba(168,85,247,0.3)'}`,
                    borderRadius: 6, padding: '12px 16px',
                    color: 'var(--text-primary)', fontSize: '0.95rem', fontFamily: 'Inter',
                    outline: 'none', marginBottom: 8,
                    boxSizing: 'border-box',
                  }}
                />
                {error && <p style={{ color: '#ef4444', fontSize: '0.75rem', fontFamily: 'Orbitron', letterSpacing: 1, marginBottom: 12 }}>{error}</p>}
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button type="button" onClick={() => { setShowModal(false); playModalClose(); }}
                    style={{ flex: 1, padding: '12px', borderRadius: 6, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.75rem', letterSpacing: 1 }}
                  >CANCEL</button>
                  <button type="submit"
                    style={{ flex: 1, padding: '12px', borderRadius: 6, background: 'linear-gradient(135deg, #a855f7, #7c3aed)', border: 'none', color: '#fff', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.75rem', letterSpacing: 1, boxShadow: '0 0 20px rgba(168,85,247,0.3)' }}
                  >ENTER</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
