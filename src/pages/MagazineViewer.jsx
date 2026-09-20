import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { loadProjects } from '../lib/storage';
import MagazineSpread, { getDisplayName } from '../components/MagazineSpread';

const BOARD_LABELS    = { materials: 'חומרים', colors: 'צבעים', mood: 'אווירה' };
const ROOM_LABELS     = { living: 'סלון', kitchen: 'מטבח', bedroom: 'חדר שינה', bathroom: 'חדר רחצה' };
const BUILDING_LABELS = { private: 'בית פרטי', building: 'בניין' };

const THEME_KEY = 'magazine_theme';

// Build one page per image
function buildPages(project) {
  const pages = [{ type: 'cover', label: 'כריכה' }];
  let pageIndex = 0;

  const boardEntries = Object.entries(project.boards || {}).filter(([, v]) => v?.resultImage);
  boardEntries.forEach(([key, val]) => {
    pages.push({
      type: 'image',
      label: BOARD_LABELS[key] || key,
      imageUrl: val.resultImage,
      imageLabel: BOARD_LABELS[key] || key,
      imageKey: key,
      imageType: 'boards',
      pageIndex: pageIndex++,
    });
  });

  const roomEntries = Object.entries(project.rooms || {}).filter(([, v]) => v?.resultImage);
  roomEntries.forEach(([key, val]) => {
    pages.push({
      type: 'image',
      label: ROOM_LABELS[key] || key,
      imageUrl: val.resultImage,
      imageLabel: ROOM_LABELS[key] || key,
      imageKey: key,
      imageType: 'rooms',
      pageIndex: pageIndex++,
    });
  });

  const extEntries = Object.entries(project.buildingTypes || {}).filter(([, v]) => v?.resultImage);
  extEntries.forEach(([key, val]) => {
    pages.push({
      type: 'image',
      label: BUILDING_LABELS[key] || key,
      imageUrl: val.resultImage,
      imageLabel: BUILDING_LABELS[key] || key,
      imageKey: key,
      imageType: 'buildingTypes',
      pageIndex: pageIndex++,
    });
  });

  pages.push({ type: 'colophon', label: 'כולופון' });
  return pages;
}

export default function MagazineViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects]   = useState([]);
  const [projectIdx, setProjectIdx] = useState(0);
  const [pageIdx, setPageIdx]     = useState(0);
  const [loading, setLoading]     = useState(true);
  const [theme, setTheme]         = useState(() => {
    try { return localStorage.getItem(THEME_KEY) || 'dark'; } catch { return 'dark'; }
  });

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(THEME_KEY, next); } catch { /* ignore */ }
      return next;
    });
  }, []);

  useEffect(() => {
    loadProjects().then(all => {
      const withImages = all.filter(p => {
        const vals = [
          ...Object.values(p.boards || {}),
          ...Object.values(p.rooms || {}),
          ...Object.values(p.buildingTypes || {}),
        ];
        return vals.some(v => v?.resultImage);
      });
      setProjects(withImages);
      const idx = withImages.findIndex(p => p.id === id);
      setProjectIdx(idx >= 0 ? idx : 0);
      setPageIdx(0);
      setLoading(false);
    });
  }, [id]);

  const project = projects[projectIdx];
  const pages   = project ? buildPages(project) : [];

  const goNext = useCallback(() => {
    if (pageIdx < pages.length - 1) setPageIdx(p => p + 1);
    else if (projectIdx < projects.length - 1) {
      navigate(`/magazine/${projects[projectIdx + 1].id}`);
      setPageIdx(0);
    }
  }, [pageIdx, pages.length, projectIdx, projects, navigate]);

  const goPrev = useCallback(() => {
    if (pageIdx > 0) setPageIdx(p => p - 1);
    else if (projectIdx > 0) {
      navigate(`/magazine/${projects[projectIdx - 1].id}`);
      setPageIdx(0);
    }
  }, [pageIdx, projectIdx, projects, navigate]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft')  goNext();
      if (e.key === 'ArrowRight') goPrev();
      if (e.key === 'Escape')     navigate('/gallery');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, navigate]);

  if (loading) return (
    <div className="mag-root fixed inset-0 bg-[hsl(var(--mag-bg))] flex items-center justify-center" data-theme={theme}>
      <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );

  if (!project) return (
    <div className="mag-root fixed inset-0 bg-[hsl(var(--mag-bg))] flex items-center justify-center" data-theme={theme}>
      <p className="font-mono text-sm text-[hsl(var(--mag-fg)/0.4)]">פרויקט לא נמצא</p>
    </div>
  );

  const canPrev = pageIdx > 0 || projectIdx > 0;
  const canNext = pageIdx < pages.length - 1 || projectIdx < projects.length - 1;
  const currentPage = pages[pageIdx];

  return (
    <div className="mag-root fixed inset-0 bg-[hsl(var(--mag-bg))] flex flex-col overflow-hidden" dir="rtl" data-theme={theme}>

      {/* Top bar — minimal */}
      <div className="flex items-center justify-between px-8 py-3 bg-[hsl(var(--mag-scrim)/0.6)] border-b border-[hsl(var(--mag-hair)/0.06)] z-10 flex-shrink-0 backdrop-blur-sm">
        <button
          onClick={() => navigate('/gallery')}
          className="font-mono text-xs text-[hsl(var(--mag-fg)/0.35)] hover:text-[hsl(var(--mag-fg)/0.7)] transition-colors tracking-widest"
        >
          ← מקרא
        </button>
        <div className="flex items-center gap-3">
          <span className="font-display text-sm text-[hsl(var(--mag-fg)/0.5)] tracking-wider">{project ? getDisplayName(project) : ''}</span>
          <span className="font-mono text-xs text-[hsl(var(--mag-fg)/0.2)]">|</span>
          <span className="font-mono text-xs text-[hsl(var(--mag-fg)/0.2)]">{pageIdx + 1} / {pages.length}</span>
        </div>
        <div className="flex items-center gap-4 min-w-24 justify-end">
          {projects.length > 1 && (
            <span className="font-mono text-xs text-[hsl(var(--mag-fg)/0.2)]">פרויקט {projectIdx + 1} / {projects.length}</span>
          )}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'מסך בהיר' : 'מסך כהה'}
            aria-label={theme === 'dark' ? 'עבור למסך בהיר' : 'עבור למסך כהה'}
            className="w-7 h-7 rounded-full border border-[hsl(var(--mag-hair)/0.15)] hover:border-gold flex items-center justify-center text-[hsl(var(--mag-fg)/0.45)] hover:text-gold transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-hidden relative">
        <MagazineSpread spread={currentPage} project={project} />

        {/* Prev arrow */}
        {canPrev && (
          <button
            onClick={goPrev}
            className="absolute right-0 top-0 h-full w-16 flex items-center justify-center group z-10 hover:bg-[hsl(var(--mag-hair)/0.05)] transition-colors"
          >
            <div className="w-8 h-8 rounded-full border border-[hsl(var(--mag-hair)/0.1)] group-hover:border-[hsl(var(--mag-hair)/0.3)] flex items-center justify-center transition-all">
              <span className="text-[hsl(var(--mag-fg)/0.3)] group-hover:text-[hsl(var(--mag-fg)/0.8)] text-lg leading-none">›</span>
            </div>
          </button>
        )}

        {/* Next arrow */}
        {canNext && (
          <button
            onClick={goNext}
            className="absolute left-0 top-0 h-full w-16 flex items-center justify-center group z-10 hover:bg-[hsl(var(--mag-hair)/0.05)] transition-colors"
          >
            <div className="w-8 h-8 rounded-full border border-[hsl(var(--mag-hair)/0.1)] group-hover:border-[hsl(var(--mag-hair)/0.3)] flex items-center justify-center transition-all">
              <span className="text-[hsl(var(--mag-fg)/0.3)] group-hover:text-[hsl(var(--mag-fg)/0.8)] text-lg leading-none">‹</span>
            </div>
          </button>
        )}
      </div>

      {/* Bottom progress dots */}
      <div className="flex items-center justify-center gap-1.5 py-3 bg-[hsl(var(--mag-scrim)/0.4)] flex-shrink-0">
        {pages.map((_, i) => (
          <button
            key={i}
            onClick={() => setPageIdx(i)}
            className={`transition-all duration-300 rounded-full ${
              i === pageIdx
                ? 'w-6 h-1.5 bg-gold'
                : 'w-1.5 h-1.5 bg-[hsl(var(--mag-fg)/0.15)] hover:bg-[hsl(var(--mag-fg)/0.3)]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
