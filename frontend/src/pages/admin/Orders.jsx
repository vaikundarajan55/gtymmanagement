import { ShoppingBag, PackageCheck, Timer } from 'lucide-react';
import { fetchOrders } from '../../store/slices/gymSlice';
import PageTemplate from '../../components/common/PageTemplate';

const inr = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;
const STATUS = { delivered: 'badge-success', pending: 'badge-warn', processing: 'badge-info', cancelled: 'badge-danger' };

const COLUMNS = [
  { key: 'id', label: 'Order #', render: (v) => <span className="font-mono text-xs font-semibold text-slate-500">#{String(v).padStart(4, '0')}</span> },
  { key: 'customer_name', label: 'Customer', render: (v) => <span className="text-slate-900 font-semibold">{v}</span> },
  { key: 'product_name', label: 'Product' },
  { key: 'quantity', label: 'Qty', align: 'center' },
  { key: 'amount', label: 'Amount', render: (v) => <span className="font-bold text-slate-900">{inr(v)}</span> },
  { key: 'status', label: 'Status', render: (v) => <span className={STATUS[v] || 'badge-warn'}>{v || 'pending'}</span> },
  { key: 'order_date', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '—' },
];

const FIELDS = [
  { name: 'member_id', label: 'Customer', type: 'select', options: 'members', required: true },
  { name: 'product_name', label: 'Product', required: true },
  { name: 'quantity', label: 'Quantity', type: 'number', min: 1, default: 1, required: true },
  { name: 'amount', label: 'Amount (₹)', type: 'number', min: 0, step: '0.01', required: true },
  { name: 'status', label: 'Status', type: 'select', options: ['pending', 'processing', 'delivered', 'cancelled'], default: 'pending', required: true },
  { name: 'order_date', label: 'Order Date', type: 'date' },
];

const cnt = (s, k) => s.byStatus?.[k]?.count || 0;

const METRICS = [
  { label: 'Orders', sub: 'Total Orders', icon: ShoppingBag, color: 'blue', value: (s) => s.total },
  { label: 'Delivered', sub: 'Completed Orders', icon: PackageCheck, color: 'emerald', value: (s) => cnt(s, 'delivered'), percent: (s, pct) => pct(cnt(s, 'delivered')) },
  { label: 'In Progress', sub: 'Pending / Processing', icon: Timer, color: 'amber', value: (s) => cnt(s, 'pending') + cnt(s, 'processing'), percent: (s, pct) => pct(cnt(s, 'pending') + cnt(s, 'processing')) },
];

export default function Orders() {
  return (
    <PageTemplate
      title="Orders"
      subtitle="Summary of supplement and merchandise orders"
      fetchAction={fetchOrders}
      dataKey="orders"
      columns={COLUMNS}
      resource="/orders"
      fields={FIELDS}
      entityName="Order"
      recordLabel={(r) => `Order #${r.id} – ${r.product_name}`}
      statsKey="orders"
      metrics={METRICS}
      icon={ShoppingBag}
      listTitle="Order register"
      listSubtitle="Customers, products, quantities and delivery status"
    />
  );
}
