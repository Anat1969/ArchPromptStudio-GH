import { motion, AnimatePresence } from 'framer-motion';
import { getSynthesis, STYLES_LIST, VISUAL_OPTIONS } from '../lib/promptEngine';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getDisplayName(project) {
  const { styleSynthesis } = project;
  if (!styleSynthesis?.styleA && !styleSynthesis?.styleB) return project.name || `פרויקט #${project.number}`;
  const a = STYLES_LIST.find(s => s.id === styleSynthesis?.styleA)?.label?.split(' — ')[0] || '';
  const b = STYLES_LIST.find(s => s.id === styleSynthesis?.styleB)?.label?.split(' — ')[0] || '';
  return [a, b].filter(Boolean).join(' × ') || project.name;
}

function getVisualLabel(category, id) {
  return VISUAL_OPTIONS[category]?.find(o => o.id === id)?.label || id;
}

function getAllImages(project) {
  return [
    ...Object.values(project.boards || {}),
    ...Object.values(project.rooms  || {}),
    ...Object.values(project.buildingTypes || {}),
  ].filter(v => v?.resultImage).map(v => v.resultImage);
}

// ─── Caption generator — poetic-pragmatic editorial voice ────────────────────
// Integrates: inspiration context, style choices, material palette, philosophical framing

function buildCaption(imageType, imageKey, project, synthesis) {
  const styleA = STYLES_LIST.find(s => s.id === project.styleSynthesis?.styleA)?.label?.split(' — ')[0] || '';
  const styleB = STYLES_LIST.find(s => s.id === project.styleSynthesis?.styleB)?.label?.split(' — ')[0] || '';
  const styleRef = [styleA, styleB].filter(Boolean).join(' ו');
  const hasInspiration = !!project.inspirationImage;
  const inspirationLine = '';

  const mat = synthesis?.material || '';
  const tension = synthesis?.tension || '';
  const token = synthesis?.token || '';
  const architect = synthesis?.architect || '';

  if (imageType === 'boards') {
    if (imageKey === 'materials') {
      return [
        styleRef
          ? `הפרויקט מבוסס על הסינתזה בין ${styleRef} — שתי שפות אדריכליות שמגדירות יחד את הלוגיקה החומרית.`
          : '',
        mat
          ? `${mat} — לא בחירה אסתטית גרידא, אלא עמדה אתית: כל חומר נושא בתוכו זיכרון, עמידות, ודעיכה.`
          : '',
        'לוח החומרים הוא המקום שבו הפרויקט מסרב להיות מופשט. כאן הוא נוגע, מחמם, משאיר עקבות.',
      ].filter(Boolean).join(' ');
    }
    if (imageKey === 'colors') {
      return [
        tension ? `"${tension}" — המתח הזה אינו רק עיצובי, הוא גם כרומטי.` : '',
        styleRef ? `הסגנון ${styleRef} מכתיב יחס מוגדר לצבע: לא קישוט, אלא מבנה.` : '',
        'פלטת הצבעים שנבחרה כאן מקיימת שיח עם האור הטבעי של המרחב — היא משתנה עם שעות היום, עם עונות השנה, עם הנוכחות האנושית.',
        'צבע שמשרת אדריכלות אינו צבע שצועק — הוא צבע שמאפשר.',
      ].filter(Boolean).join(' ');
    }
    if (imageKey === 'mood') {
      return [
        token ? `הסינתזה "${token}" נולדה לא מתוך ספרות אדריכלות אלא מתוך תחושה. לוח האווירה הוא הניסיון לתרגם אותה.` : '',
        styleRef ? `ב${styleRef}, האווירה אינה תוצאה של תכנון — היא תנאי מוקדם שלו.` : '',
        'הדפים האלה אינם מסבירים את הפרויקט. הם מרגישים אותו לפני שהוא קיים.',
      ].filter(Boolean).join(' ');
    }
  }

  if (imageType === 'rooms') {
    if (imageKey === 'living') {
      return [
        styleRef ? `ב${styleRef}, הסלון אינו חדר — הוא פוליטיקה פנימית.` : 'הסלון הוא הפוליטיקה הפנימית של הבית.',
        mat ? `${mat} מגדיר כאן את קו הפרשת המים בין חימום לקרירות, בין הכנסת אורחים לבין הסתגרות.` : '',
        tension ? `"${tension}" — המתח הזה מגיע לשיאו ממש כאן, בחלל שצריך להיות הכל בו-זמנית.` : '',
        inspirationLine,
        'האדריכל שואל: מה אנשים עושים כשהם נמצאים יחד? והתשובה מעצבת כל קיר, כל פינה, כל מרחק בין ספה לחלון.',
      ].filter(Boolean).join(' ');
    }
    if (imageKey === 'kitchen') {
      return [
        mat ? `${mat} נבחר לא רק מפני שהוא יפה — אלא מפני שהוא עומד בפני שגרה.` : '',
        styleRef ? `ב${styleRef}, המטבח מסרב להיות שירות. הוא חלק מהנרטיב האדריכלי הכולל.` : '',
        'אם הסלון הוא הפנים הציבוריים של הבית, המטבח הוא הפנים האמיתיים שלו — שם היומיום חשוף, לא מעוצב.',
        'האסתטיקה שנבחרה כאן אינה מבקשת להסתיר תפקוד. היא מציגה אותו כמין כבוד.',
      ].filter(Boolean).join(' ');
    }
    if (imageKey === 'bedroom') {
      return [
        tension ? `"${tension}" — שאלה שמגיעה לקיצוניות שלה בחדר השינה.` : '',
        styleRef ? `הסינתזה בין ${styleRef} מציבה שאלה: כמה אור? כמה ריק? כמה גוף?` : '',
        mat ? `${mat} כאן אינו חומר — הוא טמפרטורה. הוא מגדיר את ההרגשה של כף יד על קיר בשעה שלוש בלילה.` : '',
        'חדר השינה הוא הטיעון הכי פילוסופי של הבית: מה אנחנו צריכים כדי לנוח? והתשובה תמיד חושפת ערכים.',
      ].filter(Boolean).join(' ');
    }
    if (imageKey === 'bathroom') {
      return [
        styleRef ? `ב${styleRef}, חדר הרחצה הוא מבחן האמת — שם האסתטיקה אינה יכולה להתחבא מאחורי תוכן.` : '',
        mat ? `${mat} — בסביבה שבה כל משטח נוגע ישירות בגוף, בחירת החומר היא כמעט מוסרית.` : '',
        'אפילו מינימליזם הוא בחירה עמוסה: לבחור לא לוותר, אלא לסנן. לוותר על העודף כדי שהמהותי יואר.',
        'חדר הרחצה הוא מקום שכולו פרטיות — ולכן כולו אמת.',
      ].filter(Boolean).join(' ');
    }
  }

  if (imageType === 'buildingTypes') {
    if (imageKey === 'private') {
      return [
        project.poeticDescription ? project.poeticDescription : '',
        styleRef ? `ב${styleRef}, החזית היא לא מסך — היא קו דיאלוג בין עולם פנימי לעולם חיצוני.` : '',
        tension ? `"${tension}" — המתח הזה אינו פנימי בלבד. הוא חוצה קיר.` : '',
        'הבית הפרטי שואל שאלה שהעיר שואלת בחזרה: כמה אתה מוכן לחשוף? כמה אתה מבקש להגן?',
        architect ? `בעקבות ${architect} — שאלת החזית היא שאלת הזהות.` : '',
      ].filter(Boolean).join(' ');
    }
    if (imageKey === 'building') {
      return [
        styleRef ? `הסינתזה בין ${styleRef} מציבה אתגר מסדר שני: כיצד שפה עיצובית פרטית מתרגמת לקנה מידה ציבורי?` : '',
        mat ? `${mat} ברמת הבניין הרב-קומותי אינו רק בחירת חומר — הוא עמדה עירונית.` : '',
        tension ? `"${tension}" — מתח שמכפיל את עצמו עם כל קומה.` : '',
        'הבניין שואל שאלות שהבית הפרטי פטור מהן: מה חובתנו כלפי הרחוב? כלפי השמיים? כלפי מי יגיע אחרינו?',
      ].filter(Boolean).join(' ');
    }
  }

  return '';
}

function getCaption(imageType, imageKey, project) {
  const synthesis = getSynthesis(project.styleSynthesis?.styleA, project.styleSynthesis?.styleB);
  return buildCaption(imageType, imageKey, project, synthesis);
}

// ─── Layout variants ──────────────────────────────────────────────────────────

const LAYOUTS = ['hero-text-bottom', 'text-left-image-right', 'image-left-text-right', 'fullbleed-caption'];

function getLayout(index) {
  return LAYOUTS[index % LAYOUTS.length];
}

// ─── Fade transition ──────────────────────────────────────────────────────────

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
  exit:    { opacity: 0, transition: { duration: 0.35 } },
};

// ─── Spread dispatcher ────────────────────────────────────────────────────────

export default function MagazineSpread({ spread, project }) {
  const key = spread.type + (spread.label || '') + (spread.imageKey || '');
  return (
    <AnimatePresence mode="wait">
      <motion.div key={key} {...pageTransition} className="w-full h-full">
        {spread.type === 'cover'    && <CoverPage    project={project} />}
        {spread.type === 'image'    && <ImagePage    project={project} spread={spread} />}
        {spread.type === 'colophon' && <ColophonPage project={project} />}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Cover Page ───────────────────────────────────────────────────────────────

function CoverPage({ project }) {
  const synthesis   = getSynthesis(project.styleSynthesis?.styleA, project.styleSynthesis?.styleB);
  const displayName = getDisplayName(project);
  const allImages   = getAllImages(project);
  const heroUrl     = project.inspirationImage || allImages[0] || null;

  return (
    <div className="w-full h-full relative bg-[#0e0e0e] overflow-hidden flex">
      {/* Full-bleed hero image — fixed proportion, no stretch */}
      <div className="relative w-[60%] h-full flex-shrink-0 overflow-hidden">
        {heroUrl ? (
          <>
            <img src={heroUrl} alt={displayName} className="w-full h-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-black/80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0e0e0e]" />
        )}
      </div>

      {/* Right text column */}
      <div className="flex-1 bg-[#0e0e0e] flex flex-col justify-between px-10 py-14 border-r border-white/5 overflow-y-auto">
        <div>
          <p className="font-mono text-xs tracking-[0.4em] text-gold/60 mb-10 uppercase">Prompt Studio</p>
          <div className="w-6 h-px bg-gold mb-10" />
          <span className="font-mono text-xs text-white/25 block mb-3">#{String(project.number).padStart(2, '0')}</span>
          <h1 className="font-display text-5xl font-light text-white leading-tight tracking-wide mb-8">
            {displayName}
          </h1>
          {project.poeticDescription && (
            <p className="font-mono text-base text-white/55 leading-relaxed italic border-r-2 border-gold/40 pr-5">
              {project.poeticDescription}
            </p>
          )}
        </div>

        {synthesis && (
          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs text-white/20 uppercase tracking-widest">design tension</p>
            <p className="font-display text-2xl text-white/75 font-light italic leading-snug" dir="ltr">
              "{synthesis.tension}"
            </p>
            <div className="w-full h-px bg-white/10 my-2" />
            <div className="flex flex-wrap gap-2">
              {['materials', 'palette', 'light', 'atmosphere'].map(cat => {
                const val = project.visualDescription?.[cat];
                if (!val) return null;
                return (
                  <span key={cat} className="font-mono text-xs px-2 py-1 border border-white/10 text-white/35">
                    {getVisualLabel(cat, val)}
                  </span>
                );
              })}
            </div>
            <p className="font-mono text-xs text-white/15 tracking-widest mt-1">
              {new Date(project.updatedAt).toLocaleDateString('he-IL', { year: 'numeric', month: 'long' })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Image Page ───────────────────────────────────────────────────────────────

function ImagePage({ project, spread }) {
  const { imageUrl, imageLabel, imageKey, imageType, pageIndex } = spread;
  const synthesis   = getSynthesis(project.styleSynthesis?.styleA, project.styleSynthesis?.styleB);
  const displayName = getDisplayName(project);
  const caption     = getCaption(imageType, imageKey, project);
  const layout      = getLayout(pageIndex);

  const sectionTag = imageType === 'boards' ? 'שפה עיצובית'
                   : imageType === 'rooms'   ? 'מרחב פנים'
                   : 'חזית מבנה';

  // ── Layout A: Full-bleed image, text block at bottom ──
  if (layout === 'hero-text-bottom') {
    return (
      <div className="w-full h-full relative overflow-hidden bg-[#111]">
        <img src={imageUrl} alt={imageLabel} className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
        <div className="absolute top-10 right-10 flex items-center gap-3">
          <div className="w-5 h-px bg-gold" />
          <span className="font-mono text-sm text-white/50 uppercase tracking-widest">{sectionTag}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-14 py-12">
          <p className="font-mono text-sm text-gold/80 uppercase tracking-widest mb-4">{imageLabel}</p>
          <h2 className="font-display text-5xl font-light text-white leading-tight mb-6">{displayName}</h2>
          {caption && (
            <p className="font-display text-3xl text-white/80 leading-relaxed max-w-2xl font-light italic">״{caption}״</p>
          )}
          {synthesis && (
            <p className="font-display text-xl text-white/35 mt-6 leading-relaxed italic font-light" dir="ltr">"{synthesis.token}"</p>
          )}
        </div>
        <div className="absolute bottom-12 left-14">
          <span className="font-mono text-sm text-white/15">{String(pageIndex + 2).padStart(2, '0')}</span>
        </div>
      </div>
    );
  }

  // ── Layout B: Text left, image right ──
  if (layout === 'text-left-image-right') {
    return (
      <div className="w-full h-full flex bg-background">
        <div className="w-[45%] flex-shrink-0 flex flex-col justify-between px-12 py-16 border-l border-border overflow-y-auto">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-5 h-px bg-gold" />
              <span className="font-mono text-sm text-gold/70 uppercase tracking-widest">{sectionTag}</span>
            </div>
            <h2 className="font-display text-6xl font-light text-foreground leading-tight mb-6">{imageLabel}</h2>
            <div className="w-8 h-px bg-border mb-8" />
            {caption && (
              <p className="font-display text-2xl text-foreground/80 leading-relaxed font-light italic">״{caption}״</p>
            )}
          </div>
          <div>
            {synthesis && (
              <div className="border-r-2 border-gold/30 pr-5 mb-6">
                <p className="font-display text-2xl text-foreground/70 italic font-light leading-snug">
                  "{synthesis.tension}"
                </p>
              </div>
            )}
            <span className="font-mono text-sm text-muted-foreground/30">{String(pageIndex + 2).padStart(2, '0')}</span>
          </div>
        </div>
        {/* Image — natural proportions via object-cover, no distortion */}
        <div className="flex-1 relative overflow-hidden bg-[#111]">
          <img src={imageUrl} alt={imageLabel} className="w-full h-full object-cover object-center" />
        </div>
      </div>
    );
  }

  // ── Layout C: Image left, text right ──
  if (layout === 'image-left-text-right') {
    return (
      <div className="w-full h-full flex bg-background">
        {/* Image — natural proportions */}
        <div className="w-[55%] flex-shrink-0 relative overflow-hidden bg-[#111]">
          <img src={imageUrl} alt={imageLabel} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/15" />
        </div>
        <div className="flex-1 flex flex-col justify-between px-12 py-16 border-r border-border overflow-y-auto">
          <div>
            <span className="font-mono text-sm text-muted-foreground/40 uppercase tracking-widest block mb-2">{sectionTag}</span>
            <div className="w-full h-px bg-border mb-8" />
            <h2 className="font-display text-5xl font-light text-foreground leading-tight mb-6">{imageLabel}</h2>
            {caption && (
              <p className="font-display text-2xl text-foreground/80 leading-relaxed font-light italic">״{caption}״</p>
            )}
          </div>
          <div className="flex flex-col gap-4">
            {synthesis && (
              <>
                <div className="w-full h-px bg-border" />
                <p className="font-display text-lg text-muted-foreground/60 leading-relaxed italic font-light" dir="ltr">"{synthesis.material}"</p>
              </>
            )}
            <span className="font-mono text-sm text-muted-foreground/25">{String(pageIndex + 2).padStart(2, '0')}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Layout D: Full-bleed + side caption strip ──
  return (
    <div className="w-full h-full relative overflow-hidden bg-[#111]">
      <img src={imageUrl} alt={imageLabel} className="w-full h-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-l from-black/90 via-black/30 to-transparent" />
      <div className="absolute top-0 left-0 bottom-0 w-[40%] flex flex-col justify-center px-12 gap-7 overflow-y-auto">
        <div className="flex items-center gap-3">
          <div className="w-5 h-px bg-gold" />
          <span className="font-mono text-sm text-white/50 uppercase tracking-widest">{sectionTag}</span>
        </div>
        <h2 className="font-display text-5xl font-light text-white leading-tight">{imageLabel}</h2>
        {caption && (
          <p className="font-display text-2xl text-white/80 leading-relaxed font-light italic">״{caption}״</p>
        )}
        {synthesis && (
          <div className="border-r border-gold/30 pr-5 mt-2">
            <p className="font-display text-xl text-white/55 italic font-light leading-snug">
              "{synthesis.token}"
            </p>
          </div>
        )}
        <span className="font-mono text-sm text-white/20 mt-4">{String(pageIndex + 2).padStart(2, '0')}</span>
      </div>
    </div>
  );
}

// ─── Colophon Page ────────────────────────────────────────────────────────────

function ColophonPage({ project }) {
  const synthesis   = getSynthesis(project.styleSynthesis?.styleA, project.styleSynthesis?.styleB);
  const displayName = getDisplayName(project);
  const allImages   = getAllImages(project);

  return (
    <div className="w-full h-full flex bg-[#0e0e0e]">
      <div className="w-[55%] flex-shrink-0 relative overflow-hidden">
        {allImages.length >= 4 ? (
          <div className="grid grid-cols-2 grid-rows-2 h-full gap-px bg-white/5">
            {allImages.slice(-4).map((url, i) => (
              <div key={i} className="relative overflow-hidden">
                <img src={url} alt="" className="w-full h-full object-cover object-center" />
              </div>
            ))}
          </div>
        ) : allImages.length >= 2 ? (
          <div className="flex flex-col h-full gap-px bg-white/5">
            {allImages.slice(-2).map((url, i) => (
              <div key={i} className="flex-1 relative overflow-hidden">
                <img src={url} alt="" className="w-full h-full object-cover object-center" />
              </div>
            ))}
          </div>
        ) : allImages[0] ? (
          <img src={allImages[0]} alt="" className="w-full h-full object-cover object-center" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0e0e0e]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0e0e0e]/80 pointer-events-none" />
      </div>

      <div className="flex-1 flex flex-col justify-between px-12 py-16 overflow-y-auto">
        <div>
          <p className="font-mono text-sm text-gold/40 uppercase tracking-[0.4em] mb-10">כולופון</p>
          <h2 className="font-display text-5xl font-light text-white leading-tight mb-2">{displayName}</h2>
          <p className="font-mono text-sm text-white/20 mb-10">
            #{String(project.number).padStart(2, '0')} —{' '}
            {new Date(project.updatedAt).toLocaleDateString('he-IL', { year: 'numeric', month: 'long' })}
          </p>
          {project.poeticDescription && (
            <p className="font-mono text-base text-white/55 leading-relaxed italic border-r-2 border-gold/30 pr-5 mb-8">
              {project.poeticDescription}
            </p>
          )}
          {synthesis && (
            <div className="flex flex-col gap-5 border-r border-white/10 pr-5">
              {[
                { label: 'synthesis token',  val: synthesis.token },
                { label: 'material palette', val: synthesis.material },
                { label: 'light condition',  val: synthesis.light },
                { label: 'architect ref',    val: synthesis.architect },
              ].filter(r => r.val).map(row => (
                <div key={row.label}>
                  <p className="font-mono text-xs text-white/20 uppercase tracking-widest mb-1">{row.label}</p>
                  <p className="font-mono text-sm text-white/50 leading-relaxed" dir="ltr">{row.val}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <div className="w-full h-px bg-white/10" />
          <div className="flex flex-wrap gap-2">
            {['materials', 'palette', 'light', 'atmosphere'].map(cat => {
              const val = project.visualDescription?.[cat];
              if (!val) return null;
              return (
                <span key={cat} className="font-mono text-sm px-2 py-1 border border-white/10 text-white/30">
                  {getVisualLabel(cat, val)}
                </span>
              );
            })}
          </div>
          <p className="font-mono text-xs text-white/10 tracking-widest mt-2">PROMPT STUDIO — ARCHITECTURAL MAGAZINE</p>
        </div>
      </div>
    </div>
  );
}