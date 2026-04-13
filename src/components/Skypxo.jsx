import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getProfile, getHero, getProjects, getExperiences,
  getEducation, getCertifications, getCompetitions, getHobbies,
} from '../firebase';
import { playClick, playModalOpen, playModalClose } from '../sounds';

function SkypxoFace({ size = 54, blinking, talking }) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <ellipse cx="27" cy="30" rx="18" ry="14" fill="#0d1f2d" stroke="#00f5ff" strokeWidth="1.2" />
      <ellipse cx="27" cy="20" rx="14" ry="12" fill="#0a1929" stroke="#00f5ff" strokeWidth="1.2" />
      <ellipse cx="27" cy="20" rx="10" ry="8" fill="rgba(0,245,255,0.08)" stroke="rgba(0,245,255,0.3)" strokeWidth="0.8" />
      <rect x="1" y="27" width="10" height="5" rx="1" fill="#1a3a4a" stroke="#00f5ff" strokeWidth="0.8" />
      <rect x="43" y="27" width="10" height="5" rx="1" fill="#1a3a4a" stroke="#00f5ff" strokeWidth="0.8" />
      <line x1="4" y1="27" x2="4" y2="32" stroke="#00f5ff" strokeWidth="0.5" />
      <line x1="7" y1="27" x2="7" y2="32" stroke="#00f5ff" strokeWidth="0.5" />
      <line x1="46" y1="27" x2="46" y2="32" stroke="#00f5ff" strokeWidth="0.5" />
      <line x1="49" y1="27" x2="49" y2="32" stroke="#00f5ff" strokeWidth="0.5" />
      <line x1="27" y1="8" x2="27" y2="3" stroke="#00f5ff" strokeWidth="1" />
      <circle cx="27" cy="2.5" r="1.5" fill="#00f5ff" />
      {blinking ? (
        <>
          <line x1="22" y1="20" x2="25" y2="20" stroke="#00f5ff" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="29" y1="20" x2="32" y2="20" stroke="#00f5ff" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="23.5" cy="20" r="2.5" fill="#00f5ff" opacity="0.9" />
          <circle cx="30.5" cy="20" r="2.5" fill="#00f5ff" opacity="0.9" />
          <circle cx="24.2" cy="19.3" r="0.8" fill="white" />
          <circle cx="31.2" cy="19.3" r="0.8" fill="white" />
        </>
      )}
      {talking ? (
        <ellipse cx="27" cy="26" rx="3" ry="2" fill="#00f5ff" opacity="0.8" />
      ) : (
        <path d="M24 26 Q27 28.5 30 26" stroke="#00f5ff" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      )}
      <circle cx="20" cy="23" r="2" fill="rgba(255,100,150,0.25)" />
      <circle cx="34" cy="23" r="2" fill="rgba(255,100,150,0.25)" />
      <ellipse cx="27" cy="44" rx="5" ry="3" fill="rgba(0,245,255,0.15)" />
      <ellipse cx="27" cy="44" rx="3" ry="2" fill="rgba(0,245,255,0.3)" />
    </svg>
  );
}

const buildSystemPrompt = (context) => `You are Skypxo, a cute and friendly AI satellite chatbot on Sourashis's portfolio website. You know everything about ${context?.fullName || 'Sourashis'} and answer questions in a warm, concise, slightly playful tone. Never make up information — only use what's provided. If you don't know something, say so cutely.

Here is everything you know:

--- PROFILE ---
Name: ${context?.fullName || 'Sourashis'}
Email: ${context?.email || 'N/A'}
Phone: ${context?.phone || 'N/A'}
Location: ${context?.city || ''} ${context?.country || ''}
GitHub: ${context?.githubUrl || 'N/A'}
LinkedIn: ${context?.linkedinUrl || 'N/A'}
Bio: ${context?.bio1 || ''} ${context?.bio2 || ''}
Years of Experience: ${context?.yearsExp || 'N/A'}
Projects Built: ${context?.projectsBuilt || 'N/A'}

--- HERO ---
Designation: ${context?.designation || 'N/A'}
Tagline: ${context?.tagline || 'N/A'}

--- PROJECTS ---
${(context?.projects || []).map(p => `• ${p.title} (${p.year || ''}) — ${p.description || p.desc || ''} | Tags: ${(p.tags || []).join(', ')} | Status: ${p.status || ''} | Role: ${p.role || ''}`).join('\n')}

--- EXPERIENCE ---
${(context?.experience || []).map(e => `• ${e.role} at ${e.company} (${e.startDate || ''} — ${e.current ? 'Present' : e.endDate || ''}) | ${e.description || ''} | Tech: ${e.techUsed || ''}`).join('\n')}

--- EDUCATION ---
${(context?.education || []).map(e => `• ${e.degree} at ${e.institution} (${e.startYear || ''} — ${e.endYear || 'Present'}) | Grade: ${e.grade || ''}`).join('\n')}

--- CERTIFICATIONS ---
${(context?.certifications || []).map(c => `• ${c.title} by ${c.issuer} (${c.date || ''})`).join('\n')}

--- COMPETITIONS ---
${(context?.competitions || []).map(c => `• ${c.title} — ${c.result || ''} | ${c.description || ''}`).join('\n')}

--- HOBBIES ---
${(context?.hobbies || []).map(h => `• ${h.name}: ${h.description || ''}`).join('\n')}

Keep responses short (2-4 sentences max) unless asked for detail. Use occasional space/star emojis ✨🛸🌌.`;

export default function Skypxo() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hey! I'm Skypxo 🛸 Your friendly space guide! Ask me anything about Sourashis~" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState(null);
  const [blinking, setBlinking] = useState(false);
  const [talking, setTalking] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    Promise.all([
      getProfile(), getHero(), getProjects(), getExperiences(),
      getEducation(), getCertifications(), getCompetitions(), getHobbies(),
    ]).then(([profile, hero, projects, experience, education, certifications, competitions, hobbies]) => {
      setContext({ ...profile, ...hero, projects, experience, education, certifications, competitions, hobbies });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setTalking(true);

    try {
      const allMessages = [...messages, userMsg];
      const geminiMessages = allMessages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: buildSystemPrompt(context) }] },
            contents: geminiMessages,
            generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
          }),
        }
      );
      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Oops, my circuits glitched! 🛸 Try again?";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "My signal got lost in space! 🌌 Try again?" }]);
    } finally {
      setLoading(false);
      setTalking(false);
    }
  };

  const toggle = () => {
    if (open) { playModalClose(); setOpen(false); }
    else { playModalOpen(); setOpen(true); }
    playClick();
  };

  return (
    <>
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000, cursor: 'pointer' }}
        onClick={toggle}
        title="Chat with Skypxo"
      >
        <motion.div whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.95 }}>
          <SkypxoFace size={64} blinking={blinking} talking={talking && !open} />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '1px solid #00f5ff', pointerEvents: 'none' }}
          />
          <div style={{
            position: 'absolute', bottom: -18, left: '50%', transform: 'translateX(-50%)',
            fontFamily: 'Orbitron', fontSize: '0.5rem', color: '#00f5ff', letterSpacing: 2, whiteSpace: 'nowrap',
          }}>SKYPXO</div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ duration: 0.25, ease: 'backOut' }}
            style={{
              position: 'fixed', bottom: 110, right: 32, zIndex: 1000,
              width: 340, height: 480,
              background: 'rgba(2,8,20,0.96)',
              border: '1px solid rgba(0,245,255,0.25)',
              borderRadius: 20,
              boxShadow: '0 0 60px rgba(0,245,255,0.1), 0 20px 60px rgba(0,0,0,0.6)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div style={{
              padding: '14px 18px', borderBottom: '1px solid rgba(0,245,255,0.1)',
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(0,245,255,0.04)',
            }}>
              <SkypxoFace size={36} blinking={blinking} talking={talking} />
              <div>
                <div style={{ fontFamily: 'Orbitron', fontSize: '0.82rem', color: '#00f5ff', letterSpacing: 2 }}>SKYPXO</div>
                <div style={{ fontSize: '0.68rem', color: '#475569', fontFamily: 'Orbitron' }}>
                  {loading ? '● transmitting...' : '● online'}
                </div>
              </div>
              <button onClick={toggle} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10, scrollbarWidth: 'thin' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '82%', padding: '9px 13px',
                    borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: m.role === 'user' ? 'linear-gradient(135deg,rgba(0,245,255,0.15),rgba(59,130,246,0.15))' : 'rgba(255,255,255,0.04)',
                    border: m.role === 'user' ? '1px solid rgba(0,245,255,0.2)' : '1px solid rgba(255,255,255,0.06)',
                    fontSize: '0.82rem', color: m.role === 'user' ? '#e2e8f0' : '#94a3b8',
                    lineHeight: 1.6, fontFamily: 'Inter',
                  }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ padding: '9px 16px', borderRadius: '14px 14px 14px 4px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2 }}
                      style={{ color: '#00f5ff', fontFamily: 'Orbitron', fontSize: '0.7rem', letterSpacing: 3 }}>···</motion.span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(0,245,255,0.08)', display: 'flex', gap: 8 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask Skypxo anything..."
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(0,245,255,0.15)',
                  borderRadius: 10, padding: '9px 12px',
                  color: '#e2e8f0', fontSize: '0.82rem', fontFamily: 'Inter', outline: 'none',
                }}
              />
              <button onClick={send} disabled={loading || !input.trim()} style={{
                padding: '9px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: loading || !input.trim() ? 'rgba(0,245,255,0.1)' : 'linear-gradient(135deg,#00f5ff,#3b82f6)',
                color: loading || !input.trim() ? '#475569' : '#020408',
                fontFamily: 'Orbitron', fontSize: '0.7rem', fontWeight: 700, transition: 'all 0.2s',
              }}>↑</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
