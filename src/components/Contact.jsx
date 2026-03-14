import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { getProfile, saveMessage } from '../firebase';

function GlowInput({ as: Tag = 'input', label, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', fontFamily: 'Orbitron', letterSpacing: 1, marginBottom: 8 }}>
        {label}
      </label>
      <Tag
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${focused ? 'var(--accent)' : 'var(--input-border)'}`,
          borderRadius: 6, padding: '12px 16px',
          color: 'var(--text-primary)', fontSize: '0.95rem', fontFamily: 'Inter',
          outline: 'none', resize: 'vertical',
          background: 'var(--input-bg)',
          boxShadow: focused ? '0 0 16px rgba(0,245,255,0.15)' : 'none',
          transition: 'all 0.2s',
        }}
      />
    </div>
  );
}

export default function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [socials, setSocials] = useState([]);

  useEffect(() => {
    getProfile().then(p => {
      const links = [];
      if (p?.githubUrl)   links.push({ label: 'GitHub',   href: p.githubUrl });
      if (p?.linkedinUrl) links.push({ label: 'LinkedIn', href: p.linkedinUrl });
      setSocials(links);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await saveMessage(form);
    setSending(false);
    setSent(true);
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <section id="contact" className="section" ref={ref}>
      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        CONTACT
      </motion.h2>

      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 48 }}>
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <p style={{ color: 'var(--section-label)', fontFamily: 'Orbitron', fontSize: '0.8rem', letterSpacing: 3, marginBottom: 16 }}>GET IN TOUCH</p>
          <h3 style={{ fontFamily: 'Orbitron', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, lineHeight: 1.3 }}>
            Let's Build<br />Something Great
          </h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 36 }}>
            Open to freelance projects, full-time roles, and exciting collaborations.
            Drop a message and I'll get back to you within 24 hours.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {socials.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem',
                  transition: 'color 0.2s', fontFamily: 'Orbitron', letterSpacing: 1,
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', boxShadow: '0 0 6px var(--accent)' }} />
                {s.label}
              </a>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 12, padding: 32,
          }}
        >
          <GlowInput label="NAME" type="text" placeholder="Your name" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <GlowInput label="EMAIL" type="email" placeholder="your@email.com" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          <GlowInput as="textarea" label="MESSAGE" placeholder="Tell me about your project..." rows={5} required value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />

          <button
            type="submit"
            disabled={sending}
            style={{
              width: '100%', padding: '14px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: sent ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--btn-primary-bg)',
              color: sent ? '#fff' : 'var(--btn-primary-color)', fontFamily: 'Orbitron', fontWeight: 700, fontSize: '0.85rem', letterSpacing: 1,
              boxShadow: sent ? '0 0 24px rgba(16,185,129,0.4)' : '0 0 24px rgba(0,245,255,0.3)',
              transition: 'all 0.3s', opacity: sending ? 0.7 : 1,
            }}
          >
            {sent ? 'MESSAGE SENT' : sending ? 'SENDING...' : 'SEND MESSAGE'}
          </button>
        </motion.form>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.6 }}
        style={{ textAlign: 'center', marginTop: 80, color: 'var(--footer-color)', fontSize: '0.8rem', fontFamily: 'Orbitron', letterSpacing: 2 }}
      >
        © 2026 SOURASHIS · BUILT WITH REACT + VITE
      </motion.div>
    </section>
  );
}
