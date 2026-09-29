import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { changePassword } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function ChangePassword() {
  const dispatch = useDispatch();
  const { loading } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });

  const toggle = (field) => setShow((p) => ({ ...p, [field]: !p[field] }));

  const handle = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    const result = await dispatch(changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    }));
    if (!result.error) {
      toast.success('Password changed successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      toast.error(result.payload || 'Failed to change password');
    }
  };

  // Called as a function, not <PasswordInput />, so inputs keep focus between renders
  const PasswordInput = ({ field, label, placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type={show[field] ? 'text' : 'password'}
          value={form[field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']}
          onChange={(e) => setForm({ ...form, [field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']: e.target.value })}
          placeholder={placeholder}
          required
          className="input-field pl-10 pr-10"
        />
        <button type="button" onClick={() => toggle(field)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          {show[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  const strength = form.newPassword.length;
  const strengthColor = strength === 0 ? 'bg-slate-200' : strength < 6 ? 'bg-red-500' : strength < 10 ? 'bg-amber-500' : 'bg-emerald-500';
  const strengthLabel = strength === 0 ? '' : strength < 6 ? 'Weak' : strength < 10 ? 'Medium' : 'Strong';

  return (
    <div className="max-w-lg animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Change Password</h1>
        <p className="text-slate-500 text-sm mt-1">Update your admin account password</p>
      </div>

      <div className="card card-accent">
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-800">Use a strong password with letters, numbers, and symbols.</p>
        </div>

        <form onSubmit={handle} className="space-y-5">
          {PasswordInput({ field: "current", label: "Current Password", placeholder: "Your current password" })}
          {PasswordInput({ field: "new", label: "New Password", placeholder: "New password" })}

          {/* Strength meter */}
          {form.newPassword.length > 0 && (
            <div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                  style={{ width: `${Math.min((strength / 12) * 100, 100)}%` }} />
              </div>
              <p className="text-xs mt-1 text-slate-500">Strength: <span className="font-semibold text-slate-900">{strengthLabel}</span></p>
            </div>
          )}

          {PasswordInput({ field: "confirm", label: "Confirm New Password", placeholder: "Repeat new password" })}

          {form.confirmPassword && form.newPassword !== form.confirmPassword && (
            <p className="text-xs text-rose-600">Passwords do not match</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
