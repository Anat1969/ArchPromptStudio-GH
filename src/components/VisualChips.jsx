import { VISUAL_OPTIONS, SECTION_LABELS } from '../lib/promptEngine';

const SECTION_HINTS = {
  materials:  'בחר את החומר הדומיננטי במרחב. בחירה זו תקבע את המרקם וה"תחושה" של הפרומפט.',
  palette:    'בחר כיוון צבעוני כללי. ישפיע על גווני האור, הרצפה והקירות בפרומפט.',
  light:      'כיצד האור מתנהג במרחב. זהו אחד הגורמים החשובים ביותר לאווירת התמונה.',
  atmosphere: 'האופי הכולל של המרחב — ישפיע על הקומפוזיציה ועל הפרטים הנבחרים.',
};

export default function VisualChips({ visualDescription, onChange }) {
  function select(category, id) {
    const current = visualDescription[category];
    onChange({ ...visualDescription, [category]: current === id ? '' : id });
  }

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(VISUAL_OPTIONS).map(([cat, options]) => (
        <div key={cat} className="flex flex-col gap-2">
          <div>
            <p className="font-mono text-sm font-semibold text-foreground">{SECTION_LABELS[cat]}</p>
            <p className="font-mono text-xs text-muted-foreground mt-0.5">{SECTION_HINTS[cat]}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {options.map(({ id, label }) => {
              const active = visualDescription[cat] === id;
              return (
                <button
                  key={id}
                  onClick={() => select(cat, id)}
                  className={`font-mono text-sm px-4 py-2 border transition-all rounded-sm ${
                    active
                      ? 'border-gold bg-gold/10 text-gold font-medium'
                      : 'border-border text-muted-foreground hover:border-gold/50 hover:text-foreground bg-card'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}