import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { loginAdmin, clearError } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import { img, IMAGES } from '../../data/site';
import Bubbles from '../../components/common/Bubbles';
import bubblesBg from '../../assets/login-bubbles.jpg';


export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);

  useEffect(() => { if (token) navigate('/admin/dashboard', { replace: true }); }, [token, navigate]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error]);

  const handle = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginAdmin({ email: form.email.trim(), password: form.password }));
    if (loginAdmin.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.user?.name || 'Admin'}!`);
      navigate('/admin/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 relative overflow-hidden">
      {/* Moving bubbles across the whole background */}
      <Bubbles className="z-[5]" />

      {/* Left half: gym image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={img(IMAGES.interior, 1600)} alt="Gym interior" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/60 to-emerald-900/50" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">GymPro</span>
          </div>
          <div className="max-w-md">
            <h2 className="text-4xl font-bold leading-tight">Manage your gym, all in one place.</h2>
            <p className="mt-4 text-white/80">Members, classes, trainers, bookings and payments — tracked live from a single dashboard.</p>
          </div>
          <p className="text-white/60 text-xs">GymPro Management System v2.0</p>
        </div>
      </div>

      {/* Right half: form over the soap-bubble image, which drifts slowly */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-slate-950">
        <img src={bubblesBg} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover animate-drift" />
        <div className="absolute inset-0 bg-slate-950/40" />

        <div className="w-full max-w-md animate-slide-up relative z-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 rounded-2xl mb-4 shadow-lg shadow-cyan-500/30">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white drop-shadow">GymPro</h1>
            <p className="text-white/80 mt-1 text-sm">Admin Control Panel</p>
          </div>

          {/* Card */}
          <div className="card card-accent p-8 shadow-2xl bg-white/85 backdrop-blur-md">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Sign in to continue</h2>
            <form onSubmit={handle} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="admin@gym.com"
                    required
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={show ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    className="input-field pl-10 pr-10"
                  />
                  <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                ) : null}
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>

          <p className="text-center text-white/60 text-xs mt-6 lg:hidden">GymPro Management System v2.0</p>
        </div>
      </div>
    </div>
  );
}
