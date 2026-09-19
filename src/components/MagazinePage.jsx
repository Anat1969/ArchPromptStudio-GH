import { getSynthesis, STYLES_LIST } from '../lib/promptEngine';

const BOARD_LABELS = {
  materials: 'חומרים',
  colors:    'צבעים',
  mood:      'אווירה',
};
const ROOM_LABELS = {
  living:   'סלון',
  kitchen:  'מטבח',
  bedroom:  'חדר שינה',
  bathroom: 'חדר רחצה',
};
const BUILDING_LABELS = {
  private:  'בית פרטי — חוץ',
  building: 'בניין — חוץ',
};

function getProjectDisplayName(project) {
  const { styleSynthesis } = project;
  if (!styleSynthesis?.styleA && !styleSynthesis?.styleB) return project.name || `פרויקט #${project.number}`;
  const a = STYLES_LIST.find(s => s.id === styleSynthesis.styleA)?.label?.split(' — ')[0] || '';
  const b = STYLES_LIST.find(s => s.id === styleSynthesis.styleB)?.label?.split(' — ')[0] || '';
  return [a, b].filter(Boolean).join(' × ') || project.name;
}

function collectImages(project) {
  const result = [];
  const boards = project.boards || {};
  const rooms  = project.rooms  || {};
  const bTypes = project.buildingTypes || {};

  Object.entries(boards).forEach(([key, val]) => {
    if (val?.resultImage) result.push({ url: val.resultImage, label: BOARD_LABELS[key] || key, group: 'board' });
  });
  Object.entries(rooms).forEach(([key, val]) => {
    if (val?.resultImage) result.push({ url: val.resultImage, label: ROOM_LABELS[key] || key, group: 'room' });
  });
  Object.entries(bTypes).forEach(([key, val]) => {
    if (val?.resultImage) result.push({ url: val.resultImage, label: BUILDING_LABELS[key] || key, group: 'exterior' });
  });
  return result;
}

export default function MagazinePage({ project }) {
  const synthesis = getSynthesis(project.styleSynthesis?.styleA, project.styleSynthesis?.styleB);
  const images = collectImages(project);
  const displayName = getProjectDisplayName(project);

  if (images.length === 0) return null;

  // Layout: first image is hero, rest fill a grid
  const [hero, ...rest] = images;

  return (
    <article className="border border-border mb-16 bg-card" dir="rtl">

      {/* Magazine top bar */}
      <div className="border-b border-border px-8 py-4 flex items-baseline justify-between">
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-lg font-bold text-gold">#{String(project.number).padStart(2, '0')}</span>
          <h2 className="font-display text-3xl font-light tracking-wide text-foreground">{displayName}</h2>
        </div>
        {synthesis && (
          <p className="font-mono text-xs text-muted-foreground hidden md:block max-w-xs text-left" dir="ltr">
            {synthesis.token}
          </p>
        )}
      </div>

      {/* Body: hero + sidebar text */}
      <div className="grid grid-cols-1 md:grid-cols-3">

        {/* Hero image — spans 2 cols */}
        <div className="md:col-span-2 relative aspect-video md:aspect-auto md:min-h-80 overflow-hidden border-b md:border-b-0 md:border-l border-border">
          <img src={hero.url} alt={hero.label} className="w-full h-full object-cover" />
          <span className="absolute bottom-3 right-3 font-mono text-xs text-white/70 bg-black/30 px-2 py-0.5">
            {hero.label}
          </span>
        </div>

        {/* Sidebar: text */}
        <div className="flex flex-col justify-between p-7 border-b md:border-b-0 border-border">
          <div className="flex flex-col gap-5">
            {synthesis && (
              <div>
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">סינתזה עיצובית</p>
                <p className="font-display text-xl font-light text-foreground leading-snug">{synthesis.tension}</p>
              </div>
            )}
            {synthesis && (
              <div>
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">חומרים</p>
                <p className="font-mono text-sm text-foreground/70 leading-relaxed" dir="ltr">{synthesis.material}</p>
              </div>
            )}
            {project.poeticDescription && (
              <div>
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">רוח הפרויקט</p>
                <p className="font-mono text-sm text-muted-foreground leading-relaxed italic">{project.poeticDescription}</p>
              </div>
            )}
          </div>
          <div className="mt-6 border-t border-border/50 pt-4">
            <p className="font-mono text-xs text-muted-foreground/40">
              {new Date(project.updatedAt).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </p>
            {synthesis && (
              <p className="font-mono text-xs text-muted-foreground/40 mt-1" dir="ltr">{synthesis.architect}</p>
            )}
          </div>
        </div>
      </div>

      {/* Secondary image grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-border">
          {rest.map((img, i) => (
            <div key={i} className={`relative aspect-video overflow-hidden border-l border-border ${i > 0 ? 'border-l' : ''}`}>
              <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
              <span className="absolute bottom-2 right-2 font-mono text-xs text-white/60 bg-black/30 px-1.5 py-0.5">
                {img.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}