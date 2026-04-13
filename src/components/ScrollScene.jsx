import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Wraps each direct-child section in a div with overflow:hidden
// so clip-path and transforms work cleanly without fighting Framer Motion
export default function ScrollScene({ children }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        const wrappers = gsap.utils.toArray('.scroll-section-wrap', containerRef.current);

        wrappers.forEach((wrap, i) => {
          const section = wrap.querySelector('section');
          if (!section) return;
          const id = section.id;

          // ── ENTRANCE: section slides/clips into view ───────────────
          const entrances = {
            hero:           null,
            about:          null, // About owns its own GSAP scrub
            experience:     { y: [80, 0], opacity: [0, 1] },
            projects:       { clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'] },
            skills:         { clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'] },
            education:      { x: [-100, 0], opacity: [0, 1] },
            certifications: { clipPath: ['inset(0 0 0 100%)', 'inset(0 0 0 0%)'] },
            competitions:   { clipPath: ['inset(50% 0 50% 0)', 'inset(0% 0 0% 0)'] },
            hobbies:        { y: [60, 0], opacity: [0, 1], scale: [0.92, 1] },
            contact:        { clipPath: ['inset(0 50% 0 50%)', 'inset(0 0% 0 0%)'] },
          };

          const effect = entrances[id];
          if (!effect) return;

          const fromVars = {};
          const toVars = {
            scrollTrigger: {
              trigger: wrap,
              start: 'top 85%',
              end: 'top 15%',
              scrub: 1.2,
            },
          };

          Object.entries(effect).forEach(([prop, [from, to]]) => {
            fromVars[prop] = from;
            toVars[prop] = to;
          });

          gsap.fromTo(wrap, fromVars, toVars);

          // ── EXIT: section breaks apart as next section arrives ─────
          // Only apply to sections that aren't last
          if (i < wrappers.length - 1) {
            const exits = {
              hero:           { x: '-100%', rotation: -3, opacity: 0 },
              about:          { scale: 0.85, opacity: 0, filter: 'blur(8px)' },
              experience:     { y: -60, opacity: 0, scale: 0.95 },
              projects:       { rotationX: 15, opacity: 0, transformOrigin: 'center bottom' },
              skills:         { x: '100%', rotation: 3, opacity: 0 },
              education:      { scale: 0.88, opacity: 0, y: -40 },
              certifications: { x: '-100%', opacity: 0 },
              competitions:   { y: -80, opacity: 0, scale: 0.9 },
              hobbies:        { scale: 0.8, opacity: 0, filter: 'blur(6px)' },
            };

            const exitVars = exits[id];
            if (exitVars) {
              gsap.to(wrap, {
                ...exitVars,
                scrollTrigger: {
                  trigger: wrap,
                  start: 'bottom 60%',
                  end: 'bottom 10%',
                  scrub: 1.5,
                },
              });
            }
          }
        });

        // ── Section title parallax depth ───────────────────────────
        gsap.utils.toArray('.section-title', containerRef.current).forEach((title) => {
          gsap.to(title, {
            y: -40,
            ease: 'none',
            scrollTrigger: {
              trigger: title.closest('section'),
              start: 'top bottom',
              end: 'bottom top',
              scrub: 2,
            },
          });
        });

        // ── Alternating card depth parallax ────────────────────────
        gsap.utils.toArray('.grid-3', containerRef.current).forEach((grid) => {
          Array.from(grid.children).forEach((card, i) => {
            gsap.to(card, {
              y: i % 2 === 0 ? -24 : 24,
              ease: 'none',
              scrollTrigger: {
                trigger: grid,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 2.5,
              },
            });
          });
        });

      }, containerRef);

      return () => ctx.revert();
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={containerRef}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div key={i} className="scroll-section-wrap" style={{ overflowX: 'clip', willChange: 'transform, opacity' }}>
              {child}
            </div>
          ))
        : <div className="scroll-section-wrap" style={{ overflowX: 'clip', willChange: 'transform, opacity' }}>{children}</div>
      }
    </div>
  );
}
