import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadProjects, saveProject, getProjectName } from '../lib/storage';
import { STYLES_LIST, generatePrompt, getSynthesis } from '../lib/promptEngine';
import InspirationUpload from '../components/InspirationUpload';
import VisualChips from '../components/VisualChips';
import PromptCard from '../components/PromptCard';

const BOARDS = [
  { key: 'materials', title: 'לוח חומרים' },
  { key: 'colors',    title: 'לוח צבעים' },
  { key: 'mood',      title: 'לוח השראה' },
];
const ROOMS = [
  { key: 'living',   title: 'סלון' },
  { key: 'kitchen',  title: 'מטבח' },
  { key: 'bedroom',  title: 'חדר שינה' },
  { key: 'bathroom', title: 'חדר רחצה' },
];
const BUILDING_TYPES = [
  { key: 'private',  title: 'בית פרטי — חוץ' },
  { key: 'building', title: 'בניין — חוץ' },
];

export default function WorkScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    loadProjects().then(projects => {
      const found = projects.find(p => p.id === id);
      if (found) setProject(found);
      else navigate('/projects');
    });
  }, [id]);

  // Auto-save with debounce
  function autoSave(partial) {
    setProject(prev => {
      const updated = { ...prev, ...partial };
      // Debounce cloud save
      clearTimeout(saveTimer.current);
      setSaving(true);
      saveTimer.current = setTimeout(() => {
        saveProject(updated).then(() => setSaving(false));
      }, 800);
      return updated;
    });
  }

  async function handleSaveAndReturn() {
    if (project) {
      clearTimeout(saveTimer.current);
      await saveProject(project);
    }
    navigate('/projects');
  }

  if (!project) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );

  const displayName = getProjectName(project);

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 sticky top-0 bg-background z-10 flex items-center gap-4 shadow-sm">
        <button onClick={handleSaveAndReturn} className="font-mono text-sm text-muted-foreground hover:text-gold transition-colors">
          ← פרויקטים
        </button>
        <div className="flex-1 flex items-center gap-3">
          <span className="font-mono text-base font-bold text-gold">#{String(project.number).padStart(2, '0')}</span>
          <input
            value={project.name}
            onChange={(e) => autoSave({ name: e.target.value })}
            placeholder={displayName || 'שם הפרויקט...'}
            className="bg-transparent font-display text-3xl font-light text-foreground focus:outline-none focus:text-gold transition-colors placeholder:text-muted-foreground/40 flex-1"
          />
        </div>
        <div className="flex items-center gap-3">
          {saving && <span className="font-mono text-xs text-muted-foreground/40 animate-pulse">שומר...</span>}
          <button
            onClick={handleSaveAndReturn}
            className="font-mono text-sm text-muted-foreground hover:text-gold transition-colors border border-border hover:border-gold/50 px-4 py-2"
          >
            שמור וחזור
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-14">

        {/* ════════ חלק א׳: קלט ════════ */}
        <div className="flex flex-col gap-10">
          <SectionDivider
            label="חלק א׳ — קלט"
            desc="מלא את כל השדות הבאים. הם ישמשו כבסיס לבניית הפרומפטים האוטומטיים."
            color="text-gold"
          />
          <Section title="תמונת השראה" hint="אופציונלי — תמונה שמייצגת את הכיוון האסתטי הכללי. גרור, הדבק או בחר קובץ.">
            <InspirationUpload
              image={project.inspirationImage}
              onChange={(img) => autoSave({ inspirationImage: img })}
            />
          </Section>
          <Section title="סינתזת סגנונות" hint="בחר שניים מתוך 16 סגנונות עיצוביים. אפשר לבחור רק אחד.">
            <StyleSynthesisPanel project={project} onUpdate={autoSave} />
          </Section>
          <Section title="תיאור ויזואלי" hint="בחר תגית אחת מכל קטגוריה. ככל שתמלא יותר, הפרומפט יהיה מדויק יותר.">
            <VisualChips
              visualDescription={project.visualDescription || {}}
              onChange={(visualDescription) => autoSave({ visualDescription })}
            />
          </Section>
        </div>

        {/* ════════ חלק ב׳: פלט ════════ */}
        <div className="flex flex-col gap-10">
          <SectionDivider
            label="חלק ב׳ — פלט"
            desc="9 מנועי פרומפט. לכל כרטיס — לחץ 'הפק פרומפט', העתק ל-Midjourney, הרץ ושמור את התמונה."
            color="text-foreground"
          />
          <Section title="לוחות בסיס — 3 מנועים" hint="לוחות חזון: חומרים, צבעים ואווירה.">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {BOARDS.map(({ key, title }) => (
                <PromptCard
                  key={key}
                  type={key}
                  title={title}
                  project={project}
                  onUpdate={(section, updatedData) => {
                    autoSave({ [section]: { ...project[section], [key]: updatedData } });
                  }}
                />
              ))}
            </div>
          </Section>
          <Section title="חדרים — 4 מנועים" hint="פרומפט לכל חדר, מותאם לזווית מצלמה ולפרופורציות המרחב.">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {ROOMS.map(({ key, title }) => (
                <PromptCard
                  key={key}
                  type={key}
                  title={title}
                  project={project}
                  onUpdate={(section, updatedData) => {
                    autoSave({ [section]: { ...project[section], [key]: updatedData } });
                  }}
                />
              ))}
            </div>
          </Section>
          <Section title="חזית מבנה — 2 מנועים" hint="פרומפטים לחזית חיצונית.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BUILDING_TYPES.map(({ key, title }) => (
                <PromptCard
                  key={key}
                  type={key}
                  title={title}
                  project={project}
                  onUpdate={(section, updatedData) => {
                    autoSave({ [section]: { ...project[section], [key]: updatedData } });
                  }}
                  isBuildingType={true}
                />
              ))}
            </div>
          </Section>
        </div>

        <div className="flex justify-center pb-10">
          <button
            onClick={handleSaveAndReturn}
            className="font-mono text-sm tracking-widest px-12 py-4 border border-gold text-gold hover:bg-gold hover:text-white transition-all"
          >
            שמור וחזור לרשימה
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionDivider({ label, desc, color }) {
  return (
    <div className="border-2 border-gold/30 bg-gold/5 px-6 py-5 rounded-sm">
      <p className={`font-display text-3xl font-semibold tracking-wide mb-1 ${color}`}>{label}</p>
      <p className="font-mono text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function Section({ title, hint, children }) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground tracking-wide">{title}</h2>
        {hint && <p className="font-mono text-sm text-muted-foreground mt-1 leading-relaxed">{hint}</p>}
        <div className="mt-2 border-b border-border/60" />
      </div>
      {children}
    </section>
  );
}

function StyleSynthesisPanel({ project, onUpdate }) {
  const synthesis = getSynthesis(project.styleSynthesis?.styleA, project.styleSynthesis?.styleB);
  function handleStyleChange(field, value) {
    onUpdate({ styleSynthesis: { ...project.styleSynthesis, [field]: value } });
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 flex-wrap">
        <div className="flex flex-col gap-2 flex-1 min-w-64">
          <label className="font-mono text-sm font-medium text-foreground">סגנון ראשי (A)</label>
          <select
            value={project.styleSynthesis?.styleA || ''}
            onChange={(e) => handleStyleChange('styleA', e.target.value)}
            className="bg-card border border-border text-foreground font-mono text-sm px-3 py-2.5 focus:outline-none focus:border-gold/70 rounded-sm"
            dir="rtl"
          >
            <option value="">— בחר סגנון —</option>
            {STYLES_LIST.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-64">
          <label className="font-mono text-sm font-medium text-foreground">סגנון משני (B) — אופציונלי</label>
          <select
            value={project.styleSynthesis?.styleB || ''}
            onChange={(e) => handleStyleChange('styleB', e.target.value)}
            className="bg-card border border-border text-foreground font-mono text-sm px-3 py-2.5 focus:outline-none focus:border-gold/70 rounded-sm"
            dir="rtl"
          >
            <option value="">— בחר סגנון —</option>
            {STYLES_LIST.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>
      {synthesis && (
        <div className="border border-gold/30 bg-gold/5 px-5 py-4 rounded-sm">
          <p className="font-mono text-xs text-muted-foreground mb-1 uppercase tracking-widest">סינתזה שנוצרה</p>
          <p className="font-mono text-sm text-gold leading-relaxed" dir="ltr">
            {synthesis.token} — {synthesis.tension}
          </p>
        </div>
      )}
    </div>
  );
}