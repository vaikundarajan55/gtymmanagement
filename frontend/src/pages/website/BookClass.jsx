import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Timer, Users, Minus, Plus, ShoppingCart, ArrowRight, Loader2, Check, Star, UserRound } from 'lucide-react';
import api from '../../services/api';
import { img, PROGRAMS, PLANS, LEVEL_BADGE } from '../../data/site';
import { useCatalog, useSiteUpdate, inr } from '../../hooks/useSiteData';
import { addItem, MAX_PEOPLE } from '../../store/slices/cartSlice';
import { PageHero } from '../../components/website/SiteLayout';
import { PaymentsOffNotice } from '../../components/website/OrderSummary';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const slotMinutes = (s) => {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(s);
  return m ? ((+m[1] % 12) + (m[3].toUpperCase() === 'PM' ? 12 : 0)) * 60 + +m[2] : 0;
};
const SEAT_EVENTS = ['availability'];
const imageFor = (slug) => PROGRAMS.find((p) => p.slug === slug)?.image || '1534438327276-14e5300c3a48';

// Upcoming dates (max 14 shown) on which the class runs
const upcomingDates = (cls, maxDaysAhead) => {
  const out = [];
  const now = new Date();
  for (let i = 0; i <= maxDaysAhead && out.length < 14; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    if (cls.days.includes(DAY_NAMES[d.getDay()])) out.push(d);
  }
  return out;
};

export default function BookClass() {
  const { loading, error, classes, maxDaysAhead, paymentsEnabled } = useCatalog();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'plans' ? 'plans' : 'classes';
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedId, setSelectedId] = useState(null);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [qty, setQty] = useState(1);
  const [spots, setSpots] = useState({});
  const [spotsLoading, setSpotsLoading] = useState(false);

  // Preselect from ?class=slug, else the first class (also when the admin hides the selected class)
  useEffect(() => {
    if (!classes.length || classes.some((c) => c.id === selectedId)) return;
    const wanted = classes.find((c) => c.slug === params.get('class'));
    setSelectedId((wanted || classes[0]).id);
  }, [classes]);

  const cls = classes.find((c) => c.id === selectedId);

  // On phones the class row scrolls sideways: bring the selected card into view (horizontally only)
  const pickerRef = useRef(null);
  useEffect(() => {
    const row = pickerRef.current;
    const card = row?.querySelector('[aria-pressed="true"]');
    if (row && card && row.scrollWidth > row.clientWidth) row.scrollTo({ left: card.offsetLeft - row.offsetLeft - 16, behavior: 'smooth' });
  }, [selectedId]);
  const dates = useMemo(() => (cls ? upcomingDates(cls, maxDaysAhead) : []), [cls, maxDaysAhead]);

  // New class: start from its first date. Live schedule edits keep the chosen date/time while still valid.
  const dateKeys = dates.map(ymd).join(',');
  useEffect(() => { setDate(dates[0] ? ymd(dates[0]) : null); setTime(null); setQty(1); }, [cls?.id]);
  useEffect(() => { setDate((d) => (d && dateKeys.split(',').includes(d) ? d : dates[0] ? ymd(dates[0]) : null)); }, [dateKeys]);
  useEffect(() => { setTime(null); }, [date]);
  useEffect(() => { if (time && cls && !cls.time_slots.includes(time)) setTime(null); }, [cls?.time_slots.join(',')]);

  // Seats left; re-fetched live when someone books or an admin changes capacity
  const [seatsVersion, setSeatsVersion] = useState(0);
  const bumpSeats = useCallback(() => setSeatsVersion((v) => v + 1), []);
  useSiteUpdate(SEAT_EVENTS, bumpSeats);
  const seatsFor = useRef(null);
  useEffect(() => {
    if (!cls || !date) return;
    let alive = true;
    // Spinner only when the session changes, not on silent live refreshes
    if (seatsFor.current !== `${cls.id}|${date}`) setSpotsLoading(true);
    seatsFor.current = `${cls.id}|${date}`;
    api.get(`/classes/${cls.id}/availability`, { params: { date } })
      .then(({ data }) => alive && setSpots(data))
      .catch(() => alive && setSpots({}))
      .finally(() => alive && setSpotsLoading(false));
    return () => { alive = false; };
  }, [cls?.id, date, cls?.capacity, seatsVersion]);

  // If the chosen session fills up (or shrinks) while the customer is deciding, adjust
  useEffect(() => {
    if (!time || spotsLoading || spots[time] == null) return;
    if (spots[time] <= 0) { setTime(null); toast.error(`${time} just filled up. Please pick another time.`); }
    else setQty((q) => Math.min(q, spots[time]));
  }, [spots]);

  const now = new Date();
  const slotPassed = (s) => date === ymd(now) && slotMinutes(s) <= now.getHours() * 60 + now.getMinutes();
  const left = time ? spots[time] ?? cls?.capacity : null;

  const add = (goToCart) => {
    if (!cls || !date || !time) return toast.error('Pick a date and time first');
    dispatch(addItem({ type: 'class', classId: cls.id, slug: cls.slug, name: cls.name, date, time, qty, price: cls.price }));
    toast.success(`${cls.name} added to cart`);
    if (goToCart) navigate('/cart');
  };

  const addPlan = (plan, price) => {
    dispatch(addItem({ type: 'plan', plan, name: `${plan} Membership`, price }));
    toast.success(`${plan} membership added to cart`);
    navigate('/cart');
  };

  const switchTab = (t) => setParams(t === 'plans' ? { tab: 'plans' } : {}, { replace: true });

  return (
    <>
      <PageHero title="Book a Class" subtitle="Reserve your spot in a session or buy a membership online, in under a minute." image="1571019613454-1cb2f99b2d8b" crumb="Book a Class" />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="inline-flex rounded-2xl bg-slate-100 p-1.5">
            {[['classes', 'Class sessions'], ['plans', 'Memberships']].map(([k, l]) => (
              <button key={k} onClick={() => switchTab(k)}
                className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${tab === k ? 'bg-white text-blue-700 shadow' : 'text-slate-500 hover:text-slate-800'}`}>
                {l}
              </button>
            ))}
          </div>
          <Link to="/cart" className="btn-secondary"><ShoppingCart className="w-4 h-4" /> View cart</Link>
        </div>

        {!loading && !paymentsEnabled && <div className="mb-8"><PaymentsOffNotice /></div>}

        {loading ? (
          <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>
        ) : error ? (
          <p className="py-24 text-center text-rose-600">{error}</p>
        ) : tab === 'plans' ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((p) => (
              <div key={p.name} className={`relative rounded-3xl p-7 flex flex-col ${p.popular ? 'bg-gradient-to-br from-blue-700 via-cyan-600 to-emerald-600 text-white shadow-2xl shadow-cyan-600/30' : 'bg-white border border-slate-200 shadow-sm'}`}>
                {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-900"><Star className="w-3 h-3 fill-current" /> Best value</span>}
                <h3 className={`text-lg font-bold ${p.popular ? '' : 'text-slate-900'}`}>{p.name}</h3>
                <p className="mt-4"><span className="text-4xl font-bold font-[Space_Grotesk]">{inr(p.price)}</span><span className={`text-sm ${p.popular ? 'text-cyan-100' : 'text-slate-500'}`}> / {p.period}</span></p>
                <ul className="mt-6 space-y-3 flex-1">
                  {p.features.map((f) => <li key={f} className={`flex gap-2 text-sm ${p.popular ? 'text-cyan-50' : 'text-slate-600'}`}><Check className={`w-4 h-4 mt-0.5 ${p.popular ? '' : 'text-emerald-500'}`} />{f}</li>)}
                </ul>
                <button onClick={() => addPlan(p.name, p.price)}
                  className={`mt-8 ${p.popular ? 'inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-blue-700 hover:bg-cyan-50' : 'btn-primary'}`}>
                  <ShoppingCart className="w-4 h-4" /> Buy {p.name}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_420px] items-start">
            {/* Class picker (min-w-0 lets the swipe row scroll instead of widening the grid) */}
            <div className="min-w-0">
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h2 className="text-xl font-bold text-slate-900">1. Choose a class</h2>
                <span className="sm:hidden text-xs font-medium text-slate-400">Swipe for all {classes.length} →</span>
              </div>
              {/* Phones: one swipeable row so the date/time picker stays close. Larger screens: grid */}
              <div ref={pickerRef} className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-2 sm:grid sm:gap-4 sm:grid-cols-2 sm:overflow-visible sm:mx-0 sm:px-0 sm:pb-0">
                {classes.map((c) => {
                  const active = c.id === selectedId;
                  return (
                    <button key={c.id} onClick={() => setSelectedId(c.id)} aria-pressed={active}
                      className={`text-left flex gap-4 min-w-[85%] sm:min-w-0 snap-start rounded-2xl border-2 bg-white p-3 transition-all ${active ? 'border-cyan-500 shadow-lg shadow-cyan-500/15' : 'border-slate-200 hover:border-cyan-300'}`}>
                      <img src={img(imageFor(c.slug), 240)} alt="" className="w-24 h-24 rounded-xl object-cover bg-slate-200 flex-shrink-0" />
                      <div className="min-w-0 py-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-900">{c.name}</p>
                          {active && <span className="w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center"><Check className="w-3 h-3" /></span>}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{c.days.join(' · ')}</p>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <span className="text-lg font-bold text-blue-700">{inr(c.price)}</span>
                          <span className="text-xs text-slate-400">/ person</span>
                          <span className={`${LEVEL_BADGE[c.level] || 'badge-neutral'} normal-case`}>{c.level}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Session picker */}
            {cls && (
              <div className="card card-accent p-6 lg:sticky lg:top-28">
                <img src={img(imageFor(cls.slug), 800)} alt={cls.name} className="w-full h-36 object-cover rounded-2xl bg-slate-200" />
                <h3 className="mt-4 text-xl font-bold text-slate-900">{cls.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{cls.description}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5"><Timer className="w-4 h-4 text-cyan-600" />{cls.duration_min} min</span>
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-cyan-600" />Max {cls.capacity}</span>
                  {cls.trainer_name && <span className="flex items-center gap-1.5"><UserRound className="w-4 h-4 text-cyan-600" />{cls.trainer_name}</span>}
                </div>

                <h4 className="mt-6 mb-2 text-sm font-bold text-slate-900">2. Pick a date</h4>
                {dates.length === 0 ? <p className="text-sm text-slate-500">No upcoming sessions.</p> : (
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                    {dates.map((d) => {
                      const v = ymd(d);
                      const on = v === date;
                      return (
                        <button key={v} onClick={() => setDate(v)}
                          className={`flex-shrink-0 w-16 rounded-xl border-2 py-2 text-center transition-all ${on ? 'border-transparent bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md' : 'border-slate-200 bg-white hover:border-cyan-300'}`}>
                          <span className={`block text-[11px] font-bold uppercase ${on ? 'text-cyan-50' : 'text-slate-400'}`}>{DAY_NAMES[d.getDay()]}</span>
                          <span className="block text-lg font-bold">{d.getDate()}</span>
                          <span className={`block text-[11px] ${on ? 'text-cyan-50' : 'text-slate-500'}`}>{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <h4 className="mt-5 mb-2 text-sm font-bold text-slate-900">3. Pick a time</h4>
                <div className="grid grid-cols-2 gap-2">
                  {cls.time_slots.map((s) => {
                    const free = spots[s] ?? cls.capacity;
                    const disabled = spotsLoading || free <= 0 || slotPassed(s);
                    const on = s === time;
                    return (
                      <button key={s} disabled={disabled} onClick={() => { setTime(s); setQty((q) => Math.max(1, Math.min(q, free))); }}
                        className={`rounded-xl border-2 px-3 py-2.5 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed
                          ${on ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200 bg-white hover:border-cyan-300'}`}>
                        <span className="block font-bold text-slate-900">{s}</span>
                        <span className={`block text-xs ${free <= 3 && free > 0 ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                          {slotPassed(s) ? 'Started' : free <= 0 ? 'Full' : spotsLoading ? 'Checking…' : `${free} spots left`}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <h4 className="mt-5 mb-2 text-sm font-bold text-slate-900">4. Number of people</h4>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center rounded-xl border border-slate-200">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-cyan-700" aria-label="Fewer people"><Minus className="w-4 h-4" /></button>
                    <span className="w-10 text-center font-bold text-slate-900">{qty}</span>
                    <button onClick={() => setQty(Math.min(MAX_PEOPLE, left ?? MAX_PEOPLE, qty + 1))} className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-cyan-700" aria-label="More people"><Plus className="w-4 h-4" /></button>
                  </div>
                  <p className="text-right">
                    <span className="block text-xs text-slate-500">{qty} × {inr(cls.price)}</span>
                    <span className="text-2xl font-bold text-slate-900 font-[Space_Grotesk]">{inr(cls.price * qty)}</span>
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button onClick={() => add(false)} disabled={!time} className="btn-secondary disabled:opacity-50"><ShoppingCart className="w-4 h-4" /> Add to cart</button>
                  <button onClick={() => add(true)} disabled={!time} className="btn-primary disabled:opacity-50">Book now <ArrowRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}
