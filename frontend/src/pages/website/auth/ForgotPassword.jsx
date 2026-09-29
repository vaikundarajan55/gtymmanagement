import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Loader2, Send, MailCheck, FlaskConical, ArrowLeft } from 'lucide-react';
import customerApi, { errorMessage } from '../../../services/customerApi';
import AuthShell, { AuthLink } from '../../../components/website/AuthShell';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await customerApi.post('/customer/forgot-password', { email });
      setSent(data);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // In development the API returns the reset link because no mail server is configured
  const devPath = sent?.devResetUrl ? new URL(sent.devResetUrl).pathname : null;

  return (
    <AuthShell
      title="Forgot password?"
      subtitle="Enter the email you registered with and we'll send you a reset link."
      image="1540497077202-7c8a3999166f"
      footer={<>Remembered it? <AuthLink to="/login">Back to login</AuthLink></>}
    >
      {sent ? (
        <div className="space-y-5">
          <div className="flex gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-5">
            <MailCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <p className="text-sm text-emerald-800">{sent.message}</p>
          </div>
          {devPath && (
            <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-5">
              <p className="flex items-center gap-2 font-bold text-amber-900"><FlaskConical className="w-4 h-4" /> Development mode</p>
              <p className="mt-1 text-sm text-amber-800">Email isn't configured yet, so here is the reset link (it's also printed in the backend console):</p>
              <Link to={devPath} className="btn-primary mt-4 w-full">Open reset link</Link>
            </div>
          )}
          <button onClick={() => setSent(null)} className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700"><ArrowLeft className="w-4 h-4" /> Use a different email</button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-600">Email <span className="text-rose-500">*</span></span>
            <span className="relative block mt-1.5">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="you@email.com" className="input-field pl-11" />
            </span>
          </label>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
