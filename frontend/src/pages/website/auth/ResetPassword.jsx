import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, KeyRound } from 'lucide-react';
import customerApi, { errorMessage } from '../../../services/customerApi';
import AuthShell, { PasswordField, PasswordRules, passwordOk, AuthLink } from '../../../components/website/AuthShell';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!passwordOk(password)) return toast.error('Password must be 8+ characters with letters and numbers');
    if (password !== confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const { data } = await customerApi.post('/customer/reset-password', { token, password });
      toast.success(data.message);
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password you haven't used before."
      image="1581009146145-b5ef050c2e1e"
      footer={<>Link expired? <AuthLink to="/forgot-password">Request a new one</AuthLink></>}
    >
      <form onSubmit={submit} className="space-y-5">
        <PasswordField label="New password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={8} />
        {password && <PasswordRules value={password} />}
        <PasswordField label="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password"
          hint={confirm && confirm !== password ? <span className="text-rose-600">Passwords do not match</span> : null} />
        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-60">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />} {loading ? 'Saving…' : 'Update password'}
        </button>
      </form>
    </AuthShell>
  );
}
