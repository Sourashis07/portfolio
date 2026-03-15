import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Starfield from './components/Starfield';
import Snowfield from './components/Snowfield';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Skills from './components/Skills';
import Education from './components/Education';
import Contact from './components/Contact';
import SpaceshipCursor from './components/SpaceshipCursor';
import SnowCursor from './components/SnowCursor';
import ProjectPage from './pages/ProjectPage';
import ExperiencePage from './pages/ExperiencePage';
import AdminPage from './pages/AdminPage';
import PageTransition from './components/PageTransition';

function Home() {
  return (
    <>
      <Navbar />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Education />
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
      {isLight ? <SnowCursor /> : <SpaceshipCursor />}
      {isLight ? <Snowfield /> : <Starfield />}
      <PageTransition>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/project/:id" element={<ProjectPage />} />
          <Route path="/experience/:id" element={<ExperiencePage />} />
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
