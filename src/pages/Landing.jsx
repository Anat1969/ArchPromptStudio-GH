import { useNavigate } from 'react-router-dom';

const STEPS = [
  {
    num: '01',
    title: 'צור פרויקט חדש',
    desc: 'לחץ על "פרויקט חדש" ותן לו שם. כל פרויקט מייצג לקוח או מרחב אחד.',
  },
  {
    num: '02',
    title: 'בחר סגנונות וקלט ויזואלי',
    desc: 'בחר עד שני סגנונות עיצוביים (סגנון A + סגנון B) ובחר תגיות ויזואליות: חומרים, פלטת צבעים, תאורה ואווירה.',
  },
  {
    num: '03',
    title: 'העלה תמונת השראה',
    desc: 'תמונה שמייצגת את הכיוון הכללי של הפרויקט. תשמש כהקשר ויזואלי לפרומפטים.',
  },
  {
    num: '04',
    title: 'הפק פרומפטים',
    desc: 'לחץ "הפק פרומפט" בכל כרטיס — עבור לוחות בסיס (חומרים, צבעים, מוד), חדרים (סלון, מטבח, חדר שינה, חדר רחצה) ואלמנטים חיצוניים.',
  },
  {
    num: '05',
    title: 'העתק ל-Midjourney',
    desc: 'העתק את הפרומפט שנוצר, הרץ אותו ב-Midjourney, ושמור את התוצאה.',
  },
  {
    num: '06',
    title: 'הדבק את התמונה בחזרה',
    desc: 'גרור, הדבק (Ctrl+V) או בחר את קובץ התמונה שקיבלת ישירות לתוך הכרטיס. היא תישמר ותופיע בגלריה.',
  },
];

const INPUTS = [
  { label: 'סגנון A + סגנון B', desc: 'שני סגנונות עיצוביים שמייצרים סינתזה ייחודית (למשל: Wabi-Sabi × Brutalism)' },
  { label: 'תגיות ויזואליות', desc: 'חומרים, פלטת צבעים, תנאי תאורה, אווירה — לחיצה אחת לכל בחירה' },
  { label: 'תמונת השראה', desc: 'תמונה חופשית שמגדירה את הכיוון האסתטי הכללי' },
  { label: 'עריכה ידנית', desc: 'כל פרומפט שנוצר ניתן לעריכה חופשית לפני העתקה' },
];

const OUTPUTS = [
  { label: 'פרומפט לוח חומרים', desc: 'מייצר mood board של טקסטורות וחומרים' },
  { label: 'פרומפט לוח צבעים', desc: 'פלטה ויזואלית מדויקת לפרויקט' },
  { label: 'פרומפט לוח מוד', desc: 'אווירה כוללת ותחושת המרחב' },
  { label: 'פרומפטים לחדרים', desc: 'סלון, מטבח, חדר שינה, חדר רחצה — כל אחד מותאם לסגנון' },
  { label: 'פרומפטים לחוץ', desc: 'חזית בית פרטי וחזית בניין' },
  { label: 'גלריית תמונות', desc: 'כל התמונות שהועלו — מאורגנות לפי פרויקט' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" dir="rtl">
      {/* Hero */}
      <header className="border-b border-border px-8 py-10 flex flex-col items-center text-center gap-4">
        <p className="font-mono text-xs text-gold/60 tracking-[0.3em] uppercase">Architectural Midjourney Generator</p>
        <h1 className="font-display text-6xl md:text-7xl font-light tracking-widest text-gold">PROMPT STUDIO</h1>
        <p className="font-mono text-xs text-muted-foreground tracking-wider max-w-xl mt-2">
          כלי פרופסיונלי למעצבי פנים ואדריכלים — יוצר פרומפטים מדויקים ל-Midjourney ב-9 מנועים מקבילים
        </p>
        <button
          onClick={() => navigate('/projects')}
          className="mt-6 border border-gold text-gold font-mono text-xs tracking-widest px-10 py-4 hover:bg-gold hover:text-obsidian transition-all duration-200"
        >
          כניסה לאפליקציה →
        </button>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-8 py-14 flex flex-col gap-16 w-full">

        {/* Problem */}
        <section>
          <h2 className="font-display text-3xl font-light text-foreground mb-4 pb-2 border-b border-border/50">הבעיה</h2>
          <p className="font-mono text-xs text-muted-foreground leading-relaxed">
            כשמעצב פנים רוצה ליצור תמונות AI עבור פרויקט, הוא צריך לכתוב פרומפטים מאפס לכל אחד מ-9 מנועים שונים —
            לוחות בסיס, חדרים ואלמנטים חיצוניים. כל פרומפט דורש הבנה עמוקה של תחביר Midjourney,
            שפת עיצוב אדריכלית, ואיזון בין סגנונות. התהליך ארוך, חוזר על עצמו, ולא עקבי בין פרויקטים.
          </p>
        </section>

        {/* Solution */}
        <section>
          <h2 className="font-display text-3xl font-light text-foreground mb-4 pb-2 border-b border-border/50">הפתרון</h2>
          <p className="font-mono text-xs text-muted-foreground leading-relaxed">
            Prompt Studio מאפשר למעצב לבחור סגנונות עיצוביים, תגיות ויזואליות ותמונת השראה —
            ומיד מייצר 9 פרומפטים מותאמים אישית המבוססים על מאגר לשוני אדריכלי מקצועי.
            המעצב מעתיק, מריץ ב-Midjourney, ומחזיר את התוצאה ישירות לכרטיס. הכל שמור, מאורגן,
            ונגיש בגלריה אחת.
          </p>
        </section>

        {/* Steps */}
        <section>
          <h2 className="font-display text-3xl font-light text-foreground mb-6 pb-2 border-b border-border/50">שלבי עבודה</h2>
          <div className="flex flex-col gap-5">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="flex gap-5 items-start border border-border bg-card p-5 hover:border-gold/30 transition-colors">
                <span className="font-display text-3xl font-light text-gold/40 leading-none mt-0.5 min-w-10">{num}</span>
                <div>
                  <p className="font-mono text-xs text-gold tracking-wider mb-1">{title}</p>
                  <p className="font-mono text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Input / Output */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section>
            <h2 className="font-display text-3xl font-light text-foreground mb-6 pb-2 border-b border-border/50">קלט</h2>
            <div className="flex flex-col gap-3">
              {INPUTS.map(({ label, desc }) => (
                <div key={label} className="border border-border bg-card p-4">
                  <p className="font-mono text-xs text-gold tracking-wider mb-1">{label}</p>
                  <p className="font-mono text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-3xl font-light text-foreground mb-6 pb-2 border-b border-border/50">פלט</h2>
            <div className="flex flex-col gap-3">
              {OUTPUTS.map(({ label, desc }) => (
                <div key={label} className="border border-border bg-card p-4">
                  <p className="font-mono text-xs text-gold tracking-wider mb-1">{label}</p>
                  <p className="font-mono text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="flex justify-center pb-4">
          <button
            onClick={() => navigate('/projects')}
            className="border border-gold text-gold font-mono text-xs tracking-widest px-14 py-4 hover:bg-gold hover:text-obsidian transition-all duration-200"
          >
            התחל עכשיו →
          </button>
        </div>
      </main>

      <footer className="border-t border-border px-8 py-4 text-center">
        <p className="font-mono text-xs text-muted-foreground tracking-widest">PROMPT STUDIO — OBSIDIAN EDITION</p>
      </footer>
    </div>
  );
}