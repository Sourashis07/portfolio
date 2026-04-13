import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getHobbies, getHobbyPosts } from '../firebase';
import Starfield from '../components/Starfield';
import SpaceshipCursor from '../components/SpaceshipCursor';

function driveImageUrl(url) {
  if (!url) return null;
  if (!url.includes('drive.google.com')) return url;
  if (url.includes('drive.google.com/thumbnail?')) return url;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  return url;
}

function youtubeEmbed(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function PostCard({ post, index }) {
  const [imgErr, setImgErr] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const imgSrc = driveImageUrl(post.imageUrl);
  const embedUrl = youtubeEmbed(post.videoUrl);
  const date = post.date ? new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 28,
      }}
    >
      {/* Post header */}
      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, #00f5ff, #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Orbitron', fontSize: '0.7rem', color: '#020408', fontWeight: 700,
        }}>
          {post.type === 'video' ? '▶' : post.type === 'blog' ? '✍' : '◈'}
        </div>
        <div>
          <div style={{ fontFamily: 'Orbitron', fontSize: '0.75rem', color: 'var(--text-primary)', letterSpacing: 1 }}>
            {post.title || 'Untitled'}
          </div>
          {date && <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>{date}</div>}
        </div>
        {post.type && (
          <span style={{
            marginLeft: 'auto', padding: '3px 10px', borderRadius: 20,
            background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)',
            fontFamily: 'Orbitron', fontSize: '0.6rem', color: 'var(--accent)', letterSpacing: 1,
          }}>
            {post.type.toUpperCase()}
          </span>
        )}
      </div>

      {/* Image */}
      {imgSrc && !imgErr && (
        <div style={{ width: '100%', maxHeight: 480, overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>
          <img
            src={imgSrc}
            alt={post.title}
            onError={() => setImgErr(true)}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            style={{ width: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}
      {imgErr && post.imageUrl && (
        <div style={{ padding: '16px 18px' }}>
          <a href={post.imageUrl} target="_blank" rel="noreferrer"
            style={{ fontFamily: 'Orbitron', fontSize: '0.68rem', color: 'var(--accent)', letterSpacing: 1, textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
          >
            VIEW IMAGE IN DRIVE →
          </a>
        </div>
      )}

      {/* Video embed */}
      {embedUrl && (
        <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000' }}>
          <iframe
            src={embedUrl}
            title={post.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      )}

      {/* Caption / blog content */}
      {post.content && (
        <div style={{ padding: '16px 18px' }}>
          <p style={{
            fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.8,
            whiteSpace: 'pre-line',
            ...((!expanded && post.content.length > 200) ? {
              display: '-webkit-box', WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            } : {}),
          }}>
            {post.content}
          </p>
          {post.content.length > 200 && (
            <button
              onClick={() => setExpanded(e => !e)}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.65rem', letterSpacing: 1, marginTop: 8, padding: 0 }}
            >
              {expanded ? 'SHOW LESS' : 'READ MORE'}
            </button>
          )}
        </div>
      )}

      {/* Tags */}
      {post.tags && (
        <div style={{ padding: '0 18px 16px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(typeof post.tags === 'string' ? post.tags.split(',') : post.tags).map(t => t.trim()).filter(Boolean).map(tag => (
            <span key={tag} style={{
              fontSize: '0.72rem', color: 'var(--accent)', fontFamily: 'Orbitron',
              opacity: 0.7, letterSpacing: 0.5,
            }}>#{tag}</span>
          ))}
        </div>
      )}

      {/* Link */}
      {post.linkUrl && (
        <div style={{ padding: '0 18px 16px' }}>
          <a href={post.linkUrl} target="_blank" rel="noreferrer"
            style={{ fontFamily: 'Orbitron', fontSize: '0.68rem', color: 'var(--accent)', letterSpacing: 1, textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
          >
            OPEN LINK →
          </a>
        </div>
      )}
    </motion.div>
  );
}

export default function HobbyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hobby, setHobby] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getHobbies(), getHobbyPosts(id)])
      .then(([hobbies, hobbyPosts]) => {
        setHobby(hobbies.find(h => h.id === id) || null);
        setPosts(hobbyPosts);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <>
      <Starfield />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Orbitron', color: '#00f5ff', letterSpacing: 3 }}>
        LOADING...
      </div>
    </>
  );

  if (!hobby) return (
    <>
      <Starfield />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <p style={{ fontFamily: 'Orbitron', color: '#ef4444', letterSpacing: 2 }}>HOBBY NOT FOUND</p>
        <button onClick={() => navigate('/')} style={backBtnStyle}>← BACK</button>
      </div>
    </>
  );

  return (
    <>
      <SpaceshipCursor />
      <Starfield />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', paddingBottom: 80 }}>

        {/* Profile-style header */}
        <div style={{
          background: 'rgba(2,4,8,0.85)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0,245,255,0.1)',
          padding: '24px 5vw 0',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <button onClick={() => navigate('/')} style={{ ...backBtnStyle, marginBottom: 16 }}>← BACK</button>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, paddingBottom: 20, maxWidth: 680, margin: '0 auto' }}>
            {/* Avatar / cover */}
            <div style={{
              width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
              background: hobby.coverUrl ? 'transparent' : 'linear-gradient(135deg,#00f5ff22,#a855f722)',
              border: '2px solid var(--accent)',
              overflow: 'hidden',
              boxShadow: '0 0 20px rgba(0,245,255,0.2)',
            }}>
              {hobby.coverUrl
                ? <img src={driveImageUrl(hobby.coverUrl)} alt={hobby.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Orbitron', fontSize: '1.4rem', color: 'var(--accent)' }}>
                    {hobby.name?.[0]?.toUpperCase()}
                  </div>
              }
            </div>

            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: 'clamp(1.2rem,3vw,1.8rem)', color: 'var(--text-primary)', marginBottom: 4 }}>
                {hobby.name}
              </h1>
              {hobby.description && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{hobby.description}</p>
              )}
              <div style={{ marginTop: 8, fontFamily: 'Orbitron', fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: 2 }}>
                {posts.length} POST{posts.length !== 1 ? 'S' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Posts feed */}
        <div style={{ maxWidth: 680, margin: '32px auto 0', padding: '0 5vw' }}>
          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', fontFamily: 'Orbitron', fontSize: '0.78rem', color: 'var(--text-faint)', letterSpacing: 2 }}>
              NO POSTS YET · ADD SOME IN ADMIN
            </div>
          ) : (
            posts.map((post, i) => <PostCard key={post.id} post={post} index={i} />)
          )}
        </div>
      </div>
    </>
  );
}

const backBtnStyle = {
  background: 'transparent',
  border: '1px solid rgba(0,245,255,0.25)',
  color: '#00f5ff',
  fontFamily: 'Orbitron',
  fontSize: '0.72rem',
  letterSpacing: 2,
  padding: '8px 18px',
  borderRadius: 4,
  cursor: 'pointer',
  display: 'inline-block',
  textDecoration: 'none',
  transition: 'all 0.2s',
};
