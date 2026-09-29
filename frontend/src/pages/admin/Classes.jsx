import { Dumbbell, CircleCheck, Users } from 'lucide-react';
import { fetchClasses } from '../../store/slices/gymSlice';
import PageTemplate from '../../components/common/PageTemplate';

const LEVEL = { Beginner: 'badge-success', Intermediate: 'badge-info', Advanced: 'badge-danger', 'All Levels': 'badge-violet' };

const COLUMNS = [
  {
    key: 'name', label: 'Class',
    render: (v, row) => (
      <div>
        <p className="text-slate-900 font-semibold">{v}</p>
        <p className="text-slate-500 text-xs font-mono">{row.slug}</p>
      </div>
    )
  },
  { key: 'category', label: 'Category', render: (v) => v ? <span className="badge-info normal-case">{v}</span> : '—' },
  { key: 'level', label: 'Level', render: (v) => <span className={`${LEVEL[v] || 'badge-neutral'} normal-case`}>{v}</span> },
  { key: 'price', label: 'Price', render: (v) => <span className="font-bold text-slate-900">₹{Number(v).toLocaleString('en-IN')}</span> },
  { key: 'days', label: 'Days', render: (v) => <span className="text-xs">{String(v).split(',').join(' · ')}</span> },
  { key: 'time_slots', label: 'Times', render: (v) => <span className="text-xs whitespace-nowrap">{String(v).split(',').join(' / ')}</span> },
  { key: 'capacity', label: 'Seats', align: 'center' },
  { key: 'trainer_name', label: 'Trainer', render: (v) => v || <span className="text-slate-400">—</span> },
  { key: 'status', label: 'Status', render: (v) => <span className={v === 'inactive' ? 'badge-danger' : 'badge-success'}>{v}</span> },
];

const FIELDS = [
  { name: 'name', label: 'Class name', required: true },
  { name: 'slug', label: 'URL slug (e.g. yoga)', required: true },
  { name: 'category', label: 'Category', type: 'select', options: ['Strength', 'Cardio', 'Yoga', 'CrossFit', 'Core', 'Group'] },
  { name: 'level', label: 'Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'], default: 'All Levels', required: true },
  { name: 'price', label: 'Price per person (₹)', type: 'number', min: 0, step: '0.01', required: true },
  { name: 'capacity', label: 'Seats per session', type: 'number', min: 1, default: 20, required: true },
  { name: 'days', label: 'Days (comma separated: Mon,Wed,Fri)', required: true, default: 'Mon,Wed,Fri' },
  { name: 'time_slots', label: 'Times (comma separated: 6:00 AM,6:30 PM)', required: true, default: '6:00 AM' },
  { name: 'duration_min', label: 'Duration (minutes)', type: 'number', min: 10, default: 60 },
  { name: 'trainer_id', label: 'Trainer', type: 'select', options: 'trainers' },
  { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'], default: 'active', required: true },
  { name: 'description', label: 'Short description', type: 'textarea' },
];

const cnt = (s, k) => s.byStatus?.[k]?.count || 0;

const METRICS = [
  { label: 'Classes', sub: 'Total Classes', icon: Dumbbell, color: 'blue', value: (s) => s.total },
  { label: 'Bookable', sub: 'Active on Website', icon: CircleCheck, color: 'emerald', value: (s) => cnt(s, 'active'), percent: (s, pct) => pct(cnt(s, 'active')) },
  { label: 'Hidden', sub: 'Inactive Classes', icon: Users, color: 'amber', value: (s) => cnt(s, 'inactive'), percent: (s, pct) => pct(cnt(s, 'inactive')) },
];

export default function Classes() {
  return (
    <PageTemplate
      title="Class Master"
      subtitle="Classes customers can book online: price, schedule, seats and trainer"
      fetchAction={fetchClasses}
      dataKey="classes"
      columns={COLUMNS}
      resource="/classes"
      fields={FIELDS}
      entityName="Class"
      statsKey="classes"
      metrics={METRICS}
      icon={Dumbbell}
      listTitle="Class schedule"
      listSubtitle="Changes appear on the website's booking page and timetable immediately"
    />
  );
}
