import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { CircleCheck, CircleX, Clock3, Loader2, Printer, RotateCcw, CalendarDays, Mail, Phone } from 'lucide-react';
import api from '../../services/api';
import { useGym, inr } from '../../hooks/useSiteData';
import { clearCart } from '../../store/slices/cartSlice';
import OrderSummary from '../../components/website/OrderSummary';
import { Steps } from '../../components/website/CheckoutSteps';
import BookingConfirmed from '../../components/website/BookingConfirmed';

const METHOD_LABEL = { upi: 'UPI', card: 'Card', netbanking: 'Net Banking', wallet: 'Wallet', emi: 'EMI', paylater: 'Pay Later', cardless_emi: 'Cardless EMI' };

// Shows the server's view of the booking, so refreshing or sharing the link never lies about payment
export default function PaymentStatus() {
  const { publicId } = useParams();
  const dispatch = useDispatch();
  const gym = useGym();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/bookings/public/${publicId}`)
      .then(({ data }) => {
        setBooking(data);
        if (data.status === 'paid') dispatch(clearCart());
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load this booking'));
  }, [publicId]);

  if (error) return <p className="py-32 text-center text-rose-600">{error}</p>;
  if (!booking) return <div className="py-32 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>;
  if (booking.status === 'paid') return <BookingConfirmed booking={booking} gym={gym} />;

  const paid = booking.status === 'paid';
  const failed = booking.status === 'failed';
  const hero = paid
    ? { icon: CircleCheck, tone: 'from-emerald-500 to-teal-600 shadow-emerald-500/30', title: 'Payment successful!', text: `Your booking is confirmed. A copy of these details is saved under booking ${booking.booking_no}.` }
    : failed
      ? { icon: CircleX, tone: 'from-rose-500 to-red-600 shadow-rose-500/30', title: 'Payment failed', text: booking.failure_reason || 'The payment did not go through. No money was taken; you can try again.' }
      : { icon: Clock3, tone: 'from-amber-400 to-orange-600 shadow-amber-500/30', title: 'Payment not completed', text: 'This booking is waiting for payment.' };

  const rows = [
    ['Booking number', booking.booking_no],
    ['Status', <span key="s" className={paid ? 'badge-success' : failed ? 'badge-danger' : 'badge-warn'}>{booking.status}</span>],
    ['Amount', inr(booking.total)],
    ...(paid ? [
      ['Payment ID', <span key="p" className="font-mono text-xs">{booking.razorpay_payment_id}</span>],
      ['Paid via', METHOD_LABEL[booking.payment_method] || booking.payment_method || '—'],
      ['Paid on', new Date(booking.paid_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })],
    ] : []),
    ['Name', booking.customer_name],
    ['Email', booking.customer_email],
    ['Mobile', booking.customer_phone],
  ];

  return (
    <section className="bg-[#f4f7fb] min-h-[70vh] print:bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="print:hidden"><Steps current={paid ? 5 : 3} /></div>

        <div className="mt-8 card card-accent p-8 text-center">
          <div className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${hero.tone} shadow-xl flex items-center justify-center animate-slide-up`}>
            <hero.icon className="w-10 h-10 text-white" />
          </div>
          <h1 className="mt-5 text-3xl font-bold text-slate-900">{hero.title}</h1>
          <p className="mt-2 text-slate-500 max-w-xl mx-auto">{hero.text}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
            {paid ? (
              <>
                <button onClick={() => window.print()} className="btn-secondary"><Printer className="w-4 h-4" /> Print receipt</button>
                <Link to="/book" className="btn-primary"><CalendarDays className="w-4 h-4" /> Book another class</Link>
              </>
            ) : (
              <>
                <Link to={`/payment/${publicId}`} className="btn-primary"><RotateCcw className="w-4 h-4" /> {failed ? 'Try again' : 'Complete payment'}</Link>
                <Link to="/cart" className="btn-secondary">Back to cart</Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-2 items-start">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900">{paid ? 'Receipt' : 'Booking details'}</h2>
            <dl className="mt-4 divide-y divide-slate-100 text-sm">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="font-semibold text-slate-900 text-right break-all">{v}</dd>
                </div>
              ))}
            </dl>
            {paid && (
              <div className="mt-5 rounded-xl bg-[#f4f7fb] border border-slate-200 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">{gym.name}</p>
                <p className="mt-1">{gym.address}</p>
                <p className="mt-2 flex flex-wrap gap-4">
                  <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-cyan-600" />{gym.phone}</span>
                  <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-cyan-600" />{gym.email}</span>
                </p>
              </div>
            )}
          </div>
          <OrderSummary items={booking.items} totals={booking} title="Items" />
        </div>
      </div>
    </section>
  );
}
