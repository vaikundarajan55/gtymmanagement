import { useEffect, useState } from 'react';
import { Building2, Phone, BookOpen, BarChart3, Save, Loader2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { invalidateGym } from '../../hooks/useSiteData';

// Single gym profile record: update only (no add/delete). Shown on the website's About, Contact and footer.
const SECTIONS = [
  {
    title: 'Gym profile', icon: Building2, tone: 'from-blue-500 to-blue-700',
    fields: [
      { name: 'name', label: 'Gym name', required: true },
      { name: 'tagline', label: 'Tagline (home page badge)' },
      { name: 'founded_year', label: 'Founded year', type: 'number', min: 1950, max: 2100 },
    ],
  },
  {
    title: 'Contact & opening hours', icon: Phone, tone: 'from-emerald-500 to-emerald-700',
    fields: [
      { name: 'phone', label: 'Phone', type: 'tel' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'address', label: 'Address', wide: true },
      { name: 'gstin', label: 'GSTIN (printed on invoices)' },
      { name: 'weekday_hours', label: 'Mon – Fri hours' },
      { name: 'saturday_hours', label: 'Saturday hours' },
      { name: 'sunday_hours', label: 'Sunday hours' },
    ],
  },
  {
    title: 'About us page', icon: BookOpen, tone: 'from-violet-500 to-purple-700',
    fields: [
      { name: 'about_heading', label: 'Story heading', wide: true },
      { name: 'about_story', label: 'Our story (leave a blank line between paragraphs)', type: 'textarea', rows: 6, wide: true },
      { name: 'mission', label: 'Our mission', type: 'textarea', rows: 3 },
      { name: 'vision', label: 'Our vision', type: 'textarea', rows: 3 },
      { name: 'core_values', label: 'Our values', type: 'textarea', rows: 3, wide: true },
    ],
  },
  {
    title: 'Headline numbers', icon: BarChart3, tone: 'from-orange-400 to-amber-700',
    fields: [
      { name: 'members_count', label: 'Active members (e.g. 500+)' },
      { name: 'trainers_count', label: 'Expert trainers (e.g. 15)' },
      { name: 'machines_count', label: 'Machines (e.g. 50+)' },
    ],
  },
];

const ALL_FIELDS = SECTIONS.flatMap((s) => s.fields.map((f) => f.name));

export default function GymDetails() {
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/gym').then(({ data }) => {
      const f = Object.fromEntries(ALL_FIELDS.map((k) => [k, data[k] ?? '']));
      setForm(f);
      setSaved({ ...f, updated_at: data.updated_at });
    }).catch(() => toast.error('Could not load gym details'));
  }, []);

  const dirty = form && saved && ALL_FIELDS.some((k) => String(form[k] ?? '') !== String(saved[k] ?? ''));
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/gym', form);
      const f = Object.fromEntries(ALL_FIELDS.map((k) => [k, data.gym[k] ?? '']));
      setForm(f);
      setSaved({ ...f, updated_at: data.gym.updated_at });
      invalidateGym();
      toast.success('Gym details updated on the website');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>;

  return (
    <form onSubmit={submit} className="space-y-6 animate-fade-in">
      <section className="card flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gym Details</h1>
          <p className="text-slate-500 text-sm mt-1">
            Your gym's master profile and About Us content. Edit and save; there is only one record.
            {saved?.updated_at && <> Last updated {new Date(saved.updated_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}.</>}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <a href="/about" target="_blank" rel="noreferrer" className="btn-secondary"><ExternalLink className="w-4 h-4" /> View About page</a>
          <button type="submit" disabled={saving || !dirty} className="btn-primary disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {dirty ? 'Update details' : 'Saved'}
          </button>
        </div>
      </section>

      {SECTIONS.map(({ title, icon: Icon, tone, fields }) => (
        <section key={title} className="card card-accent">
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tone} flex items-center justify-center shadow-md`}><Icon className="w-5 h-5 text-white" /></div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {fields.map((f) => (
              <label key={f.name} className={`block ${f.wide ? 'md:col-span-2 xl:col-span-3' : ''}`}>
                <span className="text-sm font-medium text-slate-600">{f.label}{f.required && <span className="text-rose-500"> *</span>}</span>
                {f.type === 'textarea'
                  ? <textarea value={form[f.name]} onChange={set(f.name)} rows={f.rows || 3} className="input-field mt-1.5" />
                  : <input type={f.type || 'text'} value={form[f.name]} onChange={set(f.name)} required={f.required} min={f.min} max={f.max} className="input-field mt-1.5" />}
              </label>
            ))}
          </div>
        </section>
      ))}

      <div className="flex justify-end">
        <button type="submit" disabled={saving || !dirty} className="btn-primary disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Update details
        </button>
      </div>
    </form>
  );
}
