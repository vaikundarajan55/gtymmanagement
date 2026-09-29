import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Mail, Phone, User, Loader2, UserPlus } from 'lucide-react';
import customerApi, { errorMessage } from '../../../services/customerApi';
import { setSession } from '../../../store/slices/customerSlice';
import AuthShell, { PasswordField, PasswordRules, passwordOk, AuthLink, safeNext } from '../../../components/website/AuthShell';

const Field = ({ icon: Icon, label, ...props }) => (
  <label className="block">
    <span className="text-sm font-medium text-slate-600">{label} <span className="text-rose-500">*</span></span>
    <span className="relative block mt-1.5">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input required className="input-field pl-11" {...props} />
    </span>
  </label>
);

export default function CustomerRegister() {
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const { token } = useSelector((s) => s.customer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (token) return <Navigate to={next} replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!passwordOk(form.password)) return toast.error('Password must be 8+ characters with letters and numbers');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (!agree) return toast.error('Please accept the terms to continue');
    setLoading(true);
    try {
      const { name, email, phone, password } = form;
      const { data } = await customerApi.post('/customer/register', { name, email, phone, password });
      dispatch(setSession(data));
      toast.success('Account created. Welcome to GymPro!');
      navigate(next, { replace: true });
    } catch (err) {
      toast.error(errorMessage(err, 'Could not create your account'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="It takes less than a minute."
      image="1571019613454-1cb2f99b2d8b"
      footer={<>Already have an account? <AuthLink to={`/login${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`}>Log in</AuthLink></>}
    >
      <form onSubmit={submit} className="space-y-5">
        <Field icon={User} label="Full name" value={form.name} onChange={set('name')} minLength={2} autoComplete="name" placeholder="Your full name" />
        <div className="grid sm:grid-cols-2 gap-5">
          <Field icon={Mail} label="Email" type="email" value={form.email} onChange={set('email')} autoComplete="email" placeholder="you@email.com" />
          <Field icon={Phone} label="Mobile" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="98765 43210" pattern="\+?[\d\s-]{10,18}" />
        </div>
        <PasswordField label="Password" value={form.password} onChange={set('password')} autoComplete="new-password" minLength={8} />
        {form.password && <PasswordRules value={form.password} />}
        <PasswordField label="Confirm password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password"
          hint={form.confirm && form.confirm !== form.password ? <span className="text-rose-600">Passwords do not match</span> : null} />
        <label className="flex items-start gap-3 text-sm text-slate-600 cursor-pointer">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 w-4 h-4 accent-cyan-600" />
          I agree to GymPro's membership terms and privacy policy.
        </label>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-60">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}
