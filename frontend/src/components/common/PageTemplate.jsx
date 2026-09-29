import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { DataTable, SearchBar, Pagination } from './Table';
import RecordModal, { ConfirmDialog } from './RecordModal';
import MetricCard from './MetricCard';

// Decorative panel beside the metrics: concentric rings around the page icon
function HeroPanel({ icon: Icon }) {
  return (
    <div className="hidden xl:flex relative items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 via-violet-50 to-cyan-50 border border-indigo-100 min-h-[190px] overflow-hidden">
      <div className="absolute w-52 h-52 rounded-full border border-indigo-200/70" />
      <div className="absolute w-36 h-36 rounded-full border border-indigo-200" />
      <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-fuchsia-400 via-violet-500 to-indigo-600 shadow-2xl shadow-violet-500/40 flex items-center justify-center">
        {Icon && <Icon className="w-9 h-9 text-white" />}
      </div>
      <span className="absolute top-6 left-8 w-3 h-3 rounded-full bg-blue-500" />
      <span className="absolute top-6 right-10 w-4 h-4 rounded-full bg-orange-500" />
      <span className="absolute bottom-8 left-12 w-3 h-3 rounded-full bg-amber-400" />
      <span className="absolute bottom-10 right-8 w-2.5 h-2.5 rounded-full bg-violet-500" />
    </div>
  );
}

export default function PageTemplate({
  title, subtitle, fetchAction, dataKey, columns,
  paginationKey, extraActions, topRight,
  // CRUD: `resource` is the API path (e.g. '/trainers'); `fields` drives the add/edit form
  resource, createPath, fields, entityName = 'record', recordLabel = (r) => r.name, allowCreate = true,
  // Extra buttons rendered before Edit/Delete in each row, e.g. a View button: (row, reload) => nodes
  rowActions,
  // Metrics: `statsKey` names the /stats resource (or `statsUrl` overrides it); each metric maps stats → value
  statsKey, statsUrl, metrics, icon, listTitle, listSubtitle,
}) {
  const dispatch = useDispatch();
  const { loading } = useSelector((s) => s.gym);
  const data = useSelector((s) => s.gym[dataKey]) || [];
  const pagination = useSelector((s) => s.gym.pagination?.[paginationKey || dataKey]);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [editing, setEditing] = useState(null);   // null = closed, {} = new, row = edit
  const [deleting, setDeleting] = useState(null);
  const [stats, setStats] = useState(null);

  const loadStats = useCallback(() => {
    const url = statsUrl || (statsKey && `/stats/${statsKey}`);
    if (url) api.get(url).then(({ data }) => setStats(data)).catch(() => {});
  }, [statsKey, statsUrl]);

  const load = useCallback(() => {
    dispatch(fetchAction({ page, search, limit }));
  }, [page, search, limit]);

  const reload = () => { load(); loadStats(); };

  useEffect(() => { setPage(1); }, [search, limit]);
  useEffect(() => { load(); }, [page, search, limit]);
  useEffect(() => { loadStats(); }, [loadStats]);

  const crud = Boolean(resource && fields);
  const errMsg = (err) => err.response?.data?.message || 'Something went wrong';

  const save = async (form) => {
    try {
      if (editing.id) {
        await api.put(`${resource}/${editing.id}`, form);
        toast.success(`${entityName} updated`);
      } else {
        await api.post(createPath || resource, form);
        toast.success(`${entityName} added`);
      }
      setEditing(null);
      reload();
    } catch (err) { toast.error(errMsg(err)); }
  };

  const remove = async () => {
    try {
      await api.delete(`${resource}/${deleting.id}`);
      toast.success(`${entityName} deleted`);
      setDeleting(null);
      loadStats();
      // Step back a page if we just removed the last row on it
      if (data.length === 1 && page > 1) setPage(page - 1); else load();
    } catch (err) { toast.error(errMsg(err)); }
  };

  const tableColumns = crud || rowActions ? [...columns, {
    key: '__actions', label: 'Actions', align: 'right', sticky: true,
    render: (_, row) => (
      <div className="inline-flex items-center gap-2">
        {rowActions?.(row, reload)}
        {crud && (
          <>
            <button onClick={() => setEditing(row)} title="Edit" aria-label="Edit" className="icon-btn-edit">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => setDeleting(row)} title="Delete" aria-label="Delete" className="icon-btn-delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    ),
  }] : columns;

  const serialStart = pagination && pagination.limit !== 'all' ? (pagination.page - 1) * pagination.limit : 0;
  const pct = (n) => (stats?.total ? Math.round((n / stats.total) * 100) : 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary */}
      <section className="card">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {extraActions}
            {topRight}
            {crud && allowCreate && (
              <button onClick={() => setEditing({})} className="btn-primary">
                <Plus className="w-4 h-4" /> Add {entityName}
              </button>
            )}
          </div>
        </div>

        {metrics?.length > 0 && (
          <div className="grid gap-3 sm:gap-5 mt-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-[1fr_1fr_1fr_0.95fr] [&>*:nth-child(3)]:col-span-2 md:[&>*:nth-child(3)]:col-span-1">
            {metrics.slice(0, 3).map((m) => {
              const v = stats ? m.value(stats) : null;
              return (
                <MetricCard
                  key={m.label}
                  label={m.label}
                  sub={m.sub}
                  icon={m.icon}
                  color={m.color}
                  value={v == null ? '—' : m.format ? m.format(v) : v}
                  percent={m.percent ? m.percent(stats || {}, pct) : 100}
                />
              );
            })}
            <HeroPanel icon={icon} />
          </div>
        )}
      </section>

      {/* Directory */}
      <section className="card card-accent">
        <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{listTitle || `All ${title.toLowerCase()}`}</h2>
            <p className="text-slate-500 text-sm mt-1">{listSubtitle || 'Search, update and manage records'}</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <SearchBar value={search} onChange={setSearch} placeholder={`Search ${title.toLowerCase()}...`} />
            <button onClick={reload} title="Refresh" aria-label="Refresh"
              className="w-11 h-11 flex-shrink-0 inline-flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-cyan-600 hover:border-cyan-400 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <DataTable columns={tableColumns} data={data} loading={loading} serialStart={serialStart} />
        <Pagination pagination={pagination} onPageChange={setPage} limit={limit} onLimitChange={setLimit} />
      </section>

      {editing && (
        <RecordModal
          title={editing.id ? `Edit ${entityName}` : `Add ${entityName}`}
          fields={fields}
          record={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSubmit={save}
        />
      )}

      {deleting && (
        <ConfirmDialog
          message={`"${recordLabel(deleting) || `#${deleting.id}`}" will be permanently deleted. This cannot be undone.`}
          onConfirm={remove}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
