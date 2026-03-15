import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getExperiences } from '../firebase';

function formatDate(dateStr, current) {
  if (current) return 'PRESENT';
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// Layout constants
const CARD_W    = 300;
const CARD_H    = 230;   // fixed card height
const GAP       = 80;
const START_PAD = 120;
const END_PAD   = 80;
const LINE_Y    = 280;   // Y of the line from container top
const CONN_H    = 32;    // connector line height (card edge → dot)
const DOT_D     = 14;    // dot diameter
// Total container height: cards above need LINE_Y space, cards below need CARD_H + CONN_H + DOT_D
const CONT_H    = LINE_Y + CONN_H + DOT_D / 2 + CARD_H + 40;

export default function Experience() {
  const sectionRef = useRef(null);
  const [experiences, setExperiences] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const inView = useInView(sectionRef, { once: true, margin: '-40px' });
  const navigate = useNavigate();

  useEffect(() => {
    getExperiences()
      .then(d => {
        // sort oldest → newest (left → right)
        const sorted = [...d].sort((a, b) => {
          if (!a.startDate) return 1;
          if (!b.startDate) return -1;
          return new Date(a.startDate) - new Date(b.startDate);
        });
        setExperiences(sorted);
        setLoaded(true);
      })
      .catch(() => { setExperiences([]); setLoaded(true); });
  }, []);

  if (loaded && experiences.length === 0) return null;

  const getTechs = (exp) => typeof exp.techUsed === 'string'
    ? exp.techUsed.split(',').map(t => t.trim()).filter(Boolean)
    : (exp.techUsed || []);

  const show = loaded && inView;
  const totalW = Math.max(START_PAD + experiences.length * (CARD_W + GAP) + END_PAD, 1000);

  return (
    <section id="experience" ref={sectionRef} style={{ padding: '100px 0 80px' }}>
      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 30 }}
        animate={show ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        EXPERIENCE
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={show ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ textAlign: 'center', color: '#475569', fontFamily: 'Orbitron', fontSize: '0.68rem', letterSpacing: 3, marginBottom: 48 }}
      >
        SCROLL TO EXPLORE MISSION HISTORY
      </motion.p>

      {loaded && (
        <div style={{ position: 'relative', overflowX: 'auto', overflowY: 'visible', scrollbarWidth: 'none' }}>
          <style>{`
            .exp-scroll::-webkit-scrollbar { display: none }
            .exp-card { transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s; }
            .exp-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(0,245,255,0.13) !important; border-color: rgba(0,245,255,0.5) !important; }
          `}</style>

          <div className="exp-scroll" style={{ position: 'relative', width: totalW, height: CONT_H }}>

            {/* ── Timeline line: starts after rocket tip, ends just before right edge ── */}
            <div style={{
              position: 'absolute',
              left: 72,
              width: totalW - 72 - END_PAD,
              top: LINE_Y,
              height: 2,
              background: 'linear-gradient(to right, #00f5ff 0%, #a855f7 55%, rgba(0,245,255,0.1) 100%)',
            }} />

{/* ── Rocket ── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={show ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7 }}
              style={{ position: 'absolute', left: 12, top: LINE_Y - 24, zIndex: 2, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="12" cy="24" r="11" fill="rgba(0,245,255,0.06)" />
                <path d="M16 21 Q9 24 16 27" stroke="#ff8c00" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
                <path d="M13 22 Q5 24 13 26" stroke="#ff4500" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <path d="M16 18 L38 24 L16 30 L18 26 L16 24 L18 22 Z" fill="rgba(0,245,255,0.18)" stroke="#00f5ff" strokeWidth="1.3"/>
                <path d="M20 22 L16 15 L18 20 Z" fill="rgba(168,85,247,0.8)"/>
                <path d="M20 26 L16 33 L18 28 Z" fill="rgba(168,85,247,0.8)"/>
                <ellipse cx="30" cy="24" rx="4.5" ry="3.5" fill="rgba(0,245,255,0.55)" stroke="#00f5ff" strokeWidth="0.9"/>
              </svg>

            </motion.div>

            {/* ── End cap ── */}
            <div style={{
              position: 'absolute',
              left: START_PAD + experiences.length * (CARD_W + GAP) - GAP / 2,
              top: LINE_Y - DOT_D / 2,
              width: DOT_D, height: DOT_D,
              borderRadius: '50%',
              background: experiences[experiences.length - 1]?.current ? '#00f5ff' : '#a855f7',
              boxShadow: `0 0 14px ${experiences[experiences.length - 1]?.current ? '#00f5ff' : '#a855f7'}`,
              zIndex: 2,
            }} />

            {/* ── Experience nodes ── */}
            {experiences.map((exp, i) => {
              const above = i % 2 === 0;
              const accent = exp.current ? '#00f5ff' : '#a855f7';

              // dot center X = card center X
              const dotX = START_PAD + i * (CARD_W + GAP) + CARD_W / 2;
              // dot top = LINE_Y - DOT_D/2  (so dot center sits on the line)
              const dotTop = LINE_Y - DOT_D / 2;

              // connector: bridges dot edge to card edge
              // above: connector goes from dotTop - CONN_H  to  dotTop
              // below: connector goes from dotTop + DOT_D   to  dotTop + DOT_D + CONN_H
              const connTop = above ? dotTop - CONN_H : dotTop + DOT_D;

              // card: sits above connector (above) or below connector (below)
              const cardTop = above ? connTop - CARD_H : connTop + CONN_H;

              // date label: on the opposite side of the line from the card
              const dateTop = above ? dotTop + DOT_D + 6 : dotTop - 18;

              return (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: above ? -30 : 30 }}
                  animate={show ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.55, delay: 0.15 + i * 0.13 }}
                >
                  {/* Card */}
                  <div
                    className="exp-card"
                    onClick={() => navigate(`/experience/${exp.id}`)}
                    style={{
                      position: 'absolute',
                      left: dotX - CARD_W / 2,
                      top: cardTop,
                      width: CARD_W,
                      height: CARD_H,
                      boxSizing: 'border-box',
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${exp.current ? 'rgba(0,245,255,0.25)' : 'rgba(168,85,247,0.2)'}`,
                      borderRadius: 12,
                      padding: '16px 18px 36px', // bottom padding reserves space for VIEW DETAILS
                      cursor: 'pointer',
                      overflow: 'hidden',
                    }}
                  >
                    {exp.current && (
                      <div style={{
                        position: 'absolute', top: 0, right: 14,
                        background: 'linear-gradient(135deg,#00f5ff,#3b82f6)',
                        color: '#020408', fontFamily: 'Orbitron', fontSize: '0.48rem',
                        letterSpacing: 1, padding: '2px 8px', borderRadius: '0 0 6px 6px', fontWeight: 700,
                      }}>CURRENT</div>
                    )}

                    {/* Role — single line, ellipsis */}
                    <div style={{
                      fontFamily: 'Orbitron', fontWeight: 700, fontSize: '0.82rem',
                      color: exp.current ? '#00f5ff' : '#e2e8f0',
                      marginBottom: 4, lineHeight: 1.3,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {exp.role}
                    </div>

                    {/* Company — single line, ellipsis */}
                    <div style={{
                      fontFamily: 'Orbitron', fontSize: '0.68rem', color: '#a855f7',
                      marginBottom: 5, letterSpacing: 1,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {exp.company}
                    </div>

                    {/* Date range */}
                    <div style={{
                      fontFamily: 'Orbitron', fontSize: '0.58rem', color: '#475569',
                      marginBottom: 10, letterSpacing: 1,
                    }}>
                      {formatDate(exp.startDate)} — {formatDate(exp.endDate, exp.current)}
                    </div>

                    {/* Description — 3 lines max, then ellipsis via CSS */}
                    {exp.description && (
                      <p style={{
                        fontSize: '0.74rem', color: '#64748b', lineHeight: 1.55,
                        margin: '0 0 10px',
                        display: '-webkit-box', WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {exp.description}
                      </p>
                    )}

                    {/* Tech tags — 1 row, no wrap */}
                    {getTechs(exp).length > 0 && (
                      <div style={{ display: 'flex', gap: 4, overflow: 'hidden' }}>
                        {getTechs(exp).slice(0, 3).map(t => (
                          <span key={t} style={{
                            padding: '2px 6px', borderRadius: 3, flexShrink: 0,
                            background: 'rgba(0,245,255,0.08)',
                            border: '1px solid rgba(0,245,255,0.2)',
                            fontFamily: 'Orbitron', fontSize: '0.52rem', color: '#00f5ff',
                            whiteSpace: 'nowrap',
                          }}>{t}</span>
                        ))}
                      </div>
                    )}

                    {/* VIEW DETAILS — always pinned to bottom, never overlaps */}
                    <div style={{
                      position: 'absolute', bottom: 10, right: 14,
                      fontFamily: 'Orbitron', fontSize: '0.5rem',
                      color: accent, letterSpacing: 1, opacity: 0.75,
                    }}>
                      VIEW DETAILS →
                    </div>
                  </div>

                  {/* Connector line */}
                  <div style={{
                    position: 'absolute',
                    left: dotX - 1,
                    top: connTop,
                    width: 1,
                    height: CONN_H,
                    background: `linear-gradient(to ${above ? 'bottom' : 'top'}, ${accent}88, transparent)`,
                  }} />

                  {/* Dot on line */}
                  <div style={{
                    position: 'absolute',
                    left: dotX - DOT_D / 2,
                    top: dotTop,
                    width: DOT_D, height: DOT_D,
                    borderRadius: '50%',
                    background: '#020408',
                    border: `2px solid ${accent}`,
                    boxShadow: `0 0 10px ${accent}`,
                    zIndex: 3,
                  }} />

                  {/* Date label — opposite side of card */}
                  <div style={{
                    position: 'absolute',
                    left: dotX,
                    top: dateTop,
                    transform: 'translateX(-50%)',
                    fontFamily: 'Orbitron', fontSize: '0.5rem',
                    color: '#334155', letterSpacing: 1, whiteSpace: 'nowrap',
                  }}>
                    {formatDate(exp.startDate)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
