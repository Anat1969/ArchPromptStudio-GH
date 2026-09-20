import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadProjects, createProject, saveProject, deleteProject, getProjectName } from '../lib/storage';
import MigrateLocalStorage, { hasPendingMigration } from '../components/MigrateLocalStorage';

export default function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMigration, setShowMigration] = useState(() => hasPendingMigration());

  function fetchProjects() {
    setLoading(true);
    loadProjects().then(p => { setProjects(p); setLoading(false); });
  }

  useEffect(() => {
    if (!showMigration) fetchProjects();
  }, [showMigration]);

  async function handleNew() {
    const p = createProject();
    const saved = await saveProject(p);
    navigate(`/work/${saved.id}`);
  }

  async function handleDelete(e, id) {
    e.stopPropagation();
    await deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showMigration && (
        <MigrateLocalStorage onDone={() => { setShowMigration(false); }} />
      )}
      {/* Header */}
      <header className="border-b border-border px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-5xl font-light tracking-widest text-gold">PROMPT STUDIO</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1 tracking-wider">ARCHITECTURAL MIDJOURNEY GENERATOR</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="border border-border text-muted-foreground font-mono text-xs tracking-widest px-6 py-3 hover:border-gold hover:text-gold transition-all duration-200"
          >
            ← מדריך
          </button>
          <button
            onClick={() => navigate('/gallery')}
            className="border border-border text-muted-foreground font-mono text-xs tracking-widest px-6 py-3 hover:border-gold hover:text-gold transition-all duration-200"
          >
            מגזין
          </button>
          <button
            onClick={handleNew}
            className="border border-gold text-gold font-mono text-xs tracking-widest px-6 py-3 hover:bg-gold hover:text-white transition-all duration-200"
          >
            + פרויקט חדש
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-8 py-10">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="font-display text-3xl font-light text-muted-foreground mb-4">אין פרויקטים עדיין</p>
            <p className="font-mono text-xs text-muted-foreground">לחץ על "פרויקט חדש" כדי להתחיל</p>
          </div>
        ) : (
          <>
            <h2 className="font-display text-2xl font-light text-muted-foreground mb-6 tracking-wide">פרויקטים</h2>
            <div className="grid grid-cols-1 gap-4">
              {projects.map(p => {
                const displayName = getProjectName(p) || `פרויקט #${p.number}`;
                const resultThumbs = (obj) => Object.values(obj || {}).filter(v => v?.resultImage).map(v => v.resultImage);
                const roomThumbs = resultThumbs(p.rooms);
                const thumbs = (roomThumbs.length ? roomThumbs : [...resultThumbs(p.boards), ...resultThumbs(p.buildingTypes)]).slice(0, 4);
                return (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/work/${p.id}`)}
                    className="relative overflow-hidden rounded-sm border border-border hover:border-gold cursor-pointer transition-colors duration-200 group h-56"
                  >
                    {/* Background — inspiration image, undistorted (object-cover), left brighter */}
                    {p.inspirationImage ? (
                      <img src={p.inspirationImage} alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0e0e0e]" />
                    )}
                    {/* Gradient — lighter now: readable at top & bottom, image clear in the middle */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/55" />

                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-between p-5">
                      {/* Text (top) */}
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="font-mono text-lg font-bold text-gold min-w-12 [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]">#{String(p.number).padStart(2, '0')}</div>
                        <div className="min-w-0">
                          <p className="font-display text-2xl font-light text-white group-hover:text-gold transition-colors truncate [text-shadow:0_2px_10px_rgba(0,0,0,0.85)]">{displayName}</p>
                          {p.poeticDescription && (
                            <p className="font-mono text-xs text-white/80 mt-1.5 leading-relaxed italic line-clamp-2 max-w-xl [text-shadow:0_2px_8px_rgba(0,0,0,0.85)]" dir="rtl">{p.poeticDescription}</p>
                          )}
                          <p className="font-mono text-xs text-white/55 mt-1.5 [text-shadow:0_2px_8px_rgba(0,0,0,0.85)]">{formatDate(p.updatedAt)}</p>
                        </div>
                      </div>

                      {/* Room thumbnails — a strip across the width of the frame */}
                      {thumbs.length > 0 && (
                        <div className="flex justify-between gap-2">
                          {thumbs.map((url, i) => (
                            <div key={i} className="flex-1 max-w-[7.5rem] aspect-square rounded-sm overflow-hidden border border-white/40 shadow-lg">
                              <img src={url} alt="" className="w-full h-full object-cover object-center" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Delete */}
                    <button
                      onClick={(e) => handleDelete(e, p.id)}
                      className="absolute top-2 left-2 z-10 font-mono text-sm text-white/60 hover:text-destructive bg-black/40 hover:bg-black/60 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                      title="מחק פרויקט"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-border px-8 py-4 text-center">
        <p className="font-mono text-xs text-muted-foreground tracking-widest">PROMPT STUDIO — OBSIDIAN EDITION</p>
      </footer>
    </div>
  );
}