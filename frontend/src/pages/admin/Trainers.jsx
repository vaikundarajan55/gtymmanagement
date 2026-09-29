import { Dumbbell, UserCheck, UserX } from 'lucide-react';
import { fetchTrainers } from '../../store/slices/gymSlice';
import PageTemplate from '../../components/common/PageTemplate';

const COLUMNS = [
  {
    key: 'name', label: 'Trainer',
    render: (v, row) => (
      <div className="flex items-center gap-3">
        <div className="avatar w-10 h-10 text-sm">{v?.[0]?.toUpperCase()}</div>
        <div>
          <p className="text-slate-900 font-semibold">{v}</p>
          <p className="text-slate-500 text-xs">{row.email || '—'}</p>
        </div>
      </div>
    )
  },
  { key: 'specialization', label: 'Specialization', render: (v) => v ? <span className="badge-info normal-case">{v}</span> : '—' },
  { key: 'phone', label: 'Phone' },
  { key: 'experience', label: 'Experience', render: (v) => v ? `${v} yrs` : '—' },
  { key: 'salary', label: 'Salary', render: (v) => v ? <span className="font-semibold text-slate-900">₹{Number(v).toLocaleString('en-IN')}</span> : '—' },
  {
    key: 'status', label: 'Status',
    render: (v) => <span className={v === 'inactive' ? 'badge-danger' : 'badge-success'}>{v || 'active'}</span>
  },
  { key: 'joined_date', label: 'Joined', render: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '—' },
];

const FIELDS = [
  { name: 'name', label: 'Name', required: true },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone', type: 'tel' },
  { name: 'specialization', label: 'Specialization' },
  { name: 'experience', label: 'Experience (years)', type: 'number', min: 0 },
  { name: 'salary', label: 'Salary (₹)', type: 'number', min: 0, step: '0.01' },
  { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'], default: 'active', required: true },
  { name: 'joined_date', label: 'Joined Date', type: 'date' },
];

const count = (s, k) => s.byStatus?.[k]?.count || 0;

const METRICS = [
  { label: 'Trainers', sub: 'Total Trainers', icon: Dumbbell, color: 'blue', value: (s) => s.total },
  { label: 'Active', sub: 'Currently Coaching', icon: UserCheck, color: 'emerald', value: (s) => count(s, 'active'), percent: (s, pct) => pct(count(s, 'active')) },
  { label: 'Inactive', sub: 'On Leave / Left', icon: UserX, color: 'amber', value: (s) => count(s, 'inactive'), percent: (s, pct) => pct(count(s, 'inactive')) },
];

export default function Trainers() {
  return (
    <PageTemplate
      title="Gym Trainers"
      subtitle="Summary of trainers, their specializations and status"
      fetchAction={fetchTrainers}
      dataKey="trainers"
      columns={COLUMNS}
      resource="/trainers"
      fields={FIELDS}
      entityName="Trainer"
      statsKey="trainers"
      metrics={METRICS}
      icon={Dumbbell}
      listTitle="Trainer directory"
      listSubtitle="Names, specializations, experience and salary"
    />
  );
}
