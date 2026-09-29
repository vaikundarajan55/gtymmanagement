import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PartyPopper, Cake, CalendarDays } from 'lucide-react';
import { fetchBirthdays } from '../../store/slices/gymSlice';
import MetricCard from '../../components/common/MetricCard';
import { DataTable } from '../../components/common/Table';

export default function Birthdays() {
  const dispatch = useDispatch();
  const { birthdays, loading } = useSelector((s) => s.gym);

  useEffect(() => { dispatch(fetchBirthdays()); }, []);

  const today = new Date();
  const todayMD = `${today.getMonth() + 1}-${today.getDate()}`;

  const isToday = (dob) => {
    if (!dob) return false;
    const d = new Date(dob);
    return `${d.getMonth() + 1}-${d.getDate()}` === todayMD;
  };

  const todayBirthdays = birthdays.filter((u) => isToday(u.dob));
  const otherBirthdays = birthdays.filter((u) => !isToday(u.dob));
  const upcoming = otherBirthdays.filter((u) => new Date(u.dob).getDate() > today.getDate());

  const columns = [
    {
      key: 'name', label: 'Member',
      render: (v) => (
        <div className="flex items-center gap-3">
          <div className="avatar w-9 h-9 text-xs from-pink-500 to-orange-400">{v?.[0]?.toUpperCase()}</div>
          <span className="text-slate-900 font-semibold">{v}</span>
        </div>
      )
    },
    { key: 'phone', label: 'Phone' },
    { key: 'plan', label: 'Plan', render: (v) => <span className="badge-info normal-case">{v || 'Monthly'}</span> },
    { key: 'dob', label: 'Birthday', render: (v) => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }) },
    { key: 'age', label: 'Turning', render: (_, u) => `${today.getFullYear() - new Date(u.dob).getFullYear()} yrs` },
    {
      key: 'when', label: 'Status', align: 'right',
      render: (_, u) => new Date(u.dob).getDate() > today.getDate()
        ? <span className="badge-warn">Upcoming</span>
        : <span className="badge-neutral">Passed</span>
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="card">
        <h1 className="text-2xl font-bold text-slate-900">Birthdays</h1>
        <p className="text-slate-500 text-sm mt-1">Active members celebrating in {today.toLocaleDateString('en-IN', { month: 'long' })}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 mt-6 [&>*:nth-child(3)]:col-span-2 md:[&>*:nth-child(3)]:col-span-1">
          <MetricCard label="Today" value={todayBirthdays.length} sub="Birthdays Today" icon={PartyPopper} color="rose" />
          <MetricCard label="Upcoming" value={upcoming.length} sub="Later This Month" icon={CalendarDays} color="amber"
            percent={birthdays.length ? (upcoming.length / birthdays.length) * 100 : 0} />
          <MetricCard label="This Month" value={birthdays.length} sub="Total Birthdays" icon={Cake} color="blue" />
        </div>
      </section>

      {todayBirthdays.length > 0 && (
        <section className="card card-accent bg-gradient-to-br from-rose-50 via-white to-amber-50">
          <div className="flex items-center gap-2 mb-5">
            <PartyPopper className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-bold text-slate-900">Today's birthdays 🎂</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayBirthdays.map((u) => (
              <div key={u.id} className="flex items-center gap-4 bg-white border border-rose-200 rounded-2xl p-4 shadow-sm animate-slide-up">
                <div className="avatar w-12 h-12 text-lg from-pink-500 to-orange-400">{u.name?.[0]?.toUpperCase()}</div>
                <div>
                  <p className="font-bold text-slate-900">{u.name}</p>
                  <p className="text-sm text-rose-600 font-medium">{u.phone}</p>
                  <p className="text-xs text-slate-500">{u.plan} member</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="card card-accent">
        <h2 className="text-xl font-bold text-slate-900">Birthdays this month</h2>
        <p className="text-slate-500 text-sm mt-1 mb-5">Everyone else with a birthday in {today.toLocaleDateString('en-IN', { month: 'long' })}. Edit dates of birth on the Members page.</p>
        <DataTable columns={columns} data={otherBirthdays} loading={loading} serialStart={0} emptyMessage="No other birthdays this month" />
      </section>
    </div>
  );
}
