import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CalendarCheck, CalendarClock, Wallet, CircleAlert, ArrowRight, Loader2, Clock, Users } from 'lucide-react';
import customerApi from '../../../services/customerApi';
import MetricCard from '../../../components/common/MetricCard';
import { inr } from '../../../hooks/useSiteData';
import { STATUS_BADGE } from '../../../data/booking';

const dayChip = (d) => {
  const date = new Date(`${d}T00:00:00`);
  return { day: date.toLocaleDateString('en-IN', { weekday: 'short' }), num: date.getDate(), mon: date.toLocaleDateString('en-IN', { month: 'short' }) };
};

export default function AccountDashboard() {
  const { customer } = useSelector((s) => s.customer);
  const [data, setData] = useState(null);

  useEffect(() => { customerApi.get('/customer/dashboard').then(({ data }) => setData(data)).catch(() => setData({ error: true })); }, []);

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="card relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-gradient-to-br from-cyan-100 to-emerald-100" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-cyan-700">{greet}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{customer?.name?.split(' ')[0]}, ready to train?</h1>
            <p className="text-slate-500 mt-1">Here's a summary of your bookings and upcoming sessions.</p>
          </div>
          <Link to="/book" className="btn-primary">Book a class <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </section>

      {!data ? (
        <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>
      ) : data.error ? (
        <p className="card text-center text-rose-600">Could not load your dashboard. Please refresh.</p>
      ) : (
        <>
          <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
            <MetricCard size="sm" label="Bookings" value={data.bookings} sub="All Time" icon={CalendarCheck} color="blue" />
            <MetricCard size="sm" label="Upcoming" value={data.upcomingSessions} sub="Seats Booked Ahead" icon={CalendarClock} color="emerald" />
            <MetricCard size="sm" label="Spent" value={inr(data.spent)} sub="Paid Online" icon={Wallet} color="violet" />
            <MetricCard size="sm" label="Unpaid" value={data.unpaid} sub="Pending / Failed" icon={CircleAlert} color="amber"
              percent={data.bookings ? (data.unpaid / data.bookings) * 100 : 0} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="card card-accent">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Upcoming sessions</h2>
                <Link to="/account/bookings" className="text-sm font-semibold text-cyan-700">All bookings</Link>
              </div>
              {data.upcoming.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">No upcoming sessions yet.</p>
                  <Link to="/book" className="btn-secondary mt-4">Find a class</Link>
                </div>
              ) : (
                <ul className="space-y-3">
                  {data.upcoming.map((u, i) => {
                    const c = dayChip(u.session_date);
                    return (
                      <li key={i}>
                        <Link to={`/account/bookings/${u.booking_no}`} className="flex items-center gap-4 rounded-2xl border border-slate-200 p-3 hover:border-cyan-300 hover:bg-cyan-50/40 transition-colors">
                          <div className="w-14 flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white text-center py-1.5 shadow-md shadow-cyan-500/25">
                            <p className="text-[10px] font-bold uppercase">{c.day}</p>
                            <p className="text-lg font-bold leading-tight">{c.num}</p>
                            <p className="text-[10px]">{c.mon}</p>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 truncate">{u.title}</p>
                            <p className="text-xs text-slate-500 flex gap-3 mt-0.5">
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{u.time_slot}</span>
                              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{u.qty}</span>
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="card card-accent">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Recent bookings</h2>
              {data.recent.length === 0 ? <p className="text-slate-500 text-center py-8">You haven't booked anything yet.</p> : (
                <ul className="divide-y divide-slate-100">
                  {data.recent.map((r) => (
                    <li key={r.booking_no} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <Link to={`/account/bookings/${r.booking_no}`} className="font-mono text-sm font-bold text-slate-800 hover:text-cyan-700">{r.booking_no}</Link>
                        <p className="text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900">{inr(r.total)}</span>
                        <span className={STATUS_BADGE[r.status]}>{r.status}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
