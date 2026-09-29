import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { addItem } from '../../store/slices/cartSlice';
import { useGym } from '../../hooks/useSiteData';
import {
  ArrowRight, Dumbbell, Award, Clock, Salad, CircleCheck, Star, Quote, Check
} from 'lucide-react';
import { img, IMAGES, PROGRAMS, PLANS, TESTIMONIALS } from '../../data/site';
import ProgramCard from '../../components/website/ProgramCard';
import HeroSlider from '../../components/website/HeroSlider';
import { SectionHeading, CtaBand } from '../../components/website/SiteLayout';

const FEATURES = [
  { icon: Dumbbell, title: 'Modern Equipment', text: '50+ premium machines, free weights and a dedicated functional zone.', tone: 'from-blue-500 to-blue-700' },
  { icon: Award, title: 'Certified Trainers', text: 'Coaches with 5–10 years of experience who build plans around you.', tone: 'from-emerald-500 to-emerald-700' },
  { icon: Clock, title: 'Flexible Timings', text: 'Open from 5 AM to 11 PM on weekdays, so you train when it suits you.', tone: 'from-orange-400 to-amber-700' },
  { icon: Salad, title: 'Diet & Nutrition', text: 'Personalised meal guidance to match your training goals.', tone: 'from-violet-500 to-purple-700' },
];

export default function Home() {
  const gym = useGym();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const buyPlan = (p) => {
    dispatch(addItem({ type: 'plan', plan: p.name, name: `${p.name} Membership`, price: p.price }));
    toast.success(`${p.name} membership added to cart`);
    navigate('/cart');
  };
  return (
    <>
      <HeroSlider />

      {/* Stats overlapping hero */}
      <section className="relative z-10 -mt-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 rounded-3xl bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)] border border-slate-100 overflow-hidden">
          {gym.stats.map(([v, l], i) => (
            <div key={l} className={`px-6 py-8 text-center ${i % 2 ? 'border-l' : ''} ${i > 1 ? 'border-t lg:border-t-0' : ''} lg:border-l first:border-l-0 border-slate-100`}>
              <p className="text-4xl md:text-5xl font-bold text-gradient font-[Space_Grotesk]">{v}</p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-slate-500">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <SectionHeading eyebrow="Why GymPro" title="Everything you need to reach your goal" subtitle="One membership, every tool: equipment, coaching, classes and nutrition under one roof." />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text, tone }) => (
            <div key={title} className="group rounded-2xl border border-slate-200 bg-white p-7 hover:border-cyan-300 hover:shadow-xl transition-all duration-300">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tone} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Programs */}
      <section className="bg-[#f4f7fb] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading center={false} eyebrow="Workouts" title="Popular programs" subtitle="Structured workouts for every level, each with a sample routine." />
            <Link to="/workouts" className="btn-secondary">All workouts <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROGRAMS.slice(0, 6).map((p) => <ProgramCard key={p.slug} p={p} />)}
          </div>
        </div>
      </section>

      {/* About teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24 grid gap-14 lg:grid-cols-2 items-center">
        <div className="relative">
          <img src={img(IMAGES.interior, 1000)} alt="GymPro training floor" loading="lazy" className="rounded-3xl shadow-2xl w-full h-[420px] object-cover bg-slate-200" />
          <div className="absolute -bottom-8 -right-4 sm:right-8 rounded-2xl bg-white p-5 shadow-xl border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 font-[Space_Grotesk]">5+ years</p>
              <p className="text-sm text-slate-500">of transformations</p>
            </div>
          </div>
        </div>
        <div>
          <SectionHeading center={false} eyebrow="About us" title="More than a gym. A community." />
          <p className="mt-5 text-slate-600 leading-relaxed">
            GymPro started with one idea: fitness should be guided, not guessed. Every member gets an assessment, a plan and a coach who checks in, so progress is measured, not hoped for.
          </p>
          <ul className="mt-6 grid sm:grid-cols-2 gap-3">
            {['Free fitness assessment', 'Personalised workout plans', 'Clean, air-conditioned floor', 'Women-friendly batches'].map((t) => (
              <li key={t} className="flex items-center gap-2 text-slate-700 font-medium">
                <CircleCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" /> {t}
              </li>
            ))}
          </ul>
          <Link to="/about" className="btn-primary mt-8">Learn more about us <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="bg-[#f4f7fb] py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeading eyebrow="Membership" title="Simple, honest pricing" subtitle="No joining fee. No hidden charges. Pick a plan and start this week." />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((p) => (
              <div key={p.name}
                className={`relative rounded-3xl p-7 flex flex-col transition-all duration-300 hover:-translate-y-1
                  ${p.popular ? 'bg-gradient-to-br from-blue-700 via-cyan-600 to-emerald-600 text-white shadow-2xl shadow-cyan-600/30' : 'bg-white border border-slate-200 shadow-sm hover:shadow-xl'}`}>
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-900 shadow">
                    <Star className="w-3 h-3 fill-current" /> Best value
                  </span>
                )}
                <h3 className={`text-lg font-bold ${p.popular ? 'text-white' : 'text-slate-900'}`}>{p.name}</h3>
                <p className="mt-4">
                  <span className="text-4xl font-bold font-[Space_Grotesk]">₹{p.price.toLocaleString('en-IN')}</span>
                  <span className={`text-sm ${p.popular ? 'text-cyan-100' : 'text-slate-500'}`}> / {p.period}</span>
                </p>
                <ul className="mt-6 space-y-3 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${p.popular ? 'text-cyan-50' : 'text-slate-600'}`}>
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${p.popular ? 'text-white' : 'text-emerald-500'}`} /> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => buyPlan(p)}
                  className={`mt-8 ${p.popular ? 'inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 font-bold text-blue-700 hover:bg-cyan-50' : 'btn-secondary'}`}>
                  Buy {p.name}
                </button>
                <Link to={`/enquiry?plan=${encodeURIComponent(p.name)}`} className={`mt-3 text-center text-xs font-semibold ${p.popular ? 'text-cyan-50 hover:text-white' : 'text-slate-500 hover:text-cyan-700'}`}>
                  or enquire first
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <SectionHeading eyebrow="Testimonials" title="Results our members talk about" />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-lg transition-shadow">
              <Quote className="w-8 h-8 text-cyan-500" />
              <div className="mt-3 flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <blockquote className="mt-4 text-slate-700 leading-relaxed">“{t.quote}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div className="avatar w-11 h-11">{t.name[0]}</div>
                <div>
                  <p className="font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.since}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
