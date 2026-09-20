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
    <div className="w-full h-full relative bg-[hsl(var(--mag-bg))] overflow-hidden flex">
      {/* Full-bleed hero image — fixed proportion, no stretch */}
      <div className="relative w-[60%] h-full flex-shrink-0 overflow-hidden">
        {heroUrl ? (
          <>
            <img src={heroUrl} alt={displayName} className="w-full h-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--mag-scrim)/0.1)] to-[hsl(var(--mag-scrim)/0.8)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--mag-scrim)/0.6)] via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--mag-bg-2))] to-[hsl(var(--mag-bg))]" />
        )}
      </div>

      {/* Right text column */}
      <div className="flex-1 bg-[hsl(var(--mag-bg))] flex flex-col justify-between px-10 py-14 border-r border-[hsl(var(--mag-hair)/0.06)] overflow-y-auto">
        <div>
          <p className="font-mono text-xs tracking-[0.4em] text-gold/60 mb-10 uppercase">Prompt Studio</p>
          <div className="w-6 h-px bg-gold mb-10" />
          <span className="font-mono text-xs text-[hsl(var(--mag-fg)/0.25)] block mb-3">#{String(project.number).padStart(2, '0')}</span>
          <h1 className="font-display text-5xl font-light text-[hsl(var(--mag-fg))] leading-tight tracking-wide mb-8">
            {displayName}
          </h1>
          {project.poeticDescription && (
            <p className="font-mono text-base text-[hsl(var(--mag-fg)/0.55)] leading-relaxed italic border-r-2 border-gold/40 pr-5">
              {project.poeticDescription}
            </p>
          )}
        </div>

        {synthesis && (
          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs text-[hsl(var(--mag-fg)/0.2)] uppercase tracking-widest">design tension</p>
            <p className="font-display text-2xl text-[hsl(var(--mag-fg)/0.75)] font-light italic leading-snug" dir="ltr">
              "{synthesis.tension}"
            </p>
            <div className="w-full h-px bg-[hsl(var(--mag-hair)/0.1)] my-2" />
            <div className="flex flex-wrap gap-2">
              {['materials', 'palette', 'light', 'atmosphere'].map(cat => {
                const val = project.visualDescription?.[cat];
                if (!val) return null;
                return (
                  <span key={cat} className="font-mono text-xs px-2 py-1 border border-[hsl(var(--mag-hair)/0.1)] text-[hsl(var(--mag-fg)/0.35)]">
                    {getVisualLabel(cat, val)}
                  </span>
                );
              })}
            </div>
            <p className="font-mono text-xs text-[hsl(var(--mag-fg)/0.15)] tracking-widest mt-1">
              {new Date(project.updatedAt).toLocaleDateString('he-IL', { year: 'numeric', month: 'long' })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Image Page ───────────────────────────────────────────────────────────────

// Break a caption into one line per sentence (a full line up to the period).
function toLines(text) {
  if (!text) return [];
  return text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
}

// Shared typography — identical sizes on every page; hierarchy within the page.
// A scrim-colored text-shadow gives sharp contrast over a mostly-clear image.
const SHADOW = '[text-shadow:0_2px_14px_hsl(var(--mag-scrim)/0.95)]';
const T = {
  tag: 'font-mono text-sm uppercase tracking-widest text-gold',
  h:   `font-display text-5xl font-light leading-tight text-[hsl(var(--mag-fg))] ${SHADOW}`,
  cap: `font-display text-2xl font-light italic leading-relaxed text-[hsl(var(--mag-fg))] ${SHADOW}`,
  sub: `font-display text-lg font-light italic leading-snug text-[hsl(var(--mag-fg)/0.85)] ${SHADOW}`,
  num: `font-mono text-sm text-[hsl(var(--mag-fg)/0.6)] ${SHADOW}`,
};

function TextBlock({ sectionTag, imageLabel, captionLines, sub, pageIndex }) {
  return (
    <>
      <div className="flex items-center gap-3">
        <div className="w-6 h-px bg-gold" />
        <span className={T.tag}>{sectionTag}</span>
      </div>
      <h2 className={T.h}>{imageLabel}</h2>
      {captionLines.length > 0 && (
        <div className="flex flex-col gap-2">
          {captionLines.map((line, i) => <p key={i} className={T.cap}>{line}</p>)}
        </div>
      )}
      {sub && <p className={T.sub} dir="ltr">&quot;{sub}&quot;</p>}
      <span className={T.num}>{String(pageIndex + 2).padStart(2, '0')}</span>
    </>
  );
}

function ImagePage({ project, spread }) {
  const { imageUrl, imageLabel, imageKey, imageType, pageIndex } = spread;
  const synthesis = getSynthesis(project.styleSynthesis?.styleA, project.styleSynthesis?.styleB);
  const caption   = getCaption(imageType, imageKey, project);
  const captionLines = toLines(caption);
  const layout    = getLayout(pageIndex);
  const sub       = synthesis?.tension || synthesis?.token || '';

  const sectionTag = imageType === 'boards' ? 'שפה עיצובית'
                   : imageType === 'rooms'   ? 'מרחב פנים'
                   : 'חזית מבנה';

  // Text position per layout (consistent language: image + light gradient + text).
  const pos = layout === 'text-left-image-right' ? 'right'
            : layout === 'image-left-text-right' ? 'left'
            : 'bottom';

  const block = (
    <TextBlock sectionTag={sectionTag} imageLabel={imageLabel} captionLines={captionLines} sub={sub} pageIndex={pageIndex} />
  );

  if (pos === 'bottom') {
    return (
      <div className="w-full h-full relative overflow-hidden bg-[hsl(var(--mag-bg-2))]">
        <img src={imageUrl} alt={imageLabel} className="w-full h-full object-cover object-center" />
        {/* light gradient — image stays sharp, only the text band darkens */}
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--mag-scrim)/0.88)] via-[hsl(var(--mag-scrim)/0.12)] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-16 py-12 max-h-[72%] flex flex-col gap-5 overflow-y-auto">
          {block}
        </div>
      </div>
    );
  }

  const sideClass = pos === 'right' ? 'right-0' : 'left-0';
  const grad = pos === 'right'
    ? 'bg-gradient-to-l from-[hsl(var(--mag-scrim)/0.9)] via-[hsl(var(--mag-scrim)/0.18)] to-transparent'
    : 'bg-gradient-to-r from-[hsl(var(--mag-scrim)/0.9)] via-[hsl(var(--mag-scrim)/0.18)] to-transparent';

  return (
    <div className="w-full h-full relative overflow-hidden bg-[hsl(var(--mag-bg-2))]">
      <img src={imageUrl} alt={imageLabel} className="w-full h-full object-cover object-center" />
      <div className={`absolute inset-0 ${grad}`} />
      <div className={`absolute top-0 ${sideClass} bottom-0 w-[46%] px-14 flex flex-col justify-center gap-5 overflow-y-auto`}>
        {block}
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
    <div className="w-full h-full flex bg-[hsl(var(--mag-bg))]">
      <div className="w-[55%] flex-shrink-0 relative overflow-hidden">
        {allImages.length >= 4 ? (
          <div className="grid grid-cols-2 grid-rows-2 h-full gap-px bg-[hsl(var(--mag-hair)/0.05)]">
            {allImages.slice(-4).map((url, i) => (
              <div key={i} className="relative overflow-hidden">
                <img src={url} alt="" className="w-full h-full object-cover object-center" />
              </div>
            ))}
          </div>
        ) : allImages.length >= 2 ? (
          <div className="flex flex-col h-full gap-px bg-[hsl(var(--mag-hair)/0.05)]">
            {allImages.slice(-2).map((url, i) => (
              <div key={i} className="flex-1 relative overflow-hidden">
                <img src={url} alt="" className="w-full h-full object-cover object-center" />
              </div>
            ))}
          </div>
        ) : allImages[0] ? (
          <img src={allImages[0]} alt="" className="w-full h-full object-cover object-center" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--mag-bg-2))] to-[hsl(var(--mag-bg))]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[hsl(var(--mag-bg)/0.8)] pointer-events-none" />
      </div>

      <div className="flex-1 flex flex-col justify-between px-12 py-16 overflow-y-auto">
        <div>
          <p className="font-mono text-sm text-gold/40 uppercase tracking-[0.4em] mb-10">כולופון</p>
          <h2 className="font-display text-5xl font-light text-[hsl(var(--mag-fg))] leading-tight mb-2">{displayName}</h2>
          <p className="font-mono text-sm text-[hsl(var(--mag-fg)/0.2)] mb-10">
            #{String(project.number).padStart(2, '0')} —{' '}
            {new Date(project.updatedAt).toLocaleDateString('he-IL', { year: 'numeric', month: 'long' })}
          </p>
          {project.poeticDescription && (
            <p className="font-mono text-base text-[hsl(var(--mag-fg)/0.55)] leading-relaxed italic border-r-2 border-gold/30 pr-5 mb-8">
              {project.poeticDescription}
            </p>
          )}
          {synthesis && (
            <div className="flex flex-col gap-5 border-r border-[hsl(var(--mag-hair)/0.1)] pr-5">
              {[
                { label: 'synthesis token',  val: synthesis.token },
                { label: 'material palette', val: synthesis.material },
                { label: 'light condition',  val: synthesis.light },
                { label: 'architect ref',    val: synthesis.architect },
              ].filter(r => r.val).map(row => (
                <div key={row.label}>
                  <p className="font-mono text-xs text-[hsl(var(--mag-fg)/0.2)] uppercase tracking-widest mb-1">{row.label}</p>
                  <p className="font-mono text-sm text-[hsl(var(--mag-fg)/0.5)] leading-relaxed" dir="ltr">{row.val}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <div className="w-full h-px bg-[hsl(var(--mag-hair)/0.1)]" />
          <div className="flex flex-wrap gap-2">
            {['materials', 'palette', 'light', 'atmosphere'].map(cat => {
              const val = project.visualDescription?.[cat];
              if (!val) return null;
              return (
                <span key={cat} className="font-mono text-sm px-2 py-1 border border-[hsl(var(--mag-hair)/0.1)] text-[hsl(var(--mag-fg)/0.3)]">
                  {getVisualLabel(cat, val)}
                </span>
              );
            })}
          </div>
          <p className="font-mono text-xs text-[hsl(var(--mag-fg)/0.1)] tracking-widest mt-2">PROMPT STUDIO — ARCHITECTURAL MAGAZINE</p>
        </div>
      </div>
    </div>
  );
}
