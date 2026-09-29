import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import customerApi, { errorMessage } from '../../services/customerApi';
import { RequireCustomer } from './account/AccountLayout';
import toast from 'react-hot-toast';
import { Loader2, Lock, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useCatalog } from '../../hooks/useSiteData';
import OrderSummary, { PaymentsOffNotice } from '../../components/website/OrderSummary';
import { Steps } from '../../components/website/CheckoutSteps';

export default function Checkout() {
  return <RequireCustomer><CheckoutForm /></RequireCustomer>;
}

function CheckoutForm() {
  const items = useSelector((s) => s.cart.items);
  const { customer } = useSelector((s) => s.customer);
  const { gstRate, paymentsEnabled, loading } = useCatalog();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => ({ name: customer?.name || '', email: customer?.email || '', phone: customer?.phone || '', notes: '' }));
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (!items.length) return <Navigate to="/cart" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!agree) return toast.error('Please accept the booking terms');
    setSubmitting(true);
    try {
      const { data } = await customerApi.post('/bookings', {
        customer: form,
        items: items.map((i) => (i.type === 'plan'
          ? { type: 'plan', plan: i.plan }
          : { type: 'class', class_id: i.classId, date: i.date, time: i.time, qty: i.qty })),
      });
      navigate(`/payment/${data.public_id}`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not create your booking. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-[#f4f7fb] min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <Steps current={2} />
        <h1 className="mt-8 text-3xl font-bold text-slate-900">Checkout</h1>
        <p className="text-slate-500 mt-1 mb-8">Booking as <b className="text-slate-700">{customer?.email}</b>. It will appear under My Account → My Bookings.</p>

        <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_400px] items-start">
          <div className="card card-accent p-7 md:p-9 space-y-5">
            <h2 className="text-xl font-bold text-slate-900">Contact details</h2>
            <label className="block">
              <span className="text-sm font-medium text-slate-600">Full name <span className="text-rose-500">*</span></span>
              <input value={form.name} onChange={set('name')} required minLength={2} autoComplete="name" className="input-field mt-1.5" placeholder="Your full name" />
            </label>
            <div className="grid sm:grid-cols-2 gap-5">
              <label className="block">
                <span className="text-sm font-medium text-slate-600">Email <span className="text-rose-500">*</span></span>
                <input type="email" value={form.email} onChange={set('email')} required autoComplete="email" className="input-field mt-1.5" placeholder="you@email.com" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-600">Mobile number <span className="text-rose-500">*</span></span>
                <input type="tel" value={form.phone} onChange={set('phone')} required pattern="\+?[\d\s-]{10,18}" autoComplete="tel" className="input-field mt-1.5" placeholder="98765 43210" />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-slate-600">Notes for the trainer</span>
              <textarea value={form.notes} onChange={set('notes')} rows={3} maxLength={500} className="input-field mt-1.5 resize-none" placeholder="Injuries, fitness level or anything we should know (optional)" />
            </label>
            <label className="flex items-start gap-3 rounded-xl bg-[#f4f7fb] border border-slate-200 p-4 cursor-pointer">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 w-4 h-4 accent-cyan-600" />
              <span className="text-sm text-slate-600">
                I agree to the booking terms: sessions can be rescheduled up to 12 hours before start time; arrive 10 minutes early with a towel and water bottle.
              </span>
            </label>
            <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-800"><ArrowLeft className="w-4 h-4" /> Back to cart</Link>
          </div>

          <div className="space-y-4 lg:sticky lg:top-28">
            <OrderSummary items={items} gstRate={gstRate}>
              <button type="submit" disabled={submitting || (!loading && !paymentsEnabled)} className="btn-primary w-full mt-6 py-3.5 disabled:opacity-50">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {submitting ? 'Creating booking…' : 'Continue to payment'}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Final prices are confirmed on the next step</p>
            </OrderSummary>
            {!loading && !paymentsEnabled && <PaymentsOffNotice />}
          </div>
        </form>
      </div>
    </section>
  );
}
