import { useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, KeyRound, ShieldCheck } from 'lucide-react';
import customerApi, { errorMessage } from '../../../services/customerApi';
import { PasswordField, PasswordRules, passwordOk } from '../../../components/website/AuthShell';

const EMPTY = { currentPassword: '', newPassword: '', confirm: '' };

export default function AccountChangePassword() {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!passwordOk(form.newPassword)) return toast.error('New password must be 8+ characters with letters and numbers');
    if (form.newPassword !== form.confirm) return toast.error('New passwords do not match');
    setSaving(true);
    try {
      const { data } = await customerApi.put('/customer/password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success(data.message);
      setForm(EMPTY);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not change your password'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card card-accent max-w-2xl animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900">Change password</h1>
      <p className="text-slate-500 text-sm mt-1">Use a password you don't use anywhere else.</p>
      <div className="mt-5 flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
        <ShieldCheck className="w-5 h-5 flex-shrink-0 text-blue-600" /> Forgot your current password? Log out and use "Forgot password" on the login page.
      </div>
      <form onSubmit={submit} className="mt-6 space-y-5">
        <PasswordField label="Current password" value={form.currentPassword} onChange={set('currentPassword')} autoComplete="current-password" />
        <PasswordField label="New password" value={form.newPassword} onChange={set('newPassword')} autoComplete="new-password" minLength={8} />
        {form.newPassword && <PasswordRules value={form.newPassword} />}
        <PasswordField label="Confirm new password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password"
          hint={form.confirm && form.confirm !== form.newPassword ? <span className="text-rose-600">Passwords do not match</span> : null} />
        <button type="submit" disabled={saving} className="btn-primary w-full py-3.5 disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />} {saving ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </section>
  );
}
