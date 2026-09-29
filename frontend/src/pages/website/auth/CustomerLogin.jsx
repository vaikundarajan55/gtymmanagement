import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Mail, Loader2, LogIn, CircleAlert } from 'lucide-react';
import customerApi, { errorMessage } from '../../../services/customerApi';
import { setSession } from '../../../store/slices/customerSlice';
import AuthShell, { PasswordField, AuthLink, safeNext } from '../../../components/website/AuthShell';

export default function CustomerLogin() {
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const { token } = useSelector((s) => s.customer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to={next} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await customerApi.post('/customer/login', form);
      dispatch(setSession(data));
      toast.success(`Welcome back, ${data.customer.name.split(' ')[0]}!`);
      navigate(next, { replace: true });
    } catch (err) {
      toast.error(errorMessage(err, 'Could not log in'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to book classes and manage your bookings."
      footer={<>New to GymPro? <AuthLink to={`/register${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`}>Create an account</AuthLink></>}
    >
      {params.get('expired') && (
        <p className="mb-5 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          <CircleAlert className="w-4 h-4 flex-shrink-0" /> Your session expired. Please log in again.
        </p>
      )}
      <form onSubmit={submit} className="space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-slate-600">Email <span className="text-rose-500">*</span></span>
          <span className="relative block mt-1.5">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" placeholder="you@email.com" className="input-field pl-11" />
          </span>
        </label>
        <PasswordField label="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <div className="flex justify-end -mt-2">
          <Link to="/forgot-password" className="text-sm font-semibold text-cyan-700 hover:text-cyan-800">Forgot password?</Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-60">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />} {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthShell>
  );
}
