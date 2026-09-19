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
            <div className="grid grid-cols-1 gap-3">
              {projects.map(p => {
                const displayName = getProjectName(p);
                return (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/work/${p.id}`)}
                    className="border border-border bg-card hover:border-gold cursor-pointer transition-all duration-200 group p-4 flex items-center justify-between"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="font-mono text-lg font-bold text-gold min-w-12">#{String(p.number).padStart(2, '0')}</div>
                      <div className="flex-1">
                        <p className="font-display text-lg font-light text-foreground group-hover:text-gold transition-colors">{displayName}</p>
                        {p.poeticDescription && (
                          <p className="font-mono text-xs text-muted-foreground/70 mt-1.5 leading-relaxed italic" dir="rtl">{p.poeticDescription}</p>
                        )}
                        <p className="font-mono text-xs text-muted-foreground/40 mt-1">{formatDate(p.updatedAt)}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, p.id)}
                      className="font-mono text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1"
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