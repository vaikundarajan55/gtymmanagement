import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Send, Loader2, CircleCheck, Gift, UserCheck, CalendarDays } from 'lucide-react';
import { PROGRAMS, PLANS } from '../../data/site';
import { PageHero } from '../../components/website/SiteLayout';

const PLAN_NAMES = PLANS.map((p) => p.name);
const INTERESTS = [...PROGRAMS.map((p) => p.name), 'Personal Training', 'General Fitness'];

const PERKS = [
  { icon: Gift, title: 'Free trial session', text: 'Try the floor and a class before you pay anything.' },
  { icon: UserCheck, title: 'Free fitness assessment', text: 'Body composition, mobility and goal-setting with a coach.' },
  { icon: CalendarDays, title: 'Call back within 24 hours', text: 'Our team will confirm a time that suits you.' },
];

export default function Enquiry() {
  const [params] = useSearchParams();
  // Pre-fill from links like /enquiry?plan=Yearly or ?interest=Yoga%20Flow
  const initial = () => ({
    name: '', email: '', phone: '', message: '', source: 'Website',
    plan: PLAN_NAMES.includes(params.get('plan')) ? params.get('plan') : '',
    interest: INTERESTS.includes(params.get('interest')) ? params.get('interest') : '',
  });
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/enquiries', form);
      toast.success('Enquiry submitted! Our team will contact you within 24 hours.');
      setForm({ ...initial(), plan: '', interest: '' });
    } catch { toast.error('Failed to submit. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <PageHero title="Enquire Now" subtitle="Tell us your goal and we'll set up a free trial and assessment." image="1534438327276-14e5300c3a48" crumb="Enquiry" />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 grid gap-10 lg:grid-cols-[1fr_1.3fr] items-start">
        <div>
          <p className="section-eyebrow"><span className="w-6 h-0.5 brand-gradient rounded-full" />Join GymPro</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">What you get when you enquire</h2>
          <div className="mt-8 space-y-5">
            {PERKS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-cyan-500/30">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{text}</p>
                </div>
              </div>
            ))}
          </div>
          <ul className="mt-8 space-y-2.5">
            {['No joining fee', 'No long-term lock-in on Monthly plans', 'Women-only batches available'].map((t) => (
              <li key={t} className="flex items-center gap-2 text-slate-700 font-medium"><CircleCheck className="w-5 h-5 text-emerald-500" /> {t}</li>
            ))}
          </ul>
        </div>

        <div className="card card-accent p-7 md:p-9">
          <h2 className="text-2xl font-bold text-slate-900">Your details</h2>
          <p className="text-slate-500 text-sm mt-1 mb-6">Fields marked * are required.</p>
          <form onSubmit={handle} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <label className="block">
                <span className="text-sm font-medium text-slate-600">Full name <span className="text-rose-500">*</span></span>
                <input value={form.name} onChange={set('name')} required className="input-field mt-1.5" placeholder="Your name" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-600">Phone <span className="text-rose-500">*</span></span>
                <input type="tel" value={form.phone} onChange={set('phone')} required className="input-field mt-1.5" placeholder="+91 99999 99999" />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-slate-600">Email</span>
              <input type="email" value={form.email} onChange={set('email')} className="input-field mt-1.5" placeholder="you@email.com" />
            </label>
            <div className="grid sm:grid-cols-2 gap-5">
              <label className="block">
                <span className="text-sm font-medium text-slate-600">Area of interest</span>
                <select value={form.interest} onChange={set('interest')} className="input-field mt-1.5">
                  <option value="">Select interest...</option>
                  {INTERESTS.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-600">Preferred plan</span>
                <select value={form.plan} onChange={set('plan')} className="input-field mt-1.5">
                  <option value="">Select plan...</option>
                  {PLANS.map((p) => <option key={p.name} value={p.name}>{p.name} – ₹{p.price.toLocaleString('en-IN')}</option>)}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-slate-600">Message</span>
              <textarea value={form.message} onChange={set('message')} rows={4} className="input-field mt-1.5 resize-none" placeholder="Any goals, injuries or preferred timings?" />
            </label>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? 'Submitting...' : 'Submit Enquiry'}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
