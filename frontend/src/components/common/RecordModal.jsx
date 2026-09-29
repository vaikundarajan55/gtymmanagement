import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '../../services/api';
import ImageField from './ImageField';

// API dates arrive as ISO timestamps; <input type="date"> needs local YYYY-MM-DD
const toDateInput = (v) => {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d)) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const buildForm = (fields, record) =>
  Object.fromEntries(fields.map((f) => {
    const v = record?.[f.name];
    if (f.type === 'date') return [f.name, record ? toDateInput(v) : (f.default ?? '')];
    return [f.name, v ?? (record ? '' : (f.default ?? ''))];
  }));

export default function RecordModal({ title, fields, record, onClose, onSubmit }) {
  const [form, setForm] = useState(() => buildForm(fields, record));
  const [saving, setSaving] = useState(false);
  const [lookups, setLookups] = useState({ trainers: [], members: [] });

  const needsLookups = fields.some((f) => f.options === 'trainers' || f.options === 'members');
  useEffect(() => {
    if (needsLookups) api.get('/options').then(({ data }) => setLookups(data)).catch(() => {});
  }, [needsLookups]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await onSubmit(form); } finally { setSaving(false); }
  };

  const optionsFor = (f) => {
    if (f.options === 'trainers') return lookups.trainers.map((t) => ({ value: t.id, label: t.name }));
    if (f.options === 'members') return lookups.members.map((m) => ({ value: m.id, label: `${m.name} (${m.phone})` }));
    return f.options.map((o) => (typeof o === 'object' ? o : { value: o, label: o }));
  };

  const renderInput = (f) => {
    if (f.type === 'image') {
      return <ImageField id={f.name} value={form[f.name]} onChange={(v) => set(f.name, v)} uploadPath={f.uploadPath} required={f.required} />;
    }
    const common = { id: f.name, required: f.required, value: form[f.name], onChange: (e) => set(f.name, e.target.value), className: 'input-field' };
    if (f.type === 'select') {
      return (
        <select {...common}>
          <option value="">{f.required ? 'Select…' : '— None —'}</option>
          {optionsFor(f).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    }
    if (f.type === 'textarea') return <textarea {...common} rows={3} />;
    return <input {...common} type={f.type || 'text'} min={f.min} step={f.step} />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="card card-accent w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.name} className={f.type === 'textarea' || f.type === 'image' || f.wide ? 'sm:col-span-2' : ''}>
                <label htmlFor={f.name} className="block text-sm font-medium text-slate-600 mb-1.5">
                  {f.label}{f.required && <span className="text-rose-500"> *</span>}
                </label>
                {renderInput(f)}
                {f.hint && <p className="mt-1 text-xs text-slate-500">{f.hint}</p>}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {record ? 'Save changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ConfirmDialog({ message, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  const confirm = async () => {
    setBusy(true);
    try { await onConfirm(); } finally { setBusy(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="card card-accent w-full max-w-sm animate-slide-up" onMouseDown={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Delete record?</h2>
        <p className="text-slate-500 text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={confirm} disabled={busy} className="btn-danger disabled:opacity-60">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
