import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Send, Clock, Loader2 } from 'lucide-react';
import { useGym } from '../../hooks/useSiteData';
import { PageHero } from '../../components/website/SiteLayout';

const EMPTY = { name: '', email: '', phone: '', subject: '', message: '' };

export default function Contact() {
  const gym = useGym();
  const CARDS = [
    { icon: Phone, label: 'Call us', value: gym.phone, href: gym.phoneHref, tone: 'from-blue-500 to-blue-700' },
    { icon: Mail, label: 'Email us', value: gym.email, href: `mailto:${gym.email}`, tone: 'from-emerald-500 to-emerald-700' },
    { icon: MapPin, label: 'Visit us', value: gym.address, tone: 'from-orange-400 to-amber-700' },
  ];
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contacts', form);
      toast.success('Message sent! We will get back to you soon.');
      setForm(EMPTY);
    } catch { toast.error('Failed to send. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <PageHero title="Contact Us" subtitle="Questions about plans, trainers or timings? We usually reply within a few hours." image="1540497077202-7c8a3999166f" />

      {/* Info cards overlapping the hero */}
      <section className="relative z-10 -mt-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid gap-5 md:grid-cols-3">
          {CARDS.map(({ icon: Icon, label, value, href, tone }) => {
            const Tag = href ? 'a' : 'div';
            return (
              <Tag key={label} href={href}
                className="flex items-center gap-4 rounded-2xl bg-white p-6 border border-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.10)] hover:-translate-y-1 transition-transform">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tone} flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
                  <p className="mt-1 font-semibold text-slate-900 break-words">{value}</p>
                </div>
              </Tag>
            );
          })}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        {/* Hours */}
        <div className="space-y-6">
          <div className="card card-accent p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-600 flex items-center justify-center shadow-md"><Clock className="w-5 h-5 text-white" /></div>
              <h2 className="text-xl font-bold text-slate-900">Opening hours</h2>
            </div>
            {gym.hours.map(([d, h]) => (
              <div key={d} className="flex justify-between text-sm py-3 border-b border-slate-100 last:border-0">
                <span className="font-medium text-slate-600">{d}</span>
                <span className="font-bold text-slate-900">{h}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-blue-700 via-cyan-600 to-emerald-600 p-7 text-white shadow-xl shadow-cyan-600/20">
            <h3 className="text-xl font-bold">Prefer to talk?</h3>
            <p className="mt-2 text-cyan-50 text-sm">Call the front desk during opening hours and we'll answer any question on the spot.</p>
            <a href={gym.phoneHref} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-blue-700 hover:bg-cyan-50">
              <Phone className="w-4 h-4" /> {gym.phone}
            </a>
          </div>
        </div>

        {/* Form */}
        <div className="card card-accent p-7 md:p-9">
          <h2 className="text-2xl font-bold text-slate-900">Send us a message</h2>
          <p className="text-slate-500 text-sm mt-1 mb-6">Fields marked * are required.</p>
          <form onSubmit={handle} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <label className="block">
                <span className="text-sm font-medium text-slate-600">Name <span className="text-rose-500">*</span></span>
                <input value={form.name} onChange={set('name')} required className="input-field mt-1.5" placeholder="Your name" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-600">Phone</span>
                <input type="tel" value={form.phone} onChange={set('phone')} className="input-field mt-1.5" placeholder="+91 99999 99999" />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-slate-600">Email <span className="text-rose-500">*</span></span>
              <input type="email" value={form.email} onChange={set('email')} required className="input-field mt-1.5" placeholder="you@email.com" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-600">Subject</span>
              <input value={form.subject} onChange={set('subject')} className="input-field mt-1.5" placeholder="How can we help?" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-600">Message <span className="text-rose-500">*</span></span>
              <textarea value={form.message} onChange={set('message')} required rows={5} className="input-field mt-1.5 resize-none" placeholder="Your message..." />
            </label>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
