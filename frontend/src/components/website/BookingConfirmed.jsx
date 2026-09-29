import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  CircleCheck, Copy, CalendarDays, Clock, Users, MapPin, UserRound, CalendarPlus, Download, FileText, CalendarCheck,
  Printer, Crown, Timer, Shirt, QrCode, ArrowRight, Mail, Phone,
} from 'lucide-react';
import { inr } from '../../hooks/useSiteData';
import { METHOD_LABEL } from '../../data/booking';
import { googleCalendarUrl, downloadIcs } from '../../utils/calendar';
import OrderSummary from './OrderSummary';
import { Steps } from './CheckoutSteps';

const CONFETTI_COLORS = ['bg-blue-500', 'bg-cyan-400', 'bg-emerald-400', 'bg-amber-400', 'bg-rose-400', 'bg-violet-500'];

// Decorative one-shot confetti burst behind the hero (respects reduced-motion); removed once it has fallen
function Confetti() {
  const [show, setShow] = useState(true);
  useEffect(() => { const t = setTimeout(() => setShow(false), 4500); return () => clearTimeout(t); }, []);
  if (!show) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] overflow-hidden motion-reduce:hidden print:hidden" aria-hidden="true">
      {Array.from({ length: 42 }).map((_, i) => (
        <span key={i}
          className={`absolute top-0 block rounded-sm animate-confetti ${CONFETTI_COLORS[i % CONFETTI_COLORS.length]}`}
          style={{ left: `${(i * 37) % 100}%`, width: `${6 + (i % 3) * 3}px`, height: `${10 + (i % 4) * 3}px`, animationDelay: `${(i % 12) * 0.12}s` }} />
      ))}
    </div>
  );
}

const longDate = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

function SessionTicket({ item, booking, gym }) {
  const d = new Date(`${item.session_date}T00:00:00`);
  const session = {
    title: `${item.title} · ${gym.name}`,
    date: item.session_date, time: item.time_slot, durationMin: item.duration_min,
    details: `Booking ${booking.booking_no} · ${item.qty} ${item.qty > 1 ? 'people' : 'person'}. Show your booking number at reception. Arrive 10 minutes early.`,
    location: `${gym.name}, ${gym.address}`,
  };
  return (
    <div className="relative flex flex-col sm:flex-row rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden print:break-inside-avoid">
      {/* Date stub */}
      <div className="sm:w-32 flex sm:flex-col items-center justify-center gap-3 sm:gap-0 bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 text-white p-4 print:[print-color-adjust:exact]">
        <span className="text-xs font-bold uppercase tracking-widest">{d.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
        <span className="text-4xl font-bold font-[Space_Grotesk] leading-none sm:my-1">{d.getDate()}</span>
        <span className="text-sm font-semibold">{d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
      </div>
      {/* Perforation */}
      <div className="hidden sm:block relative w-0 border-l-2 border-dashed border-slate-200">
        <span className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-[#f4f7fb] border border-slate-200" />
        <span className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-[#f4f7fb] border border-slate-200" />
      </div>
      <div className="flex-1 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-700">Class session</p>
            <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
          </div>
          <span className="badge-success">Confirmed</span>
        </div>
        <div className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-slate-600">
          <span className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-cyan-600" />{longDate(item.session_date)}</span>
          <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-cyan-600" />{item.time_slot}{item.duration_min ? ` · ${item.duration_min} min` : ''}</span>
          <span className="flex items-center gap-2"><Users className="w-4 h-4 text-cyan-600" />{item.qty} {item.qty > 1 ? 'people' : 'person'}</span>
          {item.trainer_name && <span className="flex items-center gap-2"><UserRound className="w-4 h-4 text-cyan-600" />Coach {item.trainer_name}</span>}
          <span className="flex items-center gap-2 sm:col-span-2"><MapPin className="w-4 h-4 text-cyan-600 flex-shrink-0" />{gym.address}</span>
        </div>
        <div className="mt-4 pt-4 border-t border-dashed border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm text-slate-500"><QrCode className="w-4 h-4" />Check-in code <b className="font-mono text-slate-900">{booking.booking_no}</b></span>
          <a href={googleCalendarUrl(session)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-700 hover:text-cyan-800 print:hidden">
            <CalendarPlus className="w-4 h-4" /> Add to Google Calendar
          </a>
        </div>
      </div>
    </div>
  );
}

function MembershipTicket({ item, booking }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl p-5 bg-gradient-to-br from-amber-50 via-white to-orange-50 border border-amber-200 print:break-inside-avoid">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 print:[print-color-adjust:exact]">
        <Crown className="w-7 h-7 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Membership</p>
        <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
        <p className="text-sm text-slate-600 mt-0.5">Show booking <b className="font-mono">{booking.booking_no}</b> at the front desk to collect your membership card and book your free fitness assessment.</p>
      </div>
      <span className="badge-success">Activated</span>
    </div>
  );
}

export default function BookingConfirmed({ booking: b, gym }) {
  const loggedIn = Boolean(useSelector((s) => s.customer.token));
  const sessions = b.items.filter((i) => i.item_type === 'class');
  const plans = b.items.filter((i) => i.item_type === 'plan');
  const firstName = b.customer_name?.split(' ')[0] || 'there';

  const copyNo = () => navigator.clipboard?.writeText(b.booking_no).then(() => toast.success('Booking number copied'), () => {});
  const addAll = () => downloadIcs(sessions.map((i) => ({
    title: `${i.title} · ${gym.name}`, date: i.session_date, time: i.time_slot, durationMin: i.duration_min,
    details: `Booking ${b.booking_no} · ${i.qty} ${i.qty > 1 ? 'people' : 'person'}`, location: `${gym.name}, ${gym.address}`,
  })), b.booking_no, `gympro-${b.booking_no}.ics`);

  const receipt = [
    ['Booking number', <span key="n" className="font-mono">{b.booking_no}</span>],
    ['Amount paid', inr(b.total)],
    ['Paid via', `${METHOD_LABEL[b.payment_method] || b.payment_method || '—'}${b.gateway === 'dummy' ? ' (demo)' : ''}`],
    ['Payment ID', <span key="p" className="font-mono text-xs break-all">{b.razorpay_payment_id}</span>],
    ['Paid on', new Date(b.paid_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })],
    ['Booked by', b.customer_email],
  ];

  return (
    <section className="relative bg-[#f4f7fb] min-h-[70vh] print:bg-white">
      <Confetti />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="print:hidden"><Steps current={5} /></div>

        {/* Hero */}
        <div className="mt-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-8 md:p-10 text-white shadow-2xl shadow-emerald-600/25 print:[print-color-adjust:exact]">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10" />
          <div className="absolute right-24 -bottom-20 w-48 h-48 rounded-full bg-white/10" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl animate-pop flex-shrink-0">
              <CircleCheck className="w-11 h-11 text-emerald-500" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="text-emerald-50 font-semibold">Payment successful</p>
              <h1 className="text-3xl md:text-4xl font-bold">Booking confirmed, {firstName}! 🎉</h1>
              <p className="mt-2 text-emerald-50 max-w-xl">
                {sessions.length ? `Your spot${sessions.length > 1 ? 's are' : ' is'} reserved. ` : ''}
                {plans.length ? 'Your membership is active. ' : ''}See you at {gym.name}.
              </p>
            </div>
            <button onClick={copyNo} className="self-start md:self-center rounded-2xl bg-white/15 backdrop-blur px-5 py-3 text-left hover:bg-white/25 transition-colors print:hidden" title="Copy booking number">
              <span className="block text-xs font-semibold uppercase tracking-wider text-emerald-50">Booking number</span>
              <span className="flex items-center gap-2 font-mono text-xl font-bold">{b.booking_no} <Copy className="w-4 h-4" /></span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3 print:hidden">
          {loggedIn && <Link to={`/account/bookings/${b.booking_no}/invoice`} className="btn-primary"><FileText className="w-4 h-4" /> View invoice</Link>}
          {loggedIn && <Link to="/account/bookings" className="btn-secondary"><CalendarCheck className="w-4 h-4" /> My bookings</Link>}
          {sessions.length > 0 && <button onClick={addAll} className="btn-secondary"><Download className="w-4 h-4" /> Add all to calendar (.ics)</button>}
          <button onClick={() => window.print()} className="btn-secondary"><Printer className="w-4 h-4" /> Print</button>
        </div>

        {/* Tickets */}
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Your {sessions.length && plans.length ? 'sessions & membership' : sessions.length ? `session${sessions.length > 1 ? 's' : ''}` : 'membership'}</h2>
          {sessions.map((it, i) => <SessionTicket key={`s${i}`} item={it} booking={b} gym={gym} />)}
          {plans.map((it, i) => <MembershipTicket key={`p${i}`} item={it} booking={b} />)}
        </div>

        {/* What's next */}
        {sessions.length > 0 && (
          <div className="mt-8 card card-accent">
            <h2 className="text-lg font-bold text-slate-900">Before you arrive</h2>
            <div className="mt-4 grid sm:grid-cols-3 gap-4">
              {[
                [Timer, 'Arrive 10 minutes early', 'Time to check in, change and warm up.'],
                [Shirt, 'Bring the essentials', 'Towel, water bottle and clean indoor shoes.'],
                [QrCode, 'Show your booking number', `Give ${b.booking_no} at reception to check in.`],
              ].map(([Icon, t, d]) => (
                <div key={t} className="flex gap-3 rounded-2xl bg-[#f4f7fb] p-4">
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-cyan-500/25"><Icon className="w-5 h-5 text-white" /></span>
                  <div><p className="font-bold text-slate-900 text-sm">{t}</p><p className="text-xs text-slate-500 mt-0.5">{d}</p></div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500">Need to reschedule? Call us at least 12 hours before your session.</p>
          </div>
        )}

        {/* Receipt + summary */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 items-start">
          <div className="card">
            <h2 className="text-lg font-bold text-slate-900">Payment receipt</h2>
            <dl className="mt-3 divide-y divide-slate-100 text-sm">
              {receipt.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2.5"><dt className="text-slate-500">{k}</dt><dd className="font-semibold text-slate-900 text-right break-all">{v}</dd></div>
              ))}
            </dl>
            <div className="mt-4 rounded-xl bg-[#f4f7fb] border border-slate-200 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">{gym.name}</p>
              <p className="mt-1">{gym.address}</p>
              <p className="mt-2 flex flex-wrap gap-4">
                <a href={gym.phoneHref} className="flex items-center gap-1.5 hover:text-cyan-700"><Phone className="w-4 h-4 text-cyan-600" />{gym.phone}</a>
                <a href={`mailto:${gym.email}`} className="flex items-center gap-1.5 hover:text-cyan-700"><Mail className="w-4 h-4 text-cyan-600" />{gym.email}</a>
              </p>
            </div>
          </div>
          <OrderSummary items={b.items} totals={b} title="Order summary" />
        </div>

        <div className="mt-10 text-center print:hidden">
          <Link to="/book" className="inline-flex items-center gap-2 font-semibold text-cyan-700 hover:text-cyan-800">Book another class <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>
    </section>
  );
}
