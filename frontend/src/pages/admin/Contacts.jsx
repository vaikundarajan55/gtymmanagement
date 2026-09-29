import { MessageSquare, Mail, MailOpen } from 'lucide-react';
import { fetchContacts } from '../../store/slices/gymSlice';
import PageTemplate from '../../components/common/PageTemplate';

const STATUS = { unread: 'badge-warn', read: 'badge-info', replied: 'badge-success' };

const COLUMNS = [
  {
    key: 'name', label: 'Name',
    render: (v, row) => (
      <div>
        <p className="text-slate-900 font-semibold">{v}</p>
        <p className="text-slate-500 text-xs">{row.email || '—'}</p>
      </div>
    )
  },
  { key: 'phone', label: 'Phone' },
  { key: 'subject', label: 'Subject', render: (v) => v ? <span className="font-medium text-slate-800">{v}</span> : '—' },
  { key: 'message', label: 'Message', render: (v) => <span className="text-slate-500">{v ? v.substring(0, 60) + (v.length > 60 ? '…' : '') : '—'}</span> },
  { key: 'status', label: 'Status', render: (v) => <span className={STATUS[v] || 'badge-warn'}>{v || 'unread'}</span> },
  { key: 'created_at', label: 'Received', render: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '—' },
];

const FIELDS = [
  { name: 'name', label: 'Name', required: true },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone', type: 'tel' },
  { name: 'subject', label: 'Subject' },
  { name: 'status', label: 'Status', type: 'select', options: ['unread', 'read', 'replied'], default: 'unread', required: true },
  { name: 'message', label: 'Message', type: 'textarea', required: true },
];

const cnt = (s, k) => s.byStatus?.[k]?.count || 0;

const METRICS = [
  { label: 'Messages', sub: 'Total Received', icon: MessageSquare, color: 'blue', value: (s) => s.total },
  { label: 'Unread', sub: 'Needs Attention', icon: Mail, color: 'amber', value: (s) => cnt(s, 'unread'), percent: (s, pct) => pct(cnt(s, 'unread')) },
  { label: 'Replied', sub: 'Responded To', icon: MailOpen, color: 'emerald', value: (s) => cnt(s, 'replied'), percent: (s, pct) => pct(cnt(s, 'replied')) },
];

export default function Contacts() {
  return (
    <PageTemplate
      title="Contact Messages"
      subtitle="Summary of messages submitted via the website contact form"
      fetchAction={fetchContacts}
      dataKey="contacts"
      columns={COLUMNS}
      resource="/contacts"
      createPath="/contacts/admin"
      fields={FIELDS}
      entityName="Contact"
      statsKey="contacts"
      metrics={METRICS}
      icon={MessageSquare}
      listTitle="Message inbox"
      listSubtitle="Senders, subjects and reply status"
    />
  );
}
