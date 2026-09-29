import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, CircleCheck } from 'lucide-react';
import { img } from '../../data/site';
import Bubbles from '../common/Bubbles';

// Split-screen card used by login / register / forgot / reset pages
export default function AuthShell({ title, subtitle, children, footer, image = '1534438327276-14e5300c3a48' }) {
  return (
    <section className="bg-gradient-to-br from-blue-50 via-[#f4f7fb] to-emerald-50 py-12 md:py-20 px-4 relative overflow-hidden">
      <Bubbles />
      <div className="relative z-10 max-w-5xl mx-auto grid lg:grid-cols-2 rounded-3xl overflow-hidden bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)] border border-slate-100">
        <div className="relative hidden lg:block bg-slate-900">
          <img src={img(image, 900)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-cyan-900/60 to-emerald-900/70" />
          <div className="relative h-full flex flex-col justify-end p-10 text-white">
            <h2 className="text-3xl font-bold">Train smarter with your GymPro account</h2>
            <ul className="mt-6 space-y-3 text-cyan-50">
              {['Book classes in seconds', 'Track upcoming sessions', 'Download invoices anytime', 'Manage your profile & password'].map((t) => (
                <li key={t} className="flex items-center gap-2"><CircleCheck className="w-5 h-5 text-emerald-300" /> {t}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="p-8 md:p-12">
          <div className="brand-gradient h-1 w-16 rounded-full" />
          <h1 className="mt-5 text-3xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-2 text-slate-500">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 pt-6 border-t border-slate-100 text-sm text-slate-500 text-center">{footer}</div>}
        </div>
      </div>
    </section>
  );
}

export function PasswordField({ label, value, onChange, autoComplete = 'current-password', placeholder = '••••••••', hint, minLength }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-600">{label} <span className="text-rose-500">*</span></span>
      <span className="relative block mt-1.5">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type={show ? 'text' : 'password'} value={value} onChange={onChange} required minLength={minLength}
          autoComplete={autoComplete} placeholder={placeholder} className="input-field pl-11 pr-11" />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600" aria-label={show ? 'Hide password' : 'Show password'}>
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </span>
      {hint && <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

// Live checklist for new passwords; mirrors the server rule (8+ chars, letters and numbers)
export function PasswordRules({ value }) {
  const rules = [
    [value.length >= 8, 'At least 8 characters'],
    [/[A-Za-z]/.test(value), 'Contains a letter'],
    [/\d/.test(value), 'Contains a number'],
  ];
  return (
    <ul className="grid grid-cols-3 gap-2 text-xs">
      {rules.map(([ok, t]) => (
        <li key={t} className={`flex items-center gap-1 ${ok ? 'text-emerald-600' : 'text-slate-400'}`}>
          <CircleCheck className="w-3.5 h-3.5 flex-shrink-0" /> {t}
        </li>
      ))}
    </ul>
  );
}

// Only allow same-site relative redirects after login
export const safeNext = (next, fallback = '/account') => (next && next.startsWith('/') && !next.startsWith('//') ? next : fallback);

export const passwordOk = (v) => v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v);

export function AuthLink({ to, children }) {
  return <Link to={to} className="font-semibold text-cyan-700 hover:text-cyan-800">{children}</Link>;
}
