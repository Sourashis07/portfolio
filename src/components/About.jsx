import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getProfile } from '../firebase';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef(null);
  const avatarRef = useRef(null);
  const textRef = useRef(null);
  const titleRef = useRef(null);
  const statsRef = useRef(null);
  const [profile, setProfile] = useState({});

  useEffect(() => { getProfile().then(setProfile); }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          end: 'top 25%',
          scrub: 0.6,
        },
      });

      // Title drops in from above
      tl.fromTo(titleRef.current,
        { y: -60, opacity: 0, letterSpacing: '0.6em' },
        { y: 0, opacity: 1, letterSpacing: '0.05em', duration: 1 },
        0
      );

      // Avatar flies in from far left
      tl.fromTo(avatarRef.current,
        { x: '-110vw', opacity: 0, rotation: -15 },
        { x: 0, opacity: 1, rotation: 0, duration: 1.2, ease: 'power3.out' },
        0.1
      );

      // Text block flies in from far right
      tl.fromTo(textRef.current,
        { x: '110vw', opacity: 0, rotation: 15 },
        { x: 0, opacity: 1, rotation: 0, duration: 1.2, ease: 'power3.out' },
        0.1
      );

      // Stats count up from below
      tl.fromTo(statsRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        0.6
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const stats = [
    { value: profile.yearsExp || '3+', label: 'Years Experience' },
    { value: profile.projectsBuilt || '20+', label: 'Projects Built' },
    { value: profile.technologies || '10+', label: 'Technologies' },
  ];

  return (
    <section id="about" className="section" ref={sectionRef}>
      <h2 className="section-title" ref={titleRef} style={{ opacity: 0 }}>
        ABOUT ME
      </h2>

      <div style={{
        maxWidth: 1100, margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 48, alignItems: 'center',
        overflow: 'hidden',
      }}>
        {/* Avatar — enters from left */}
        <div ref={avatarRef} style={{ display: 'flex', justifyContent: 'center', opacity: 0 }}>
          <div style={{ position: 'relative', width: 260, height: 260 }}>
            <div style={{
              width: 260, height: 260, borderRadius: '50%',
              background: 'var(--avatar-bg)',
              border: '2px solid var(--avatar-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--avatar-shadow)',
              overflow: 'hidden',
            }}>
              {profile.avatarUrl
                ? <img src={profile.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (
                  <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="38" r="22" fill="rgba(0,245,255,0.3)" stroke="#00f5ff" strokeWidth="1.5" />
                    <path d="M10 95 Q50 60 90 95" fill="rgba(0,245,255,0.15)" stroke="#00f5ff" strokeWidth="1.5" />
                  </svg>
                )
              }
            </div>
            {/* Orbit ring — pure CSS so it doesn't interfere with GSAP */}
            <div style={{
              position: 'absolute', inset: -16,
              border: '1px dashed var(--orbit-ring)',
              borderRadius: '50%',
              animation: 'spin 8s linear infinite',
            }} />
          </div>
        </div>

        {/* Text — enters from right */}
        <div ref={textRef} style={{ opacity: 0 }}>
          <p style={{ color: 'var(--section-label)', fontFamily: 'Orbitron', fontSize: '0.8rem', letterSpacing: 3, marginBottom: 16 }}>
            WHO I AM
          </p>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 20 }}>
            {profile.bio1 || "I'm a passionate full-stack developer who loves building sleek, performant web applications. I thrive at the intersection of creative design and robust engineering."}
          </p>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 36 }}>
            {profile.bio2 || "When I'm not coding, I'm exploring the latest in AI, space tech, and open-source ecosystems. I believe great software should feel as good as it works."}
          </p>

          {/* Stats */}
          <div ref={statsRef} style={{ display: 'flex', gap: 32, flexWrap: 'wrap', opacity: 0 }}>
            {stats.map((s) => (
              <div key={s.label}>
                <div style={{ fontFamily: 'Orbitron', fontSize: '2rem', fontWeight: 900, color: 'var(--stat-color)', textShadow: '0 0 20px var(--stat-shadow)' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
