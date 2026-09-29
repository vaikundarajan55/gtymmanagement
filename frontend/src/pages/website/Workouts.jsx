import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Timer, Flame, Gauge, Calculator, ArrowRight, CalendarCheck, Loader2 } from 'lucide-react';
import { img, PROGRAMS, CATEGORIES, LEVEL_BADGE, CATEGORY_TONE } from '../../data/site';
import { useCatalog, inr } from '../../hooks/useSiteData';
import { PageHero, SectionHeading, CtaBand } from '../../components/website/SiteLayout';
import ProgramCard from '../../components/website/ProgramCard';

function RoutineModal({ program: p, price, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl animate-slide-up" onMouseDown={(e) => e.stopPropagation()}>
        <div className="relative h-48 bg-slate-200">
          <img src={img(p.image, 900)} alt={p.name} className="h-full w-full object-cover rounded-t-3xl" />
          <div className="absolute inset-0 rounded-t-3xl bg-gradient-to-t from-slate-950/80 to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white" aria-label="Close">
            <X className="w-5 h-5 text-slate-700" />
          </button>
          <div className="absolute bottom-4 left-6">
            <span className={`${LEVEL_BADGE[p.level]} normal-case`}>{p.level}</span>
            <h3 className="mt-2 text-2xl font-bold text-white">{p.name}</h3>
          </div>
        </div>
        <div className="p-6">
          <p className="text-slate-600">{p.summary}</p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[[Timer, `${p.duration} min`, 'Duration'], [Flame, `~${p.calories}`, 'kcal burned'], [Gauge, p.category, 'Focus']].map(([Icon, v, l]) => (
              <div key={l} className="rounded-2xl bg-[#f4f7fb] border border-slate-200 p-3 text-center">
                <Icon className="w-5 h-5 mx-auto text-cyan-600" />
                <p className="mt-1 font-bold text-slate-900">{v}</p>
                <p className="text-xs text-slate-500">{l}</p>
              </div>
            ))}
          </div>
          <h4 className="mt-6 mb-3 font-bold text-slate-900">Sample routine</h4>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead><tr className="th-gradient"><th className="th-cell">S. No</th><th className="th-cell">Exercise</th><th className="th-cell text-right">Sets × Reps</th></tr></thead>
              <tbody>
                {p.exercises.map(([name, reps], i) => (
                  <tr key={name} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-bold text-slate-900">{String(i + 1).padStart(2, '0')}</td>
                    <td className="px-5 py-3 text-slate-700">{name}</td>
                    <td className="px-5 py-3 text-right"><span className="badge-info normal-case">{reps}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-slate-400">Warm up for 5–10 minutes first. A coach will adjust weights and volume to your level.</p>
          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            <Link to={`/book?class=${p.slug}`} className="btn-primary py-3">
              <CalendarCheck className="w-4 h-4" /> Book a session{price != null ? ` · ${inr(price)}` : ''}
            </Link>
            <Link to={`/enquiry?interest=${encodeURIComponent(p.name)}`} className="btn-secondary py-3">
              Ask a coach <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function BmiCalculator() {
  const [h, setH] = useState('');
  const [w, setW] = useState('');
  const bmi = h > 0 && w > 0 ? w / ((h / 100) ** 2) : null;
  const band = bmi == null ? null
    : bmi < 18.5 ? ['Underweight', 'badge-info', 'Strength + nutrition plans help build healthy mass.']
    : bmi < 25 ? ['Healthy', 'badge-success', 'Great! Maintain it with a balanced mix of strength and cardio.']
    : bmi < 30 ? ['Overweight', 'badge-warn', 'HIIT and strength training together are the fastest route down.']
    : ['Obese', 'badge-danger', 'Start with low-impact cardio and a coach-led plan.'];

  return (
    <div className="card card-accent p-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg"><Calculator className="w-6 h-6 text-white" /></div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">BMI calculator</h3>
          <p className="text-sm text-slate-500">Find a sensible starting point</p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-600">Height (cm)</span>
          <input type="number" min="50" max="250" value={h} onChange={(e) => setH(e.target.value)} className="input-field mt-1.5" placeholder="170" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-600">Weight (kg)</span>
          <input type="number" min="20" max="300" value={w} onChange={(e) => setW(e.target.value)} className="input-field mt-1.5" placeholder="70" />
        </label>
      </div>
      <div className="mt-6 rounded-2xl bg-[#f4f7fb] border border-slate-200 p-5 min-h-[112px]">
        {bmi ? (
          <>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-slate-900 font-[Space_Grotesk]">{bmi.toFixed(1)}</span>
              <span className={band[1]}>{band[0]}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{band[2]}</p>
          </>
        ) : (
          <p className="text-sm text-slate-500">Enter your height and weight to see your BMI.</p>
        )}
      </div>
    </div>
  );
}

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const slotMinutes = (s) => {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(s);
  return m ? ((+m[1] % 12) + (m[3].toUpperCase() === 'PM' ? 12 : 0)) * 60 + +m[2] : 0;
};

// Weekly grid (time rows × day columns) built from the live class schedule
const buildTimetable = (classes) => {
  const days = DAY_ORDER.filter((d) => classes.some((c) => c.days.includes(d)));
  const times = [...new Set(classes.flatMap((c) => c.time_slots))].sort((a, b) => slotMinutes(a) - slotMinutes(b));
  const rows = times.map((t) => [t, days.map((d) => classes.filter((c) => c.days.includes(d) && c.time_slots.includes(t)))]);
  return { days, rows };
};

export default function Workouts() {
  const catalog = useCatalog();
  const timetable = buildTimetable(catalog.classes);
  const priceOf = (slug) => catalog.classes.find((c) => c.slug === slug)?.price;
  const [category, setCategory] = useState('All');
  const [open, setOpen] = useState(null);
  const { hash } = useLocation();

  // Deep links from the footer / home page: /workouts#hiit
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    return () => clearTimeout(t);
  }, [hash]);

  const shown = category === 'All' ? PROGRAMS : PROGRAMS.filter((p) => p.category === category);

  return (
    <>
      <PageHero title="Gym Workouts" subtitle="Programs for every goal and every level. Pick one to see a sample routine." image="1574680096145-d05b474e2155" crumb="Workouts" />

      {/* Programs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <SectionHeading eyebrow="Programs" title="Choose your workout" />
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all
                ${category === c ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/30' : 'bg-white border border-slate-200 text-slate-600 hover:border-cyan-400 hover:text-cyan-700'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((p) => <ProgramCard key={p.slug} p={p} onOpen={setOpen} />)}
        </div>
      </section>

      {/* Schedule */}
      <section className="bg-[#f4f7fb] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeading eyebrow="Timetable" title="Weekly class schedule" subtitle="Click any class to book a spot. Group classes are included with Quarterly plans and above." />
          {catalog.loading ? (
            <div className="mt-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>
          ) : timetable.rows.length === 0 ? (
            <p className="mt-12 text-center text-slate-500">{catalog.error || 'No classes scheduled right now.'}</p>
          ) : (
            <div className="mt-12 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm min-w-[760px]">
                <thead>
                  <tr className="th-gradient">
                    <th className="th-cell">Time</th>
                    {timetable.days.map((d) => <th key={d} className="th-cell text-center">{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {timetable.rows.map(([time, cells]) => (
                    <tr key={time} className="border-t border-slate-100 hover:bg-cyan-50/40">
                      <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">{time}</td>
                      {cells.map((list, i) => (
                        <td key={i} className="px-3 py-4 text-center">
                          {list.length ? (
                            <div className="flex flex-col items-center gap-1.5">
                              {list.map((c) => (
                                <Link key={c.id} to={`/book?class=${c.slug}`} title={`Book ${c.name} · ${inr(c.price)}`}
                                  className={`${CATEGORY_TONE[c.category] || 'badge-neutral'} normal-case hover:shadow-md transition-shadow`}>
                                  {c.name}
                                </Link>
                              ))}
                            </div>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* BMI + tips */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 grid gap-10 lg:grid-cols-2 items-start">
        <BmiCalculator />
        <div>
          <SectionHeading center={false} eyebrow="Training tips" title="Get more from every session" />
          <ol className="mt-8 space-y-5">
            {[
              ['Warm up properly', '5–10 minutes of light cardio and mobility cuts injury risk sharply.'],
              ['Progress gradually', 'Add a little weight or a few reps each week. Consistency beats intensity.'],
              ['Recover like you train', '7–8 hours of sleep and a protein-rich diet are where muscle is built.'],
              ['Track your workouts', 'Log sets and reps so you and your coach can see what’s working.'],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white font-bold flex items-center justify-center shadow-md shadow-cyan-500/30">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-bold text-slate-900">{t}</h3>
                  <p className="text-sm text-slate-500 mt-1">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CtaBand />
      {open && <RoutineModal program={open} price={priceOf(open.slug)} onClose={() => setOpen(null)} />}
    </>
  );
}
