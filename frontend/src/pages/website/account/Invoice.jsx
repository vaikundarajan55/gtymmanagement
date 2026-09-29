import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, Loader2, Zap, CircleAlert } from 'lucide-react';
import { inr } from '../../../hooks/useSiteData';
import { METHOD_LABEL } from '../../../data/booking';
import { useMyBooking } from './BookingDetail';

const d = (v) => (v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

// Rupees in words for the invoice footer (Indian numbering: crore, lakh, thousand)
const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const below1000 = (n) => {
  const h = Math.floor(n / 100), r = n % 100;
  const rest = r < 20 ? ONES[r] : `${TENS[Math.floor(r / 10)]}${r % 10 ? ` ${ONES[r % 10]}` : ''}`;
  return [h ? `${ONES[h]} Hundred` : '', rest].filter(Boolean).join(' ');
};
const inWords = (amount) => {
  let n = Math.floor(amount);
  const paise = Math.round((amount - n) * 100);
  const parts = [];
  for (const [div, name] of [[10000000, 'Crore'], [100000, 'Lakh'], [1000, 'Thousand']]) {
    if (n >= div) { parts.push(`${below1000(Math.floor(n / div))} ${name}`); n %= div; }
  }
  if (n) parts.push(below1000(n));
  return `Rupees ${parts.join(' ') || 'Zero'}${paise ? ` and ${below1000(paise)} Paise` : ''} Only`;
};

export default function Invoice() {
  const { bookingNo } = useParams();
  const { booking: b, error } = useMyBooking(bookingNo);

  if (error) return <div className="card text-center py-14"><p className="font-semibold text-slate-800">{error}</p><Link to="/account/bookings" className="btn-secondary mt-5">Back to bookings</Link></div>;
  if (!b) return <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>;
  if (b.status !== 'paid') {
    return (
      <div className="card text-center py-14">
        <CircleAlert className="w-10 h-10 mx-auto text-amber-500" />
        <p className="mt-3 font-semibold text-slate-800">An invoice is available once the booking is paid.</p>
        <Link to={`/payment/${b.public_id}`} className="btn-primary mt-5">Complete payment</Link>
      </div>
    );
  }

  const half = Math.round((Number(b.tax) / 2) * 100) / 100; // intra-state GST: CGST 9% + SGST 9%
  const invoiceNo = `INV-${b.booking_no}`;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link to={`/account/bookings/${b.booking_no}`} className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700"><ArrowLeft className="w-4 h-4" /> Booking details</Link>
        <button onClick={() => window.print()} className="btn-primary"><Printer className="w-4 h-4" /> Print / Save as PDF</button>
      </div>

      <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:border-0 print:shadow-none print:rounded-none">
        <div className="brand-gradient h-2 print:[print-color-adjust:exact]" />
        <div className="p-8 md:p-10">
          {/* Header */}
          <header className="flex flex-wrap justify-between gap-6">
            <div className="flex items-start gap-3">
              <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 flex items-center justify-center print:[print-color-adjust:exact]"><Zap className="w-6 h-6 text-white" /></span>
              <div>
                <p className="text-xl font-bold text-slate-900 font-[Space_Grotesk]">{b.gym.name}</p>
                <p className="text-sm text-slate-500 max-w-xs">{b.gym.address}</p>
                <p className="text-sm text-slate-500">{b.gym.phone} · {b.gym.email}</p>
                {b.gym.gstin && <p className="text-sm font-semibold text-slate-700 mt-1">GSTIN: {b.gym.gstin}</p>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-slate-900 font-[Space_Grotesk] tracking-tight">TAX INVOICE</p>
              <dl className="mt-2 text-sm">
                <div><dt className="inline text-slate-500">Invoice no: </dt><dd className="inline font-bold text-slate-900">{invoiceNo}</dd></div>
                <div><dt className="inline text-slate-500">Invoice date: </dt><dd className="inline font-semibold">{d(b.paid_at)}</dd></div>
                <div><dt className="inline text-slate-500">Booking no: </dt><dd className="inline font-semibold">{b.booking_no}</dd></div>
              </dl>
              <span className="mt-2 inline-block badge-success print:[print-color-adjust:exact]">Paid</span>
            </div>
          </header>

          {/* Parties */}
          <div className="mt-8 grid sm:grid-cols-2 gap-6 rounded-2xl bg-[#f4f7fb] p-5 print:[print-color-adjust:exact]">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Billed to</p>
              <p className="mt-1 font-bold text-slate-900">{b.customer_name}</p>
              {b.billing_address && <p className="text-sm text-slate-600">{b.billing_address}</p>}
              <p className="text-sm text-slate-600">{b.customer_email}</p>
              <p className="text-sm text-slate-600">{b.customer_phone}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment</p>
              <p className="mt-1 font-semibold text-slate-900">{METHOD_LABEL[b.payment_method] || b.payment_method} via {b.gateway === 'dummy' ? 'GymPay (demo)' : 'Razorpay'}</p>
              <p className="text-sm text-slate-600 font-mono break-all">{b.payment_id}</p>
              <p className="text-sm text-slate-600">{new Date(b.paid_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>
          </div>

          {/* Lines */}
          <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="th-gradient print:[print-color-adjust:exact]">
                  {['#', 'Description', 'SAC', 'Qty', 'Rate', 'Amount'].map((h, i) => <th key={h} className={`th-cell ${i >= 3 ? 'text-right' : ''}`}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {b.items.map((it, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{it.title}</p>
                      <p className="text-xs text-slate-500">{it.item_type === 'plan' ? 'Gym membership' : `Class session · ${d(it.session_date)} ${it.time_slot}`}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500">999723</td>
                    <td className="px-4 py-3 text-right">{it.qty}</td>
                    <td className="px-4 py-3 text-right">{inr(it.unit_price)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">{inr(it.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-6 flex flex-wrap justify-between gap-6">
            <p className="text-sm text-slate-600 max-w-sm"><span className="font-semibold text-slate-800">Amount in words:</span><br />{inWords(Number(b.total))}</p>
            <dl className="w-full sm:w-72 text-sm space-y-2">
              <div className="flex justify-between"><dt className="text-slate-500">Taxable value</dt><dd className="font-semibold">{inr(b.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">CGST @ 9%</dt><dd className="font-semibold">{inr(half)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">SGST @ 9%</dt><dd className="font-semibold">{inr(Number(b.tax) - half)}</dd></div>
              <div className="flex justify-between border-t-2 border-slate-900 pt-2"><dt className="font-bold text-slate-900">Total paid</dt><dd className="text-lg font-bold text-slate-900">{inr(b.total)}</dd></div>
            </dl>
          </div>

          <footer className="mt-10 pt-6 border-t border-slate-200 flex flex-wrap justify-between gap-4 text-xs text-slate-500">
            <p>This is a computer-generated invoice and does not require a signature.<br />Thank you for training with {b.gym.name}!</p>
            <p className="text-right">SAC 999723: Physical well-being services<br />(sports & fitness centres)</p>
          </footer>
        </div>
      </article>
    </div>
  );
}
