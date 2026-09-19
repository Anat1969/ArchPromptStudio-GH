import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadProjects, getProjectName } from '../lib/storage';
import { getSynthesis, STYLES_LIST } from '../lib/promptEngine';
import { motion } from 'framer-motion';
import MigrateLocalStorage, { hasPendingMigration } from '../components/MigrateLocalStorage';

function getDisplayName(project) {
  const { styleSynthesis } = project;
  if (!styleSynthesis?.styleA && !styleSynthesis?.styleB) return project.name || `פרויקט #${project.number}`;
  const a = STYLES_LIST.find(s => s.id === styleSynthesis?.styleA)?.label?.split(' — ')[0] || '';
  const b = STYLES_LIST.find(s => s.id === styleSynthesis?.styleB)?.label?.split(' — ')[0] || '';
  return [a, b].filter(Boolean).join(' × ') || project.name || `פרויקט #${project.number}`;
}

function getHeroImage(project) {
  const all = [
    ...Object.values(project.boards || {}),
    ...Object.values(project.rooms || {}),
    ...Object.values(project.buildingTypes || {}),
  ];
  return all.find(v => v?.resultImage)?.resultImage || null;
}

export default function Gallery() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showMigration, setShowMigration] = useState(() => hasPendingMigration());

  function fetchProjects() {
    setLoading(true);
    loadProjects().then(all => { setProjects(all); setLoading(false); });
  }

  useEffect(() => {
    if (!showMigration) fetchProjects();
  }, [showMigration]);

  const withImages = projects.filter(p => getHeroImage(p));
  const noImages   = projects.filter(p => !getHeroImage(p));

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {showMigration && (
        <MigrateLocalStorage onDone={() => setShowMigration(false)} />
      )}
      <header className="border-b border-border px-8 py-6 flex items-center gap-6 sticky top-0 bg-background z-20">
        <button onClick={() => navigate('/projects')} className="font-mono text-xs text-muted-foreground hover:text-gold transition-colors">
          ← פרויקטים
        </button>
        <div>
          <h1 className="font-display text-5xl font-light tracking-widest text-gold">MAGAZINE</h1>
          <p className="font-mono text-xs text-muted-foreground mt-0.5 tracking-wider">מקרא פרויקטים — לחץ לפתיחת הגיליון</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-14">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="font-display text-3xl font-light text-muted-foreground mb-3">אין פרויקטים עדיין</p>
            <p className="font-mono text-xs text-muted-foreground">צור פרויקטים ועלה תמונות כדי לראות את המגזין</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex items-baseline justify-between border-b-2 border-foreground pb-3 mb-10">
              <span className="font-display text-2xl font-light tracking-widest text-foreground">תוכן עניינים</span>
              <span className="font-mono text-xs text-muted-foreground">{new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long' })}</span>
            </div>

            <div className="flex flex-col divide-y divide-border">
              {withImages.map((project, idx) => {
                const synthesis = getSynthesis(project.styleSynthesis?.styleA, project.styleSynthesis?.styleB);
                const hero = getHeroImage(project);
                const name = getDisplayName(project);
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06, duration: 0.4 }}
                    onClick={() => navigate(`/magazine/${project.id}`)}
                    className="group grid grid-cols-12 gap-6 py-8 cursor-pointer hover:bg-secondary/30 transition-colors px-4 -mx-4"
                  >
                    <div className="col-span-1 flex items-start pt-1">
                      <span className="font-mono text-xs text-gold font-bold">#{String(project.number).padStart(2, '0')}</span>
                    </div>
                    <div className="col-span-7 flex flex-col gap-2">
                      <h2 className="font-display text-2xl font-light text-foreground group-hover:text-gold transition-colors leading-tight">{name}</h2>
                      {synthesis && (
                        <p className="font-mono text-xs text-muted-foreground leading-relaxed" dir="ltr">{synthesis.token}</p>
                      )}
                      {project.poeticDescription && (
                        <p className="font-mono text-xs text-muted-foreground/60 italic leading-relaxed mt-1">{project.poeticDescription}</p>
                      )}
                    </div>
                    <div className="col-span-2 flex items-center">
                      <div className="w-full border-b border-dotted border-border/60 mb-1" />
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      <div className="w-20 h-14 overflow-hidden border border-border group-hover:border-gold/50 transition-colors">
                        <img src={hero} alt={name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {noImages.length > 0 && (
              <div className="mt-12 border-t border-border/40 pt-8">
                <p className="font-mono text-xs text-muted-foreground/50 uppercase tracking-widest mb-4">פרויקטים ללא תמונות</p>
                <div className="flex flex-col gap-2">
                  {noImages.map(p => (
                    <div key={p.id} className="flex items-baseline gap-4 py-2 opacity-40">
                      <span className="font-mono text-xs text-gold">#{String(p.number).padStart(2, '0')}</span>
                      <span className="font-display text-base font-light text-foreground">{getDisplayName(p)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-border px-8 py-4 text-center mt-10">
        <p className="font-mono text-xs text-muted-foreground/50 tracking-widest">PROMPT STUDIO — ARCHITECTURAL MAGAZINE</p>
      </footer>
    </div>
  );
}