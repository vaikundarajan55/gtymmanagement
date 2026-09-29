import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { img, PROGRAMS } from '../../data/site';
import { useCatalog, inr } from '../../hooks/useSiteData';
import { setQty, removeItem, clearCart, MAX_PEOPLE } from '../../store/slices/cartSlice';
import OrderSummary, { ItemMeta, PaymentsOffNotice } from '../../components/website/OrderSummary';
import { Steps } from '../../components/website/CheckoutSteps';

const imageFor = (item) =>
  item.type === 'plan' ? '1540497077202-7c8a3999166f' : PROGRAMS.find((p) => p.slug === item.slug)?.image || '1534438327276-14e5300c3a48';

export default function Cart() {
  const items = useSelector((s) => s.cart.items);
  const { gstRate, paymentsEnabled, loading } = useCatalog();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <section className="bg-[#f4f7fb] min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <Steps current={1} />
        <div className="flex items-end justify-between flex-wrap gap-4 mt-8 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Your cart</h1>
            <p className="text-slate-500 mt-1">{items.length ? `${items.length} item${items.length > 1 ? 's' : ''} ready for checkout` : 'Nothing here yet'}</p>
          </div>
          {items.length > 0 && <button onClick={() => dispatch(clearCart())} className="text-sm font-semibold text-rose-600 hover:text-rose-700">Clear cart</button>}
        </div>

        {items.length === 0 ? (
          <div className="card text-center py-16">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-cyan-500/30">
              <ShoppingCart className="w-9 h-9 text-white" />
            </div>
            <h2 className="mt-6 text-xl font-bold text-slate-900">Your cart is empty</h2>
            <p className="mt-2 text-slate-500">Book a class session or pick a membership plan to get started.</p>
            <div className="mt-6 flex justify-center gap-3 flex-wrap">
              <Link to="/book" className="btn-primary">Book a class</Link>
              <Link to="/book?tab=plans" className="btn-secondary">View memberships</Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px] items-start">
            <div className="space-y-4">
              {items.map((it) => (
                <div key={it.key} className="card p-4 flex gap-4 items-center">
                  <img src={img(imageFor(it), 240)} alt="" className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-slate-200 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900">{it.name}</p>
                    <ItemMeta item={it} />
                    <p className="mt-1 text-sm text-slate-500">{inr(it.price)} {it.type === 'class' ? 'per person' : ''}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                    {it.type === 'class' && (
                      <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white">
                        <button onClick={() => dispatch(setQty({ key: it.key, qty: it.qty - 1 }))} disabled={it.qty <= 1} className="w-9 h-9 flex items-center justify-center text-slate-600 disabled:opacity-30" aria-label="Fewer people"><Minus className="w-4 h-4" /></button>
                        <span className="w-8 text-center font-bold text-slate-900">{it.qty}</span>
                        <button onClick={() => dispatch(setQty({ key: it.key, qty: it.qty + 1 }))} disabled={it.qty >= MAX_PEOPLE} className="w-9 h-9 flex items-center justify-center text-slate-600 disabled:opacity-30" aria-label="More people"><Plus className="w-4 h-4" /></button>
                      </div>
                    )}
                    <span className="w-24 text-right font-bold text-slate-900">{inr(it.price * it.qty)}</span>
                    <button onClick={() => dispatch(removeItem(it.key))} className="icon-btn-delete" aria-label={`Remove ${it.name}`} title="Remove"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              <Link to="/book" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-800"><ArrowLeft className="w-4 h-4" /> Continue booking</Link>
            </div>

            <div className="space-y-4 lg:sticky lg:top-28">
              <OrderSummary items={items} gstRate={gstRate} compact>
                <button onClick={() => navigate('/checkout')} disabled={!loading && !paymentsEnabled} className="btn-primary w-full mt-6 py-3.5 disabled:opacity-50">
                  Proceed to checkout <ArrowRight className="w-4 h-4" />
                </button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure payment via Razorpay</p>
              </OrderSummary>
              {!loading && !paymentsEnabled && <PaymentsOffNotice />}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
