import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getHero, saveHero,
  getProfile, saveProfile,
  getProjects, saveProject, deleteProject,
  getExperiences, saveExperience, deleteExperience,
  getSkills, saveSkill, deleteSkill,
  getEducation, saveEducation, deleteEducation,
  getMessages, markMessageRead, deleteMessage,
} from '../firebase';
import Starfield from '../components/Starfield';
import SpaceshipCursor from '../components/SpaceshipCursor';

const TABS = ['HERO', 'PROFILE', 'PROJECTS', 'EXPERIENCE', 'SKILLS', 'EDUCATION', 'MESSAGES'];

const inputStyle = (focused) => ({
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: `1px solid ${focused ? '#a855f7' : 'rgba(255,255,255,0.1)'}`,
  borderRadius: 6, padding: '10px 14px',
  color: '#e2e8f0', fontSize: '0.9rem', fontFamily: 'Inter',
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
});

const labelStyle = {
  display: 'block', fontSize: '0.72rem', color: '#64748b',
  fontFamily: 'Orbitron', letterSpacing: 1, marginBottom: 6,
};

function Field({ label, value, onChange, as = 'input', rows = 3, type = 'text', placeholder = '' }) {
  const [focused, setFocused] = useState(false);
  const Tag = as;
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={labelStyle}>{label}</label>
      <Tag
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={rows}
        placeholder={placeholder}
        style={{ ...inputStyle(focused), resize: as === 'textarea' ? 'vertical' : undefined }}
      />
    </div>
  );
}

function SaveBtn({ onClick, saved }) {
  return (
    <button onClick={onClick} style={{
      padding: '11px 28px', borderRadius: 6, border: 'none', cursor: 'pointer',
      background: saved ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#a855f7,#7c3aed)',
      color: '#fff', fontFamily: 'Orbitron', fontSize: '0.78rem', letterSpacing: 1,
      boxShadow: saved ? '0 0 20px rgba(16,185,129,0.3)' : '0 0 20px rgba(168,85,247,0.3)',
      transition: 'all 0.3s',
    }}>
      {saved ? 'SAVED' : 'SAVE CHANGES'}
    </button>
  );
}

// ── HERO TAB ──────────────────────────────────────────────
function HeroTab() {
  const [data, setData] = useState({ name: '', designation: '', tagline: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => { getHero().then(d => setData(d || {})); }, []);

  const set = (k) => (v) => setData(p => ({ ...p, [k]: v }));

  const save = async () => {
    await saveHero(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <Field label="FULL NAME (new line = line break)" value={data.name} onChange={set('name')} placeholder="Sourav&#10;Sharma" as="textarea" rows={2} />
      <Field label="DESIGNATION" value={data.designation} onChange={set('designation')} placeholder="FULL-STACK DEVELOPER" />
      <Field label="TAGLINE" value={data.tagline} onChange={set('tagline')} as="textarea" rows={3} placeholder="Crafting immersive digital experiences..." />
      <SaveBtn onClick={save} saved={saved} />
    </div>
  );
}

// ── PROFILE TAB ───────────────────────────────────────────
function ProfileTab() {
  const [data, setData] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => { getProfile().then(d => setData(d || {})); }, []);

  const set = (k) => (v) => setData(p => ({ ...p, [k]: v }));

  const save = async () => {
    await saveProfile(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '0 24px' }}>
        <Field label="FULL NAME" value={data.fullName} onChange={set('fullName')} />
        <Field label="DATE OF BIRTH" value={data.dob} onChange={set('dob')} type="date" />
        <Field label="EMAIL" value={data.email} onChange={set('email')} type="email" />
        <Field label="PHONE" value={data.phone} onChange={set('phone')} />
        <Field label="ADDRESS" value={data.address} onChange={set('address')} />
        <Field label="CITY" value={data.city} onChange={set('city')} />
        <Field label="COUNTRY" value={data.country} onChange={set('country')} />
        <Field label="GITHUB URL" value={data.githubUrl} onChange={set('githubUrl')} />
        <Field label="LINKEDIN URL" value={data.linkedinUrl} onChange={set('linkedinUrl')} />
        <Field label="TWITTER URL" value={data.twitterUrl} onChange={set('twitterUrl')} />
        <Field label="AVATAR IMAGE URL" value={data.avatarUrl} onChange={set('avatarUrl')} />
        <Field label="YEARS EXPERIENCE" value={data.yearsExp} onChange={set('yearsExp')} placeholder="3+" />
        <Field label="PROJECTS BUILT" value={data.projectsBuilt} onChange={set('projectsBuilt')} placeholder="20+" />
        <Field label="TECHNOLOGIES" value={data.technologies} onChange={set('technologies')} placeholder="10+" />
      </div>
      <Field label="BIO (paragraph 1)" value={data.bio1} onChange={set('bio1')} as="textarea" rows={3} />
      <Field label="BIO (paragraph 2)" value={data.bio2} onChange={set('bio2')} as="textarea" rows={3} />
      <SaveBtn onClick={save} saved={saved} />
    </div>
  );
}

// ── PROJECTS TAB ──────────────────────────────────────────
const EMPTY_PROJECT = {
  title: '', description: '', overview: '', tags: '',
  color: '#00f5ff', githubUrl: '', liveUrl: '', videoUrl: '',
  architecture: '', documentation: '', challenges: '',
  status: '', year: '', role: '', teamSize: '',
  techStack: '',
};

function ProjectForm({ initial, onSave, onCancel }) {
  const [data, setData] = useState(initial || EMPTY_PROJECT);
  const set = (k) => (v) => setData(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    const payload = {
      ...data,
      tags: typeof data.tags === 'string' ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : data.tags,
      techStack: typeof data.techStack === 'string'
        ? data.techStack.split('\n').map(l => { const [name, ...rest] = l.split(':'); return { name: name?.trim(), purpose: rest.join(':').trim() }; }).filter(t => t.name)
        : data.techStack,
    };
    onSave(payload);
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 12, padding: 28, marginBottom: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '0 24px' }}>
        <Field label="TITLE" value={data.title} onChange={set('title')} />
        <Field label="ACCENT COLOR (hex)" value={data.color} onChange={set('color')} placeholder="#00f5ff" />
        <Field label="GITHUB URL" value={data.githubUrl} onChange={set('githubUrl')} />
        <Field label="LIVE URL" value={data.liveUrl} onChange={set('liveUrl')} />
        <Field label="YOUTUBE VIDEO URL" value={data.videoUrl} onChange={set('videoUrl')} />
        <Field label="STATUS" value={data.status} onChange={set('status')} placeholder="Live / In Development" />
        <Field label="YEAR" value={data.year} onChange={set('year')} />
        <Field label="YOUR ROLE" value={data.role} onChange={set('role')} />
        <Field label="TEAM SIZE" value={data.teamSize} onChange={set('teamSize')} />
      </div>
      <Field label="SHORT DESCRIPTION" value={data.description} onChange={set('description')} as="textarea" rows={2} />
      <Field label="OVERVIEW" value={data.overview} onChange={set('overview')} as="textarea" rows={3} />
      <Field label="TAGS (comma separated)" value={typeof data.tags === 'string' ? data.tags : (data.tags || []).join(', ')} onChange={set('tags')} placeholder="React, Node.js, MongoDB" />
      <Field label="TECH STACK (one per line: Name: Purpose)" value={typeof data.techStack === 'string' ? data.techStack : (data.techStack || []).map(t => `${t.name}: ${t.purpose}`).join('\n')} onChange={set('techStack')} as="textarea" rows={4} placeholder="React: Frontend UI&#10;Node.js: Backend API" />
      <Field label="ARCHITECTURE" value={data.architecture} onChange={set('architecture')} as="textarea" rows={3} />
      <Field label="DOCUMENTATION" value={data.documentation} onChange={set('documentation')} as="textarea" rows={4} />
      <Field label="CHALLENGES & SOLUTIONS" value={data.challenges} onChange={set('challenges')} as="textarea" rows={3} />

      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button onClick={handleSave} style={{ padding: '10px 24px', borderRadius: 6, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#fff', fontFamily: 'Orbitron', fontSize: '0.75rem', letterSpacing: 1 }}>
          SAVE PROJECT
        </button>
        <button onClick={onCancel} style={{ padding: '10px 24px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: 'transparent', color: '#64748b', fontFamily: 'Orbitron', fontSize: '0.75rem', letterSpacing: 1 }}>
          CANCEL
        </button>
      </div>
    </div>
  );
}

function ProjectsTab() {
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(null); // null | 'new' | project object
  const [msg, setMsg] = useState('');

  const load = () => getProjects().then(setProjects);
  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    await saveProject(editing?.id || null, data);
    setMsg('Project saved!');
    setEditing(null);
    load();
    setTimeout(() => setMsg(''), 2000);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    await deleteProject(id);
    load();
  };

  return (
    <div>
      {msg && <p style={{ color: '#10b981', fontFamily: 'Orbitron', fontSize: '0.75rem', marginBottom: 16 }}>{msg}</p>}

      {editing && (
        <ProjectForm
          initial={editing === 'new' ? EMPTY_PROJECT : editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      {!editing && (
        <button onClick={() => setEditing('new')} style={{ padding: '10px 24px', borderRadius: 6, border: '1px solid rgba(0,245,255,0.3)', cursor: 'pointer', background: 'transparent', color: '#00f5ff', fontFamily: 'Orbitron', fontSize: '0.75rem', letterSpacing: 1, marginBottom: 24 }}>
          + ADD PROJECT
        </button>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {projects.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', border: `1px solid ${p.color || '#00f5ff'}22`, borderRadius: 10, padding: '14px 20px' }}>
            <div>
              <span style={{ fontFamily: 'Orbitron', fontSize: '0.9rem', color: p.color || '#00f5ff' }}>{p.title}</span>
              <span style={{ marginLeft: 12, fontSize: '0.78rem', color: '#475569' }}>{p.status} · {p.year}</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setEditing(p)} style={{ padding: '6px 14px', borderRadius: 4, border: '1px solid rgba(0,245,255,0.3)', background: 'transparent', color: '#00f5ff', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.7rem' }}>EDIT</button>
              <button onClick={() => handleDelete(p.id)} style={{ padding: '6px 14px', borderRadius: 4, border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.7rem' }}>DELETE</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── EXPERIENCE TAB ────────────────────────────────────────
const EMPTY_EXP = { company: '', role: '', startDate: '', endDate: '', current: false, description: '', techUsed: '', location: '', type: '', highlights: '' };

function ExperienceForm({ initial, onSave, onCancel }) {
  const [data, setData] = useState(initial || EMPTY_EXP);
  const set = (k) => (v) => setData(p => ({ ...p, [k]: v }));

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,245,255,0.15)', borderRadius: 12, padding: 28, marginBottom: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '0 24px' }}>
        <Field label="COMPANY" value={data.company} onChange={set('company')} />
        <Field label="ROLE / TITLE" value={data.role} onChange={set('role')} />
        <Field label="START DATE" value={data.startDate} onChange={set('startDate')} type="date" />
        <Field label="END DATE" value={data.endDate} onChange={set('endDate')} type="date" placeholder="Leave blank if current" />
        <Field label="LOCATION" value={data.location} onChange={set('location')} placeholder="Remote / Bangalore, India" />
        <Field label="TYPE" value={data.type} onChange={set('type')} placeholder="Full-time / Internship / Contract" />
      </div>
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
        <input type="checkbox" id="current" checked={!!data.current} onChange={e => set('current')(e.target.checked)} style={{ accentColor: '#00f5ff' }} />
        <label htmlFor="current" style={{ ...labelStyle, marginBottom: 0, color: '#94a3b8' }}>CURRENTLY WORKING HERE</label>
      </div>
      <Field label="DESCRIPTION" value={data.description} onChange={set('description')} as="textarea" rows={3} />
      <Field label="KEY HIGHLIGHTS (one per line)" value={data.highlights} onChange={set('highlights')} as="textarea" rows={4} placeholder="Led migration to microservices, reducing latency by 40%&#10;Built CI/CD pipeline with GitHub Actions" />
      <Field label="TECHNOLOGIES USED (comma separated)" value={data.techUsed} onChange={set('techUsed')} placeholder="React, Node.js, AWS" />
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => onSave(data)} style={{ padding: '10px 24px', borderRadius: 6, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#00f5ff,#3b82f6)', color: '#020408', fontFamily: 'Orbitron', fontSize: '0.75rem', letterSpacing: 1, fontWeight: 700 }}>
          SAVE
        </button>
        <button onClick={onCancel} style={{ padding: '10px 24px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: 'transparent', color: '#64748b', fontFamily: 'Orbitron', fontSize: '0.75rem' }}>
          CANCEL
        </button>
      </div>
    </div>
  );
}

function ExperienceTab() {
  const [experiences, setExperiences] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = () => getExperiences().then(setExperiences);
  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    await saveExperience(editing?.id || null, data);
    setEditing(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this experience?')) return;
    await deleteExperience(id);
    load();
  };

  return (
    <div>
      {editing && (
        <ExperienceForm
          initial={editing === 'new' ? EMPTY_EXP : editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      {!editing && (
        <button onClick={() => setEditing('new')} style={{ padding: '10px 24px', borderRadius: 6, border: '1px solid rgba(0,245,255,0.3)', cursor: 'pointer', background: 'transparent', color: '#00f5ff', fontFamily: 'Orbitron', fontSize: '0.75rem', letterSpacing: 1, marginBottom: 24 }}>
          + ADD EXPERIENCE
        </button>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {experiences.map(exp => (
          <div key={exp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,245,255,0.1)', borderRadius: 10, padding: '14px 20px' }}>
            <div>
              <span style={{ fontFamily: 'Orbitron', fontSize: '0.9rem', color: '#00f5ff' }}>{exp.role}</span>
              <span style={{ marginLeft: 10, fontSize: '0.82rem', color: '#64748b' }}>@ {exp.company}</span>
              <span style={{ marginLeft: 10, fontSize: '0.75rem', color: '#475569' }}>{exp.startDate} — {exp.current ? 'Present' : exp.endDate}</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setEditing(exp)} style={{ padding: '6px 14px', borderRadius: 4, border: '1px solid rgba(0,245,255,0.3)', background: 'transparent', color: '#00f5ff', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.7rem' }}>EDIT</button>
              <button onClick={() => handleDelete(exp.id)} style={{ padding: '6px 14px', borderRadius: 4, border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.7rem' }}>DELETE</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SKILLS TAB ───────────────────────────────────────────
const SKILL_COLORS = ['#00f5ff','#a855f7','#3b82f6','#f59e0b','#10b981','#ec4899','#f97316','#8b5cf6'];

function SkillsTab() {
  const [skills, setSkills] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', level: 80, color: '#00f5ff', projects: '', certifications: '' });

  const load = () => getSkills().then(setSkills);
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setForm({ name: '', level: 80, color: SKILL_COLORS[skills.length % SKILL_COLORS.length], projects: '', certifications: '' });
    setEditing('new');
  };

  const openEdit = (s) => {
    setForm({
      name: s.name, level: s.level, color: s.color,
      projects: (s.projects || []).join('\n'),
      certifications: (s.certifications || []).map(c => typeof c === 'string' ? c : `${c.name}|${c.url}`).join('\n'),
    });
    setEditing(s);
  };

  const handleSave = async () => {
    const payload = {
      name: form.name,
      level: Number(form.level),
      color: form.color,
      projects: form.projects ? form.projects.split('\n').map(s => s.trim()).filter(Boolean) : [],
      certifications: form.certifications
        ? form.certifications.split('\n').map(s => { const [name, url] = s.split('|'); return { name: name?.trim(), url: url?.trim() || '' }; }).filter(c => c.name)
        : [],
    };
    await saveSkill(editing === 'new' ? null : editing.id, payload);
    setEditing(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this skill?')) return;
    await deleteSkill(id);
    load();
  };

  return (
    <div>
      {editing && (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,245,255,0.15)', borderRadius: 12, padding: 28, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '0 24px' }}>
            <Field label="SKILL NAME" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="React" />
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>PROFICIENCY LEVEL: <span style={{ color: '#00f5ff' }}>{form.level}%</span></label>
              <input
                type="range" min={1} max={100} value={form.level}
                onChange={e => setForm(p => ({ ...p, level: e.target.value }))}
                style={{ width: '100%', accentColor: form.color, marginTop: 8 }}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>PLANET COLOR</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                {SKILL_COLORS.map(c => (
                  <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))}
                    style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.color === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', boxShadow: form.color === c ? `0 0 10px ${c}` : 'none', transition: 'all 0.2s' }}
                  />
                ))}
                <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                  style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'none', padding: 0 }}
                />
              </div>
            </div>
          </div>
          <Field label="RELATED PROJECTS (one per line)" value={form.projects} onChange={v => setForm(p => ({ ...p, projects: v }))} as="textarea" rows={3} placeholder="NebulAI&#10;OrbitChat" />
          <Field label="CERTIFICATIONS (one per line: Name|URL)" value={form.certifications} onChange={v => setForm(p => ({ ...p, certifications: v }))} as="textarea" rows={3} placeholder="AWS Certified|https://aws.amazon.com&#10;React Cert|https://..." />
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleSave} style={{ padding: '10px 24px', borderRadius: 6, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#00f5ff,#3b82f6)', color: '#020408', fontFamily: 'Orbitron', fontSize: '0.75rem', letterSpacing: 1, fontWeight: 700 }}>SAVE</button>
            <button onClick={() => setEditing(null)} style={{ padding: '10px 24px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: 'transparent', color: '#64748b', fontFamily: 'Orbitron', fontSize: '0.75rem' }}>CANCEL</button>
          </div>
        </div>
      )}

      {!editing && (
        <button onClick={openNew} style={{ padding: '10px 24px', borderRadius: 6, border: '1px solid rgba(0,245,255,0.3)', cursor: 'pointer', background: 'transparent', color: '#00f5ff', fontFamily: 'Orbitron', fontSize: '0.75rem', letterSpacing: 1, marginBottom: 24 }}>
          + ADD SKILL
        </button>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
        {skills.map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', border: `1px solid ${s.color}33`, borderRadius: 10, padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
              <div>
                <div style={{ fontFamily: 'Orbitron', fontSize: '0.82rem', color: s.color }}>{s.name}</div>
                <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 2 }}>{s.level}% · {(s.projects||[]).length} projects · {(s.certifications||[]).length} certs</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => openEdit(s)} style={{ padding: '5px 12px', borderRadius: 4, border: `1px solid ${s.color}44`, background: 'transparent', color: s.color, cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.65rem' }}>EDIT</button>
              <button onClick={() => handleDelete(s.id)} style={{ padding: '5px 12px', borderRadius: 4, border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.65rem' }}>DEL</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── EDUCATION TAB ────────────────────────────────────────
const EMPTY_EDU = { degree: '', institution: '', startYear: '', endYear: '', grade: '', description: '' };

function EducationTab() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_EDU);

  const load = () => getEducation().then(setItems);
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(EMPTY_EDU); setEditing('new'); };
  const openEdit = (item) => { setForm(item); setEditing(item); };

  const handleSave = async () => {
    await saveEducation(editing === 'new' ? null : editing.id, form);
    setEditing(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    await deleteEducation(id);
    load();
  };

  const set = (k) => (v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      {editing && (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,245,255,0.15)', borderRadius: 12, padding: 28, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '0 24px' }}>
            <Field label="DEGREE / QUALIFICATION" value={form.degree} onChange={set('degree')} />
            <Field label="INSTITUTION" value={form.institution} onChange={set('institution')} />
            <Field label="START YEAR" value={form.startYear} onChange={set('startYear')} placeholder="2019" />
            <Field label="END YEAR" value={form.endYear} onChange={set('endYear')} placeholder="2023 (blank = Present)" />
            <Field label="GRADE / CGPA" value={form.grade} onChange={set('grade')} placeholder="8.9 CGPA" />
          </div>
          <Field label="DESCRIPTION" value={form.description} onChange={set('description')} as="textarea" rows={3} />
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleSave} style={{ padding: '10px 24px', borderRadius: 6, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#00f5ff,#3b82f6)', color: '#020408', fontFamily: 'Orbitron', fontSize: '0.75rem', letterSpacing: 1, fontWeight: 700 }}>SAVE</button>
            <button onClick={() => setEditing(null)} style={{ padding: '10px 24px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: 'transparent', color: '#64748b', fontFamily: 'Orbitron', fontSize: '0.75rem' }}>CANCEL</button>
          </div>
        </div>
      )}

      {!editing && (
        <button onClick={openNew} style={{ padding: '10px 24px', borderRadius: 6, border: '1px solid rgba(0,245,255,0.3)', cursor: 'pointer', background: 'transparent', color: '#00f5ff', fontFamily: 'Orbitron', fontSize: '0.75rem', letterSpacing: 1, marginBottom: 24 }}>
          + ADD EDUCATION
        </button>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,245,255,0.1)', borderRadius: 10, padding: '14px 20px' }}>
            <div>
              <span style={{ fontFamily: 'Orbitron', fontSize: '0.88rem', color: '#00f5ff' }}>{item.degree}</span>
              <span style={{ marginLeft: 10, fontSize: '0.78rem', color: '#64748b' }}>@ {item.institution}</span>
              <span style={{ marginLeft: 10, fontSize: '0.72rem', color: '#475569' }}>{item.startYear} — {item.endYear || 'Present'}</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => openEdit(item)} style={{ padding: '6px 14px', borderRadius: 4, border: '1px solid rgba(0,245,255,0.3)', background: 'transparent', color: '#00f5ff', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.7rem' }}>EDIT</button>
              <button onClick={() => handleDelete(item.id)} style={{ padding: '6px 14px', borderRadius: 4, border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.7rem' }}>DELETE</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MESSAGES TAB ─────────────────────────────────────────
function MessagesTab() {
  const [messages, setMessages] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const load = () => getMessages().then(setMessages);
  useEffect(() => { load(); }, []);

  const handleExpand = async (msg) => {
    if (expanded?.id === msg.id) { setExpanded(null); return; }
    setExpanded(msg);
    if (!msg.read) {
      await markMessageRead(msg.id);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return;
    await deleteMessage(id);
    if (expanded?.id === id) setExpanded(null);
    load();
  };

  const handleReply = (msg) => {
    const subject = encodeURIComponent(`Re: Message from ${msg.name}`);
    const body = encodeURIComponent(`\n\n---\nOriginal message from ${msg.name}:\n${msg.message}`);
    window.open(`mailto:${msg.email}?subject=${subject}&body=${body}`);
  };

  const unread = messages.filter(m => !m.read).length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span style={{ fontFamily: 'Orbitron', fontSize: '0.78rem', color: '#64748b', letterSpacing: 1 }}>
          {messages.length} TOTAL
        </span>
        {unread > 0 && (
          <span style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)', fontFamily: 'Orbitron', fontSize: '0.68rem', color: '#00f5ff', letterSpacing: 1 }}>
            {unread} UNREAD
          </span>
        )}
      </div>

      {messages.length === 0 && (
        <p style={{ color: '#334155', fontFamily: 'Orbitron', fontSize: '0.78rem', letterSpacing: 1 }}>NO MESSAGES YET</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${msg.read ? 'rgba(255,255,255,0.06)' : 'rgba(0,245,255,0.25)'}`, borderRadius: 10, overflow: 'hidden' }}>
            {/* Header row */}
            <div
              onClick={() => handleExpand(msg)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {!msg.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00f5ff', boxShadow: '0 0 6px #00f5ff', flexShrink: 0, display: 'inline-block' }} />}
                <div>
                  <span style={{ fontFamily: 'Orbitron', fontSize: '0.85rem', color: msg.read ? '#94a3b8' : '#e2e8f0', fontWeight: msg.read ? 400 : 700 }}>{msg.name}</span>
                  <span style={{ marginLeft: 10, fontSize: '0.75rem', color: '#475569' }}>{msg.email}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '0.68rem', color: '#334155', fontFamily: 'Orbitron' }}>
                  {msg.sentAt ? new Date(msg.sentAt).toLocaleDateString() : ''}
                </span>
                <span style={{ color: '#475569', fontSize: '0.8rem' }}>{expanded?.id === msg.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {/* Expanded body */}
            {expanded?.id === msg.id && (
              <div style={{ padding: '0 20px 18px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '0.9rem', margin: '14px 0 16px', whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => handleReply(msg)}
                    style={{ padding: '8px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#00f5ff,#3b82f6)', color: '#020408', fontFamily: 'Orbitron', fontSize: '0.72rem', letterSpacing: 1, fontWeight: 700 }}
                  >
                    REPLY VIA EMAIL
                  </button>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    style={{ padding: '8px 20px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', background: 'transparent', color: '#ef4444', fontFamily: 'Orbitron', fontSize: '0.72rem', letterSpacing: 1 }}
                  >
                    DELETE
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN ADMIN PAGE ───────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState('HERO');
  const navigate = useNavigate();

  return (
    <>
      <SpaceshipCursor />
      <Starfield />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', padding: '32px 5vw 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <p style={{ fontFamily: 'Orbitron', fontSize: '0.72rem', color: '#a855f7', letterSpacing: 3, marginBottom: 6 }}>ADMIN PANEL</p>
            <h1 style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: 'clamp(1.4rem,3vw,2rem)', background: 'linear-gradient(135deg,#a855f7,#00f5ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              PORTFOLIO MANAGER
            </h1>
          </div>
          <button onClick={() => navigate('/')} style={{ padding: '10px 20px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.72rem', letterSpacing: 1 }}>
            EXIT ADMIN
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 36, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 0 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 20px', background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: 'Orbitron', fontSize: '0.75rem', letterSpacing: 1,
              color: tab === t ? '#a855f7' : '#475569',
              borderBottom: tab === t ? '2px solid #a855f7' : '2px solid transparent',
              transition: 'all 0.2s',
            }}>{t}</button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            style={{ maxWidth: 860 }}
          >
            {tab === 'HERO'       && <HeroTab />}
            {tab === 'PROFILE'    && <ProfileTab />}
            {tab === 'PROJECTS'   && <ProjectsTab />}
            {tab === 'EXPERIENCE' && <ExperienceTab />}
            {tab === 'SKILLS'     && <SkillsTab />}
            {tab === 'EDUCATION'  && <EducationTab />}
            {tab === 'MESSAGES'   && <MessagesTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
