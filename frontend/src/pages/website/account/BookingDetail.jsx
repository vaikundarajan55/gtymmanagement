import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, CreditCard, Loader2, CalendarDays, Clock, Users, Crown, CircleAlert } from 'lucide-react';
import customerApi, { errorMessage } from '../../../services/customerApi';
import { inr } from '../../../hooks/useSiteData';
import { STATUS_BADGE, METHOD_LABEL } from '../../../data/booking';

const dt = (v) => (v ? new Date(v).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

// Loads one of the signed-in customer's bookings (shared by the detail and invoice pages)
export function useMyBooking(bookingNo) {
  const [state, setState] = useState({ booking: null, error: null });
  useEffect(() => {
    customerApi.get(`/customer/bookings/${bookingNo}`)
      .then(({ data }) => setState({ booking: data, error: null }))
      .catch((err) => setState({ booking: null, error: errorMessage(err, 'Could not load this booking') }));
  }, [bookingNo]);
  return state;
}

export default function BookingDetail() {
  const { bookingNo } = useParams();
  const { booking: b, error } = useMyBooking(bookingNo);

  if (error) return <div className="card text-center py-14"><CircleAlert className="w-10 h-10 mx-auto text-rose-500" /><p className="mt-3 font-semibold text-slate-800">{error}</p><Link to="/account/bookings" className="btn-secondary mt-5">Back to bookings</Link></div>;
  if (!b) return <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>;

  const payable = ['pending', 'failed'].includes(b.status);

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/account/bookings" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700"><ArrowLeft className="w-4 h-4" /> My bookings</Link>

      <section className="card card-accent flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Booking</p>
          <h1 className="text-2xl font-bold text-slate-900 font-mono">{b.booking_no}</h1>
          <p className="mt-2 flex items-center gap-2"><span className={STATUS_BADGE[b.status]}>{b.status}</span><span className="text-sm text-slate-500">Booked {dt(b.created_at)}</span></p>
        </div>
        <div className="flex flex-wrap gap-3">
          {b.status === 'paid' && <Link to={`/account/bookings/${b.booking_no}/invoice`} className="btn-primary"><FileText className="w-4 h-4" /> View invoice</Link>}
          {payable && <Link to={`/payment/${b.public_id}`} className="btn-primary"><CreditCard className="w-4 h-4" /> Pay {inr(b.total)}</Link>}
        </div>
      </section>

      {b.status === 'failed' && b.failure_reason && (
        <p className="flex gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700"><CircleAlert className="w-5 h-5 flex-shrink-0" /> Last payment attempt failed: {b.failure_reason}</p>
      )}

      <section className="card">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Items</h2>
        <div className="space-y-3">
          {b.items.map((it, i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${it.item_type === 'plan' ? 'bg-gradient-to-br from-amber-400 to-orange-600' : 'bg-gradient-to-br from-blue-600 to-cyan-500'}`}>
                  {it.item_type === 'plan' ? <Crown className="w-6 h-6 text-white" /> : <CalendarDays className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{it.title}</p>
                  {it.item_type === 'plan' ? <p className="text-sm text-slate-500">Membership plan</p> : (
                    <p className="text-sm text-slate-500 flex flex-wrap gap-x-4">
                      <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4 text-cyan-600" />{new Date(`${it.session_date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-cyan-600" />{it.time_slot}</span>
                      <span className="flex items-center gap-1"><Users className="w-4 h-4 text-cyan-600" />{it.qty} {it.qty > 1 ? 'people' : 'person'}</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">{it.qty} × {inr(it.unit_price)}</p>
                <p className="font-bold text-slate-900">{inr(it.amount)}</p>
              </div>
            </div>
          ))}
        </div>
        <dl className="mt-5 ml-auto max-w-xs space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd className="font-semibold">{inr(b.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">GST (18%)</dt><dd className="font-semibold">{inr(b.tax)}</dd></div>
          <div className="flex justify-between border-t border-slate-200 pt-2"><dt className="font-bold text-slate-900">Total</dt><dd className="text-xl font-bold text-gradient">{inr(b.total)}</dd></div>
        </dl>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Payment</h2>
          <dl className="text-sm divide-y divide-slate-100">
            {[
              ['Gateway', b.gateway === 'dummy' ? 'GymPay (demo)' : 'Razorpay'],
              ['Method', METHOD_LABEL[b.payment_method] || b.payment_method || '—'],
              ['Payment ID', <span key="p" className="font-mono text-xs break-all">{b.payment_id || '—'}</span>],
              ['Paid on', dt(b.paid_at)],
            ].map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-2.5"><dt className="text-slate-500">{k}</dt><dd className="font-semibold text-slate-800 text-right">{v}</dd></div>)}
          </dl>
        </section>
        <section className="card">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Contact on booking</h2>
          <dl className="text-sm divide-y divide-slate-100">
            {[['Name', b.customer_name], ['Email', b.customer_email], ['Mobile', b.customer_phone], ['Notes', b.notes || '—']]
              .map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-2.5"><dt className="text-slate-500">{k}</dt><dd className="font-semibold text-slate-800 text-right break-words">{v}</dd></div>)}
          </dl>
        </section>
      </div>
    </div>
  );
}
