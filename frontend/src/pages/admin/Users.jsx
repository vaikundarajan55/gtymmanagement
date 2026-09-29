import { Users as UsersIcon, UserCheck, UserX } from 'lucide-react';
import { fetchUsers } from '../../store/slices/gymSlice';
import PageTemplate from '../../components/common/PageTemplate';

const STATUS = { active: 'badge-success', inactive: 'badge-neutral', expired: 'badge-danger' };

const COLUMNS = [
  {
    key: 'name', label: 'Member',
    render: (v, row) => (
      <div className="flex items-center gap-3">
        <div className="avatar w-10 h-10 text-sm from-violet-500 to-blue-600">{v?.[0]?.toUpperCase()}</div>
        <div>
          <p className="text-slate-900 font-semibold">{v}</p>
          <p className="text-slate-500 text-xs">{row.email || '—'}</p>
        </div>
      </div>
    )
  },
  { key: 'phone', label: 'Phone' },
  { key: 'plan', label: 'Plan', render: (v) => <span className="badge-info normal-case">{v || 'Monthly'}</span> },
  { key: 'dob', label: 'Birthday', render: (v) => v ? new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—' },
  { key: 'trainer_name', label: 'Trainer', render: (v) => v || <span className="text-slate-400">Unassigned</span> },
  { key: 'status', label: 'Status', render: (v) => <span className={STATUS[v] || 'badge-success'}>{v || 'active'}</span> },
  { key: 'join_date', label: 'Joined', render: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '—' },
];

const FIELDS = [
  { name: 'name', label: 'Name', required: true },
  { name: 'phone', label: 'Phone', type: 'tel', required: true },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'dob', label: 'Date of Birth', type: 'date' },
  { name: 'plan', label: 'Plan', type: 'select', options: ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'], default: 'Monthly', required: true },
  { name: 'trainer_id', label: 'Trainer', type: 'select', options: 'trainers' },
  { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'expired'], default: 'active', required: true },
  { name: 'join_date', label: 'Join Date', type: 'date' },
  { name: 'address', label: 'Address', type: 'textarea' },
];

const count = (s, k) => s.byStatus?.[k]?.count || 0;

const METRICS = [
  { label: 'Members', sub: 'Total Members', icon: UsersIcon, color: 'blue', value: (s) => s.total },
  { label: 'Active', sub: 'Active Memberships', icon: UserCheck, color: 'emerald', value: (s) => count(s, 'active'), percent: (s, pct) => pct(count(s, 'active')) },
  { label: 'Expired', sub: 'Expired / Inactive', icon: UserX, color: 'amber', value: (s) => count(s, 'expired') + count(s, 'inactive'), percent: (s, pct) => pct(count(s, 'expired') + count(s, 'inactive')) },
];

export default function Users() {
  return (
    <PageTemplate
      title="Members"
      subtitle="Summary of gym members, plans and membership status"
      fetchAction={fetchUsers}
      dataKey="users"
      columns={COLUMNS}
      resource="/users"
      fields={FIELDS}
      entityName="Member"
      statsKey="users"
      metrics={METRICS}
      icon={UsersIcon}
      listTitle="Member directory"
      listSubtitle="Contact details, plans and trainer assignments"
    />
  );
}
