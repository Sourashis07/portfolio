import { useEffect, useState, useRef } from 'react';

const SECTION_IDS = [
  'hero', 'about', 'experience', 'projects', 'skills',
  'education', 'certifications', 'competitions', 'hobbies', 'contact',
];

export default function ActiveSectionGlow() {
  const [active, setActive] = useState(null);
  const [rect, setRect] = useState(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const updateRect = () => {
      if (active) {
        const el = document.getElementById(active);
        if (el) setRect(el.getBoundingClientRect());
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry with the largest intersection ratio
        let best = null;
        entries.forEach(e => {
          if (e.isIntersecting) {
            if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
          }
        });
        if (best) {
          setActive(best.target.id);
          setRect(best.target.getBoundingClientRect());
        }
      },
      {
        threshold: [0.2, 0.4, 0.6],
        rootMargin: '-10% 0px -10% 0px',
      }
    );

    SECTION_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // Keep rect in sync while scrolling
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateRect);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateRect);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateRect);
      cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  if (!rect || !active || active === 'hero') return null;

  const INSET = 12;

  return (
    <div
      style={{
        position: 'fixed',
        top:    rect.top    + INSET,
        left:   rect.left   + INSET,
        width:  rect.width  - INSET * 2,
        height: rect.height - INSET * 2,
        pointerEvents: 'none',
        zIndex: 50,
        borderRadius: 20,
        border: '1px solid var(--accent)',
        boxShadow: `
          0 0 12px var(--accent),
          0 0 32px var(--accent),
          inset 0 0 12px rgba(0,245,255,0.04)
        `,
        transition: 'top 0.35s ease, left 0.35s ease, width 0.35s ease, height 0.35s ease, opacity 0.3s ease',
        opacity: 0.55,
      }}
    >
      {/* Corner accents */}
      {[
        { top: -1, left: -1, borderTop: '2px solid var(--accent)', borderLeft: '2px solid var(--accent)', borderRadius: '20px 0 0 0' },
        { top: -1, right: -1, borderTop: '2px solid var(--accent)', borderRight: '2px solid var(--accent)', borderRadius: '0 20px 0 0' },
        { bottom: -1, left: -1, borderBottom: '2px solid var(--accent)', borderLeft: '2px solid var(--accent)', borderRadius: '0 0 0 20px' },
        { bottom: -1, right: -1, borderBottom: '2px solid var(--accent)', borderRight: '2px solid var(--accent)', borderRadius: '0 0 20px 0' },
      ].map((s, i) => (
        <div key={i} style={{ position: 'absolute', width: 24, height: 24, ...s }} />
      ))}
    </div>
  );
}
