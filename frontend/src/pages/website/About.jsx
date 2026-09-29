import { Target, Eye, HeartHandshake, Dumbbell, HeartPulse, Flower2, ShowerHead, Car, Salad, CircleCheck } from 'lucide-react';
import { img, IMAGES } from '../../data/site';
import { useGym, useTeam } from '../../hooks/useSiteData';
import { PageHero, SectionHeading, CtaBand } from '../../components/website/SiteLayout';

// Text comes from Admin → Gym Details; `text` is the fallback
const PILLARS = [
  { key: 'mission', icon: Target, title: 'Our Mission', text: 'Make expert-guided fitness affordable and approachable for everyone in the neighbourhood.', tone: 'from-blue-500 to-blue-700' },
  { key: 'vision', icon: Eye, title: 'Our Vision', text: 'To be the most trusted fitness community in Chennai, measured by member results, not member count.', tone: 'from-emerald-500 to-emerald-700' },
  { key: 'core_values', icon: HeartHandshake, title: 'Our Values', text: 'Honest coaching, clean facilities, safe training and respect for every body type and goal.', tone: 'from-orange-400 to-amber-700' },
];

const FACILITIES = [
  { icon: Dumbbell, title: 'Free Weights Zone', text: 'Dumbbells to 50 kg, Olympic bars, racks and platforms.' },
  { icon: HeartPulse, title: 'Cardio Deck', text: 'Treadmills, bikes, cross-trainers and rowers.' },
  { icon: Flower2, title: 'Yoga & Group Studio', text: 'Sprung floor studio for yoga, Zumba and HIIT.' },
  { icon: Salad, title: 'Nutrition Desk', text: 'Diet consultations and a supplement counter.' },
  { icon: ShowerHead, title: 'Lockers & Showers', text: 'Separate, clean changing rooms with lockers.' },
  { icon: Car, title: 'Free Parking', text: 'Two-wheeler and car parking on site.' },
];

const initials = (n) => n.split(/s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
const TEAM_TONES = ['from-blue-600 to-cyan-500', 'from-violet-500 to-fuchsia-500', 'from-emerald-500 to-teal-600', 'from-orange-400 to-rose-500'];

const DEFAULT_STORY = [
  'GymPro opened with a handful of machines and a simple promise: every member would get a plan and a coach who cares whether it works.',
  "Whether you're stepping into a gym for the first time or chasing a new personal record, our team meets you where you are and moves you forward.",
];

export default function About() {
  const gym = useGym();
  // Active trainers from Admin → Trainers; updates live when the admin adds or edits one
  const team = useTeam();
  const story = gym.about_story ? gym.about_story.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) : DEFAULT_STORY;
  return (
    <>
      <PageHero title={`About ${gym.name}`} subtitle={`Coaching-first fitness${gym.founded_year ? ` since ${gym.founded_year}` : ''}. Here's who we are and what we stand for.`} image={IMAGES.floor} crumb="About" />

      {/* Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24 grid gap-14 lg:grid-cols-2 items-center">
        <div className="grid grid-cols-2 gap-4">
          <img src={img(IMAGES.interior, 700)} alt="Training floor" loading="lazy" className="rounded-3xl h-80 w-full object-cover shadow-xl bg-slate-200" />
          <img src={img(IMAGES.dumbbells, 700)} alt="Dumbbell rack" loading="lazy" className="rounded-3xl h-80 w-full object-cover shadow-xl mt-12 bg-slate-200" />
        </div>
        <div>
          <SectionHeading center={false} eyebrow="Our story" title={gym.about_heading || 'Built by trainers, for people who want real results'} />
          {story.map((p, i) => <p key={i} className={`${i ? 'mt-4' : 'mt-5'} text-slate-600 leading-relaxed whitespace-pre-line`}>{p}</p>)}
          <ul className="mt-6 space-y-3">
            {['Free assessment and goal-setting on day one', 'Progress reviews every month', 'Batches for women, seniors and beginners'].map((t) => (
              <li key={t} className="flex items-center gap-2 text-slate-700 font-medium">
                <CircleCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Stats strip */}
      <section className="brand-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {gym.stats.map(([v, l]) => (
            <div key={l}>
              <p className="text-4xl md:text-5xl font-bold text-white font-[Space_Grotesk]">{v}</p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-cyan-50">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission / vision / values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <SectionHeading eyebrow="What drives us" title="Mission, vision & values" />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PILLARS.map(({ key, icon: Icon, title, text, tone }) => (
            <div key={title} className="card card-accent p-8 hover:shadow-xl transition-shadow">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tone} flex items-center justify-center shadow-lg`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-slate-500 leading-relaxed">{gym[key] || text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Facilities */}
      <section className="bg-[#f4f7fb] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeading eyebrow="Facilities" title="Everything under one roof" subtitle="A clean, air-conditioned floor designed for every kind of training." />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FACILITIES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4 rounded-2xl bg-white border border-slate-200 p-6 hover:border-cyan-300 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-cyan-500/30">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      {(team.loading || team.items.length > 0) && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <SectionHeading eyebrow="Our coaches" title="Meet the team" subtitle="Certified trainers with decades of combined experience." />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.loading && [0, 1, 2, 3].map((i) => <div key={i} className="h-64 rounded-3xl bg-slate-100 animate-pulse" />)}
          {team.items.map((t, i) => (
            <div key={t.id} className="group rounded-3xl border border-slate-200 bg-white p-7 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className={`mx-auto w-24 h-24 rounded-full bg-gradient-to-br ${TEAM_TONES[i % 4]} flex items-center justify-center text-3xl font-bold text-white shadow-xl ring-4 ring-white`}>
                {initials(t.name)}
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{t.name}</h3>
              {t.specialization && <p className="mt-1 text-sm font-semibold text-cyan-600">{t.specialization}</p>}
              {t.experience > 0 && <span className="mt-4 badge-neutral normal-case">{t.experience} year{t.experience === 1 ? '' : 's'} experience</span>}
            </div>
          ))}
        </div>
      </section>
      )}

      <CtaBand />
    </>
  );
}
