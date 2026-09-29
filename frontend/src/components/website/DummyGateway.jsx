import { useEffect, useState } from 'react';
import {
  Smartphone, CreditCard, Landmark, Wallet, ArrowLeft, Loader2, Lock, ShieldCheck, FlaskConical, QrCode, CircleCheck, CircleX, BadgeCheck
} from 'lucide-react';
import { inr } from '../../hooks/useSiteData';

// Demo-only payment gateway ("GymPay"). It mimics a real checkout: choose a method, enter details,
// then approve or decline on a simulated bank/UPI screen. Card numbers never leave the browser;
// only a masked label such as "Visa •••• 1111" is reported to the server.

const METHODS = [
  { id: 'upi', label: 'UPI', hint: 'Google Pay, PhonePe, Paytm, BHIM', icon: Smartphone, tone: 'from-emerald-500 to-emerald-700' },
  { id: 'card', label: 'Credit / Debit Card', hint: 'Visa, Mastercard, RuPay, Amex', icon: CreditCard, tone: 'from-blue-500 to-blue-700' },
  { id: 'netbanking', label: 'Net Banking', hint: 'All major Indian banks', icon: Landmark, tone: 'from-violet-500 to-purple-700' },
  { id: 'wallet', label: 'Wallets', hint: 'Paytm, PhonePe, Amazon Pay', icon: Wallet, tone: 'from-orange-400 to-amber-700' },
];
const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Canara Bank', 'Bank of Baroda', 'Indian Bank'];
const WALLETS = ['Paytm', 'PhonePe', 'Amazon Pay', 'MobiKwik', 'Freecharge', 'JioMoney'];
export const DEMO_OTP = '123456';

const digits = (v) => v.replace(/\D/g, '');
const luhn = (num) => {
  let sum = 0;
  for (let i = 0; i < num.length; i++) {
    let dgt = +num[num.length - 1 - i];
    if (i % 2) { dgt *= 2; if (dgt > 9) dgt -= 9; }
    sum += dgt;
  }
  return num.length >= 12 && sum % 10 === 0;
};
const cardBrand = (num) => {
  if (/^4/.test(num)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(num)) return 'Mastercard';
  if (/^3[47]/.test(num)) return 'Amex';
  if (/^(60|65|81|82|508)/.test(num)) return 'RuPay';
  return 'Card';
};
const expiryOk = (v) => {
  const m = /^(\d{2})\/(\d{2})$/.exec(v);
  if (!m || +m[1] < 1 || +m[1] > 12) return false;
  const end = new Date(2000 + +m[2], +m[1], 1); // first day after expiry month
  return end > new Date();
};

// Decorative, deterministic QR-like grid (not scannable)
function FakeQr({ seed }) {
  const cells = Array.from({ length: 21 * 21 }, (_, i) => {
    const x = i % 21, y = Math.floor(i / 21);
    const finder = (a, b) => x >= a && x < a + 7 && y >= b && y < b + 7;
    if (finder(0, 0) || finder(14, 0) || finder(0, 14)) {
      const lx = x % 14 === x ? x : x - 14, ly = y % 14 === y ? y : y - 14;
      const r = Math.max(Math.abs(lx - 3), Math.abs(ly - 3));
      return r !== 2;
    }
    return ((x * 31 + y * 17 + seed.charCodeAt((x + y) % seed.length)) % 7) < 3;
  });
  return (
    <svg viewBox="0 0 21 21" className="w-44 h-44" shapeRendering="crispEdges" aria-label="Demo QR code">
      <rect width="21" height="21" fill="#fff" />
      {cells.map((on, i) => on && <rect key={i} x={i % 21} y={Math.floor(i / 21)} width="1" height="1" fill="#0f172a" />)}
    </svg>
  );
}

export default function DummyGateway({ booking, gymName, onPay }) {
  const [step, setStep] = useState('select'); // select → details → processing → authorize → submitting
  const [method, setMethod] = useState(null);
  const [upi, setUpi] = useState({ mode: 'id', id: '' });
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: booking.customer_name || '' });
  const [bank, setBank] = useState('');
  const [wallet, setWallet] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [seconds, setSeconds] = useState(0);

  const num = digits(card.number);
  const detail = method === 'card' ? `${cardBrand(num)} •••• ${num.slice(-4)}`
    : method === 'upi' ? (upi.mode === 'qr' ? 'UPI QR' : `UPI ${upi.id}`)
      : method === 'netbanking' ? bank : method === 'wallet' ? `${wallet} Wallet` : '';

  useEffect(() => {
    if (step !== 'processing') return;
    const t = setTimeout(() => setStep('authorize'), 1600);
    return () => clearTimeout(t);
  }, [step]);

  // UPI collect request countdown
  useEffect(() => {
    if (step !== 'authorize' || method !== 'upi') return;
    setSeconds(300);
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [step, method]);

  const validate = () => {
    if (method === 'upi' && upi.mode === 'id' && !/^[\w.-]{2,}@[a-z]{2,}$/i.test(upi.id.trim())) return 'Enter a valid UPI ID, e.g. name@okaxis';
    if (method === 'card') {
      if (!luhn(num)) return 'Card number is not valid. Try 4111 1111 1111 1111';
      if (!expiryOk(card.expiry)) return 'Enter a valid future expiry (MM/YY)';
      if (!/^\d{3,4}$/.test(card.cvv)) return 'Enter the 3 or 4 digit CVV';
      if (card.name.trim().length < 2) return 'Enter the name on the card';
    }
    if (method === 'netbanking' && !bank) return 'Select your bank';
    if (method === 'wallet' && !wallet) return 'Select a wallet';
    return '';
  };

  const pay = (e) => {
    e?.preventDefault();
    const msg = validate();
    setError(msg);
    if (!msg) setStep('processing');
  };

  const finish = async (outcome) => {
    if (outcome === 'success' && method === 'card' && otp !== DEMO_OTP) return setError(`Incorrect OTP. The demo OTP is ${DEMO_OTP}.`);
    setError('');
    setStep('submitting');
    try {
      await onPay({ method, outcome, detail });
    } catch {
      setStep('authorize');
    }
  };

  const reset = () => { setStep('select'); setMethod(null); setError(''); setOtp(''); };

  const Header = (
    <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-cyan-900 px-6 py-5 text-white">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {step !== 'select' && !['processing', 'submitting'].includes(step) && (
            <button type="button" onClick={step === 'authorize' ? () => setStep('details') : reset} className="p-1.5 -ml-1.5 rounded-lg hover:bg-white/10" aria-label="Back"><ArrowLeft className="w-5 h-5" /></button>
          )}
          <div>
            <p className="font-bold flex items-center gap-2">GymPay <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-slate-900">DEMO</span></p>
            <p className="text-xs text-cyan-100">{gymName} · {booking.booking_no}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-cyan-100">Amount</p>
          <p className="text-xl font-bold font-[Space_Grotesk]">{inr(booking.total)}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
        {Header}
        <div className="p-6 min-h-[340px]">
          {error && <p className="mb-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-sm text-rose-700">{error}</p>}

          {step === 'select' && (
            <>
              <p className="text-sm font-bold text-slate-900 mb-3">Choose a payment method</p>
              <div className="space-y-3">
                {METHODS.map(({ id, label, hint, icon: Icon, tone }) => (
                  <button key={id} type="button" onClick={() => { setMethod(id); setStep('details'); setError(''); }}
                    className="w-full flex items-center gap-4 rounded-2xl border-2 border-slate-200 p-4 text-left hover:border-cyan-400 hover:bg-cyan-50/40 transition-all">
                    <span className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tone} flex items-center justify-center shadow-md`}><Icon className="w-5 h-5 text-white" /></span>
                    <span className="flex-1"><span className="block font-bold text-slate-900">{label}</span><span className="block text-xs text-slate-500">{hint}</span></span>
                    <ArrowLeft className="w-4 h-4 rotate-180 text-slate-400" />
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 'details' && method === 'upi' && (
            <form onSubmit={pay} className="space-y-5">
              <div className="inline-flex rounded-xl bg-slate-100 p-1">
                {[['id', 'UPI ID'], ['qr', 'Scan QR']].map(([k, l]) => (
                  <button key={k} type="button" onClick={() => setUpi({ ...upi, mode: k })}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold ${upi.mode === k ? 'bg-white text-blue-700 shadow' : 'text-slate-500'}`}>{l}</button>
                ))}
              </div>
              {upi.mode === 'id' ? (
                <label className="block">
                  <span className="text-sm font-medium text-slate-600">UPI ID</span>
                  <input value={upi.id} onChange={(e) => setUpi({ ...upi, id: e.target.value })} autoFocus placeholder="yourname@okaxis" className="input-field mt-1.5" />
                  <span className="mt-1.5 block text-xs text-slate-500">A payment request will be sent to your UPI app.</span>
                </label>
              ) : (
                <div className="flex flex-col items-center gap-3 rounded-2xl bg-[#f4f7fb] border border-slate-200 p-5">
                  <div className="rounded-xl bg-white p-2 shadow"><FakeQr seed={booking.booking_no} /></div>
                  <p className="text-sm text-slate-600 text-center">Scan with any UPI app to pay {inr(booking.total)}<br /><span className="text-xs text-slate-400">(demo QR, not scannable)</span></p>
                </div>
              )}
              <button type="submit" className="btn-primary w-full py-3.5"><Lock className="w-4 h-4" /> {upi.mode === 'qr' ? "I've scanned the QR" : `Pay ${inr(booking.total)}`}</button>
            </form>
          )}

          {step === 'details' && method === 'card' && (
            <form onSubmit={pay} className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-600">Card number</span>
                <span className="relative block mt-1.5">
                  <input value={card.number} autoFocus inputMode="numeric" autoComplete="off" placeholder="4111 1111 1111 1111"
                    onChange={(e) => setCard({ ...card, number: digits(e.target.value).slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ') })}
                    className="input-field pr-24 font-mono tracking-wider" />
                  {num.length >= 2 && <span className="absolute right-3 top-1/2 -translate-y-1/2 badge-info normal-case">{cardBrand(num)}</span>}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-600">Expiry</span>
                  <input value={card.expiry} inputMode="numeric" autoComplete="off" placeholder="MM/YY"
                    onChange={(e) => { const d = digits(e.target.value).slice(0, 4); setCard({ ...card, expiry: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d }); }}
                    className="input-field mt-1.5 font-mono" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-600">CVV</span>
                  <input value={card.cvv} type="password" inputMode="numeric" autoComplete="off" placeholder="•••"
                    onChange={(e) => setCard({ ...card, cvv: digits(e.target.value).slice(0, 4) })} className="input-field mt-1.5 font-mono" />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-slate-600">Name on card</span>
                <input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} autoComplete="off" className="input-field mt-1.5" />
              </label>
              <button type="submit" className="btn-primary w-full py-3.5"><Lock className="w-4 h-4" /> Pay {inr(booking.total)}</button>
            </form>
          )}

          {step === 'details' && (method === 'netbanking' || method === 'wallet') && (
            <form onSubmit={pay} className="space-y-5">
              <p className="text-sm font-bold text-slate-900">{method === 'netbanking' ? 'Select your bank' : 'Select a wallet'}</p>
              <div className="grid grid-cols-2 gap-3">
                {(method === 'netbanking' ? BANKS : WALLETS).map((name) => {
                  const on = (method === 'netbanking' ? bank : wallet) === name;
                  return (
                    <button key={name} type="button" onClick={() => (method === 'netbanking' ? setBank(name) : setWallet(name))}
                      className={`flex items-center gap-2 rounded-xl border-2 px-3 py-3 text-left text-sm font-semibold transition-all ${on ? 'border-cyan-500 bg-cyan-50 text-slate-900' : 'border-slate-200 text-slate-600 hover:border-cyan-300'}`}>
                      <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">{name.split(' ').map((w) => w[0]).join('').slice(0, 3)}</span>
                      <span className="truncate">{name}</span>
                      {on && <BadgeCheck className="w-4 h-4 text-cyan-600 ml-auto flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <button type="submit" className="btn-primary w-full py-3.5"><Lock className="w-4 h-4" /> Pay {inr(booking.total)}</button>
            </form>
          )}

          {step === 'processing' && (
            <div className="py-16 flex flex-col items-center text-center">
              <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
              <p className="mt-4 font-bold text-slate-900">Processing payment…</p>
              <p className="text-sm text-slate-500">Connecting to {detail}. Please don't refresh.</p>
            </div>
          )}

          {step === 'authorize' && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-[#f4f7fb] p-5 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {method === 'upi' ? 'UPI payment request' : method === 'card' ? '3-D Secure verification' : method === 'wallet' ? `${wallet} wallet` : `${bank} net banking`}
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{inr(booking.total)}</p>
                <p className="text-sm text-slate-500">to {gymName}</p>
                {method === 'upi' && <p className="mt-3 text-sm text-slate-600">Approve the request in your UPI app. Expires in <b>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</b></p>}
              </div>
              {method === 'card' && (
                <label className="block">
                  <span className="text-sm font-medium text-slate-600">Enter the OTP sent to your mobile</span>
                  <input value={otp} onChange={(e) => setOtp(digits(e.target.value).slice(0, 6))} autoFocus inputMode="numeric" placeholder="••••••"
                    className="input-field mt-1.5 text-center text-2xl tracking-[0.5em] font-mono" />
                  <span className="mt-1.5 block text-xs text-amber-700">Demo OTP: <b>{DEMO_OTP}</b></span>
                </label>
              )}
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => finish('failure')} className="btn-secondary py-3.5 !text-rose-600 hover:!border-rose-300"><CircleX className="w-4 h-4" /> {method === 'upi' ? 'Decline' : 'Fail payment'}</button>
                <button type="button" onClick={() => finish('success')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-emerald-500/25 hover:brightness-110">
                  <CircleCheck className="w-4 h-4" /> {method === 'upi' ? 'Approve' : method === 'card' ? 'Verify & pay' : 'Success'}
                </button>
              </div>
            </div>
          )}

          {step === 'submitting' && (
            <div className="py-16 flex flex-col items-center text-center">
              <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
              <p className="mt-4 font-bold text-slate-900">Confirming with the gym…</p>
            </div>
          )}
        </div>
        <div className="border-t border-slate-100 px-6 py-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Secured demo checkout</span>
          <span className="flex items-center gap-1.5"><QrCode className="w-4 h-4 text-cyan-600" /> UPI · Cards · Net Banking · Wallets</span>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">
        <p className="flex items-center gap-2 font-bold"><FlaskConical className="w-4 h-4" /> Demo payment gateway: no real money is charged</p>
        <ul className="mt-2 space-y-1 text-amber-800 list-disc pl-5">
          <li>UPI: any ID like <code className="font-mono">test@okaxis</code>, then Approve or Decline</li>
          <li>Card: <code className="font-mono">4111 1111 1111 1111</code>, any future expiry, any CVV, OTP <code className="font-mono">{DEMO_OTP}</code></li>
          <li>Net banking / wallet: pick any, then Success or Fail payment</li>
        </ul>
      </div>
    </div>
  );
}
