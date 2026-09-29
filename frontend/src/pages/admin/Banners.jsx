import { GalleryHorizontal, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { fetchBanners } from '../../store/slices/gymSlice';
import PageTemplate from '../../components/common/PageTemplate';
import { assetUrl } from '../../services/config';

const COLUMNS = [
  {
    key: 'image_url', label: 'Banner',
    render: (v, row) => (
      <div className="flex items-center gap-3 md:min-w-[260px]">
        <img src={assetUrl(v)} alt="" loading="lazy" className="w-28 h-14 rounded-lg object-cover bg-slate-200 flex-shrink-0 ring-1 ring-slate-200" />
        <div className="min-w-0">
          <p className="text-slate-900 font-semibold md:truncate">{row.title}</p>
          {row.highlight && <p className="text-xs font-semibold text-cyan-600 md:truncate">{row.highlight}</p>}
        </div>
      </div>
    ),
  },
  { key: 'tag', label: 'Tag', render: (v) => v ? <span className="badge-info normal-case !inline-block max-w-full truncate align-middle" title={v}>{v}</span> : <span className="text-slate-400">—</span> },
  {
    key: 'button_text', label: 'Button',
    render: (v, row) => v ? (
      <div className="text-xs">
        <p className="font-semibold text-slate-800">{v}</p>
        <p className="text-slate-500 font-mono inline-flex items-center gap-1">{row.button_link}{/^https?:/i.test(row.button_link || '') && <ExternalLink className="w-3 h-3" />}</p>
      </div>
    ) : <span className="text-slate-400">—</span>,
  },
  { key: 'sort_order', label: 'Order', align: 'center' },
  { key: 'status', label: 'Status', render: (v) => <span className={v === 'inactive' ? 'badge-danger' : 'badge-success'}>{v === 'inactive' ? 'hidden' : 'live'}</span> },
];

const FIELDS = [
  { name: 'image_url', label: 'Background image', type: 'image', uploadPath: '/banners/upload', required: true },
  { name: 'title', label: 'Heading', required: true, hint: 'First line, e.g. "Forge your"' },
  { name: 'highlight', label: 'Highlighted text', hint: 'Second line in gradient colour, e.g. "best self"' },
  { name: 'tag', label: 'Small tag above heading', hint: 'e.g. "No joining fee"' },
  { name: 'sort_order', label: 'Display order', type: 'number', step: '1', default: 1, hint: 'Lower numbers show first' },
  { name: 'subtitle', label: 'Description', type: 'textarea' },
  { name: 'button_text', label: 'Button text', hint: 'Leave empty for no button' },
  { name: 'button_link', label: 'Button link', hint: 'A site page like /book or /#plans, or a full https:// link' },
  { name: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Live on website' }, { value: 'inactive', label: 'Hidden' }], default: 'active', required: true },
];

const cnt = (s, k) => s.byStatus?.[k]?.count || 0;

const METRICS = [
  { label: 'Banners', sub: 'Total Banners', icon: GalleryHorizontal, color: 'blue', value: (s) => s.total },
  { label: 'Live', sub: 'Showing on Home Page', icon: Eye, color: 'emerald', value: (s) => cnt(s, 'active'), percent: (s, pct) => pct(cnt(s, 'active')) },
  { label: 'Hidden', sub: 'Not Shown', icon: EyeOff, color: 'amber', value: (s) => cnt(s, 'inactive'), percent: (s, pct) => pct(cnt(s, 'inactive')) },
];

export default function Banners() {
  return (
    <PageTemplate
      title="Banners"
      subtitle="Home page hero slides: image, heading, description and button"
      fetchAction={fetchBanners}
      dataKey="banners"
      columns={COLUMNS}
      resource="/banners"
      fields={FIELDS}
      entityName="Banner"
      recordLabel={(r) => r.title}
      statsKey="banners"
      metrics={METRICS}
      icon={GalleryHorizontal}
      listTitle="Home page slides"
      listSubtitle="Changes appear instantly on every open website page, no refresh needed"
    />
  );
}
