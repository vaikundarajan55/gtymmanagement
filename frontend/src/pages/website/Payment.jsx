import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Smartphone, CreditCard, Landmark, Wallet, CalendarClock, Clock3, Lock, Loader2, ShieldCheck, FlaskConical, Copy, CircleAlert, BadgeCheck
} from 'lucide-react';
import api from '../../services/api';
import { useGym, inr } from '../../hooks/useSiteData';
import OrderSummary from '../../components/website/OrderSummary';
import { Steps } from '../../components/website/CheckoutSteps';
import DummyGateway from '../../components/website/DummyGateway';

// `method` is passed to Razorpay Checkout as the preferred tab; every method stays available inside it
const METHODS = [
  { id: 'upi', label: 'UPI', hint: 'GPay, PhonePe, Paytm, BHIM', icon: Smartphone, tone: 'from-emerald-500 to-emerald-700' },
  { id: 'card', label: 'Cards', hint: 'Visa, Mastercard, RuPay, Amex', icon: CreditCard, tone: 'from-blue-500 to-blue-700' },
  { id: 'netbanking', label: 'Net Banking', hint: 'All major Indian banks', icon: Landmark, tone: 'from-violet-500 to-purple-700' },
  { id: 'wallet', label: 'Wallets', hint: 'Paytm, PhonePe, Amazon Pay', icon: Wallet, tone: 'from-orange-400 to-amber-700' },
  { id: 'emi', label: 'EMI', hint: 'Card & cardless EMI', icon: CalendarClock, tone: 'from-cyan-400 to-teal-600' },
  { id: 'paylater', label: 'Pay Later', hint: 'Simpl, LazyPay & more', icon: Clock3, tone: 'from-rose-400 to-red-600' },
];

// Razorpay test-mode credentials (https://razorpay.com/docs/payments/payments/test-card-details/)
const TEST_DATA = [
  ['UPI (success)', 'success@razorpay'],
  ['UPI (failure)', 'failure@razorpay'],
  ['Card number', '4111 1111 1111 1111'],
  ['Expiry / CVV', 'Any future date / any 3 digits'],
  ['OTP (if asked)', 'Any 4–6 digits, then click Success'],
  ['Net banking / Wallet', 'Pick any, then click Success or Failure'],
];

const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const s = document.createElement('script');
  s.src = 'https://checkout.razorpay.com/v1/checkout.js';
  s.onload = () => resolve(true);
  s.onerror = () => resolve(false);
  document.body.appendChild(s);
});

export default function Payment() {
  const { publicId } = useParams();
  const navigate = useNavigate();
  const gym = useGym();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);
  const [method, setMethod] = useState('upi');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    api.get(`/bookings/public/${publicId}`)
      .then(({ data }) => {
        if (data.status === 'paid') navigate(`/payment/${publicId}/status`, { replace: true });
        else setBooking(data);
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load this booking'));
    loadRazorpay(); // warm up the script
  }, [publicId]);

  const pay = async () => {
    if (!booking.razorpay_key_id || !booking.razorpay_order_id) return toast.error('Online payment is not available right now');
    setPaying(true);
    if (!(await loadRazorpay())) {
      setPaying(false);
      return toast.error('Could not reach Razorpay. Check your internet connection.');
    }

    const rzp = new window.Razorpay({
      key: booking.razorpay_key_id,
      order_id: booking.razorpay_order_id,
      amount: Math.round(Number(booking.total) * 100),
      currency: 'INR',
      name: gym.name,
      description: `Booking ${booking.booking_no}`,
      prefill: {
        name: booking.customer_name, email: booking.customer_email, contact: booking.customer_phone,
        ...(method !== 'paylater' ? { method } : {}),
      },
      notes: { booking_no: booking.booking_no },
      theme: { color: '#0891b2' },
      handler: async (resp) => {
        try {
          await api.post('/bookings/verify', { public_id: publicId, ...resp });
        } catch (err) {
          toast.error(err.response?.data?.message || 'We could not verify the payment');
        }
        navigate(`/payment/${publicId}/status`, { replace: true });
      },
      modal: {
        ondismiss: () => { setPaying(false); toast('Payment cancelled. You can try again any time.'); },
      },
    });

    rzp.on('payment.failed', async (resp) => {
      await api.post('/bookings/failed', {
        public_id: publicId,
        reason: resp.error?.description || resp.error?.reason || 'Payment failed',
        razorpay_payment_id: resp.error?.metadata?.payment_id,
      }).catch(() => {});
      rzp.close();
      navigate(`/payment/${publicId}/status`, { replace: true });
    });

    rzp.open();
  };

  // Demo gateway reports the simulated outcome; the server decides the final status
  const dummyPay = async ({ method, outcome, detail }) => {
    try {
      await api.post('/bookings/dummy-pay', { public_id: publicId, method, outcome, detail });
      navigate(`/payment/${publicId}/status`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment could not be completed');
      throw err;
    }
  };

  const copy = (v) => { navigator.clipboard?.writeText(v).then(() => toast.success('Copied'), () => {}); };

  if (error) {
    return (
      <section className="max-w-xl mx-auto px-4 py-24 text-center">
        <CircleAlert className="w-12 h-12 mx-auto text-rose-500" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">{error}</h1>
        <Link to="/book" className="btn-primary mt-6">Back to booking</Link>
      </section>
    );
  }
  if (!booking) return <div className="py-32 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>;

  const testMode = String(booking.razorpay_key_id || '').startsWith('rzp_test_');

  return (
    <section className="bg-[#f4f7fb] min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <Steps current={3} />
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Payment</h1>
            <p className="text-slate-500 mt-1">Booking <b className="text-slate-800">{booking.booking_no}</b> · {booking.customer_name}</p>
          </div>
          {booking.status === 'failed' && (
            <span className="badge-danger normal-case">Last attempt failed{booking.failure_reason ? `: ${booking.failure_reason}` : ''}</span>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px] items-start">
          {booking.gateway === 'dummy' ? (
            <DummyGateway booking={booking} gymName={gym.name} onPay={dummyPay} />
          ) : (
          <div className="space-y-6">
            <div className="card card-accent p-7">
              <h2 className="text-xl font-bold text-slate-900">Choose a payment method</h2>
              <p className="text-sm text-slate-500 mt-1">All methods are processed securely by Razorpay. You can still switch methods in the next window.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {METHODS.map(({ id, label, hint, icon: Icon, tone }) => {
                  const on = method === id;
                  return (
                    <button key={id} type="button" onClick={() => setMethod(id)} aria-pressed={on}
                      className={`relative flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all
                        ${on ? 'border-cyan-500 bg-cyan-50/60 shadow-md shadow-cyan-500/10' : 'border-slate-200 bg-white hover:border-cyan-300'}`}>
                      <span className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tone} flex items-center justify-center shadow-md flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-bold text-slate-900">{label}</span>
                        <span className="block text-xs text-slate-500 truncate">{hint}</span>
                      </span>
                      {on && <BadgeCheck className="absolute top-2 right-2 w-5 h-5 text-cyan-600" />}
                    </button>
                  );
                })}
              </div>

              <button onClick={pay} disabled={paying} className="btn-primary w-full mt-7 py-4 text-base disabled:opacity-60">
                {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                {paying ? 'Opening secure payment…' : `Pay ${inr(booking.total)} securely`}
              </button>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> PCI-DSS compliant</span>
                <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-emerald-500" /> 256-bit encryption</span>
                <span>Powered by <b className="text-slate-700">Razorpay</b></span>
              </div>
            </div>

            {testMode && (
              <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-6">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-amber-900">Test mode: no real money is charged</h3>
                </div>
                <p className="mt-1 text-sm text-amber-800">Use these Razorpay test details in the payment window:</p>
                <dl className="mt-4 grid sm:grid-cols-2 gap-2">
                  {TEST_DATA.map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-3 rounded-xl bg-white/80 border border-amber-200 px-3 py-2">
                      <div className="min-w-0">
                        <dt className="text-[11px] font-bold uppercase tracking-wider text-amber-700">{k}</dt>
                        <dd className="font-mono text-sm text-slate-800 truncate">{v}</dd>
                      </div>
                      {!v.startsWith('Any') && !v.startsWith('Pick') && (
                        <button type="button" onClick={() => copy(v.replace(/\s/g, ''))} className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-100" aria-label={`Copy ${k}`}>
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>

          )}

          <div className="lg:sticky lg:top-28">
            <OrderSummary items={booking.items} totals={booking} title="Booking summary" />
          </div>
        </div>
      </div>
    </section>
  );
}
