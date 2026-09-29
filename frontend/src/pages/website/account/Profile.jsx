import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Save, Loader2, Mail, CalendarDays } from 'lucide-react';
import customerApi, { errorMessage } from '../../../services/customerApi';
import { setCustomer } from '../../../store/slices/customerSlice';
import { initials } from './AccountLayout';

const FIELDS = ['name', 'phone', 'gender', 'dob', 'address', 'city'];
const pick = (c) => Object.fromEntries(FIELDS.map((k) => [k, c?.[k] ?? '']));

export default function Profile() {
  const dispatch = useDispatch();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    customerApi.get('/customer/me').then(({ data }) => { setProfile(data); setForm(pick(data)); dispatch(setCustomer(data)); })
      .catch((err) => toast.error(errorMessage(err, 'Could not load your profile')));
  }, []);

  if (!form) return <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>;

  const dirty = FIELDS.some((k) => String(form[k] ?? '') !== String(profile[k] ?? ''));
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await customerApi.put('/customer/me', form);
      setProfile(data.customer);
      setForm(pick(data.customer));
      dispatch(setCustomer(data.customer));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save your profile'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6 animate-fade-in">
      <section className="card flex flex-wrap items-center gap-5">
        <div className="avatar w-20 h-20 text-2xl ring-4 ring-cyan-100">{initials(profile.name)}</div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
          <p className="text-slate-500 flex flex-wrap gap-x-4 gap-y-1 text-sm mt-1">
            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" />{profile.email}</span>
            <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4" />Member since {new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
          </p>
        </div>
      </section>

      <section className="card card-accent">
        <h2 className="text-lg font-bold text-slate-900">Personal details</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">These details are used on your bookings and invoices.</p>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-600">Full name <span className="text-rose-500">*</span></span>
            <input value={form.name} onChange={set('name')} required minLength={2} autoComplete="name" className="input-field mt-1.5" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-600">Email</span>
            <input value={profile.email} disabled className="input-field mt-1.5 bg-slate-50 text-slate-500 cursor-not-allowed" />
            <span className="mt-1 block text-xs text-slate-400">Your email is your login and can't be changed here.</span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-600">Mobile <span className="text-rose-500">*</span></span>
            <input type="tel" value={form.phone} onChange={set('phone')} required pattern="\+?[\d\s-]{10,18}" autoComplete="tel" className="input-field mt-1.5" />
          </label>
          <div className="grid grid-cols-2 gap-5">
            <label className="block">
              <span className="text-sm font-medium text-slate-600">Gender</span>
              <select value={form.gender} onChange={set('gender')} className="input-field mt-1.5">
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-600">Date of birth</span>
              <input type="date" value={form.dob} onChange={set('dob')} max={new Date().toISOString().slice(0, 10)} className="input-field mt-1.5" />
            </label>
          </div>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-600">Address (shown on invoices)</span>
            <input value={form.address} onChange={set('address')} maxLength={255} autoComplete="street-address" className="input-field mt-1.5" placeholder="House no, street, area" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-600">City</span>
            <input value={form.city} onChange={set('city')} maxLength={80} autoComplete="address-level2" className="input-field mt-1.5" />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          {dirty && <button type="button" onClick={() => setForm(pick(profile))} className="btn-secondary">Discard</button>}
          <button type="submit" disabled={saving || !dirty} className="btn-primary disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {dirty ? 'Save changes' : 'Saved'}
          </button>
        </div>
      </section>
    </form>
  );
}
