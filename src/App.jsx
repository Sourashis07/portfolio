import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useEffect } from 'react';
import { playClick, playHover, playWarp } from './sounds';
import Starfield from './components/Starfield';
import Snowfield from './components/Snowfield';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Education from './components/Education';
import Certifications from './components/Certifications';
import Competitions from './components/Competitions';
import Hobbies from './components/Hobbies';
import Contact from './components/Contact';
import SpaceshipCursor from './components/SpaceshipCursor';
import SnowCursor from './components/SnowCursor';
import ProjectPage from './pages/ProjectPage';
import ExperiencePage from './pages/ExperiencePage';
import CertificationPage from './pages/CertificationPage';
import CompetitionPage from './pages/CompetitionPage';
import HobbyPage from './pages/HobbyPage';
import AdminPage from './pages/AdminPage';
import PageTransition from './components/PageTransition';
import ScrollScene from './components/ScrollScene';

function SoundLayer() {
  useEffect(() => {
    const onClick = (e) => {
      // Skip if already handled by a specific component
      const tag = e.target.tagName;
      if (tag === 'BUTTON' || tag === 'A') playClick();
    };
    const onHover = (e) => {
      const tag = e.target.tagName;
      if (tag === 'BUTTON' || tag === 'A') playHover();
    };
    document.addEventListener('click', onClick);
    document.addEventListener('mouseover', onHover);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('mouseover', onHover);
    };
  }, []);
  return null;
}

function Home() {
  return (
    <>
      <Navbar />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Education />
        <Certifications />
        <Competitions />
        <Hobbies />
        <Contact />
      </main>
    </>
  );
}

function AppInner() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <BrowserRouter>
      <SoundLayer />
      {isLight ? <SnowCursor /> : <SpaceshipCursor />}
      {isLight ? <Snowfield /> : <Starfield />}
      <PageTransition>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/project/:id" element={<ProjectPage />} />
          <Route path="/experience/:id" element={<ExperiencePage />} />
          <Route path="/certification/:id" element={<CertificationPage />} />
          <Route path="/competition/:id" element={<CompetitionPage />} />
          <Route path="/hobby/:id" element={<HobbyPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </PageTransition>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
