import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Zap, Menu, X, Phone, Mail, MapPin, Clock, ChevronRight, ShoppingCart, UserRound, LayoutDashboard, CalendarCheck, LogOut, ChevronDown } from 'lucide-react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { logoutCustomer } from '../../store/slices/customerSlice';
import { PROGRAMS, img } from '../../data/site';
import { useGym } from '../../hooks/useSiteData';
import { selectCartCount } from '../../store/slices/cartSlice';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/workouts', label: 'Workouts' },
  { to: '/book', label: 'Book a Class' },
  { to: '/contact', label: 'Contact Us' },
];

function Logo({ light }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
        <Zap className="w-5 h-5 text-white" />
      </span>
      <span className={`font-[Space_Grotesk] font-bold text-xl ${light ? 'text-white' : 'text-slate-900'}`}>
        Gym<span className="text-gradient">Pro</span>
      </span>
    </Link>
  );
}

function CartButton() {
  const count = useSelector(selectCartCount);
  return (
    <Link to="/cart" className="relative w-11 h-11 inline-flex items-center justify-center rounded-xl border border-slate-200 hover:border-cyan-400 transition-colors" aria-label={`Cart, ${count} items`}>
      <ShoppingCart className="w-5 h-5 text-slate-700" />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}

function AccountMenu() {
  const { customer } = useSelector((s) => s.customer);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  if (!customer) {
    return (
      <Link to="/login" className="inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:border-cyan-400 hover:text-cyan-700 transition-colors">
        <UserRound className="w-4 h-4" /> <span className="hidden sm:inline">Login</span>
      </Link>
    );
  }
  const initials = customer.name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
  const item = 'flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-cyan-50 hover:text-cyan-800';
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-2 h-11 pl-1.5 pr-3 rounded-xl border border-slate-200 hover:border-cyan-400 transition-colors" aria-expanded={open} aria-haspopup="menu">
        <span className="avatar w-8 h-8 text-xs">{initials}</span>
        <span className="hidden md:block text-sm font-semibold text-slate-800 max-w-[110px] truncate">{customer.name.split(' ')[0]}</span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div role="menu" className="absolute right-0 top-full mt-2 w-60 z-50 glass rounded-2xl overflow-hidden py-2 animate-fade-in">
            <div className="px-4 py-2 border-b border-slate-100 mb-1">
              <p className="font-bold text-slate-900 truncate">{customer.name}</p>
              <p className="text-xs text-slate-500 truncate">{customer.email}</p>
            </div>
            <Link to="/account" className={item}><LayoutDashboard className="w-4 h-4" /> Dashboard</Link>
            <Link to="/account/bookings" className={item}><CalendarCheck className="w-4 h-4" /> My Bookings</Link>
            <Link to="/account/profile" className={item}><UserRound className="w-4 h-4" /> Profile</Link>
            <button onClick={() => { dispatch(logoutCustomer()); toast.success('Logged out'); }} className={`${item} w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700`}>
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Navbar() {
  const gym = useGym();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname, hash } = useLocation();

  // New page starts at the top, unless a #section link will scroll it
  useEffect(() => { setOpen(false); if (!hash) window.scrollTo(0, 0); }, [pathname]);
  // Links like /#plans scroll to that section once the page has rendered
  useEffect(() => {
    if (!hash) return;
    const id = requestAnimationFrame(() => document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: 'smooth' }));
    return () => cancelAnimationFrame(id);
  }, [pathname, hash]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkCls = ({ isActive }) =>
    `relative px-1 py-2 text-sm font-semibold transition-colors ${isActive ? 'text-blue-700' : 'text-slate-600 hover:text-blue-700'}
     after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-blue-600 after:to-emerald-500 after:transition-all
     ${isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'}`;

  return (
    <header className={`print:hidden sticky top-0 z-40 transition-all ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-[0_4px_24px_rgba(15,23,42,0.08)]' : 'bg-white'}`}>
      <div className="brand-gradient h-1" />
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
        <Logo />
        <div className="hidden lg:flex items-center gap-7">
          {LINKS.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={linkCls}>{l.label}</NavLink>)}
        </div>
        <div className="flex items-center gap-3">
          <a href={gym.phoneHref} className="hidden xl:flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-700">
            <Phone className="w-4 h-4 text-cyan-600" /> {gym.phone}
          </a>
          <CartButton />
          <AccountMenu />
          <Link to="/book" className="btn-primary py-2.5 hidden sm:inline-flex">Book Now</Link>
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2.5 rounded-xl border border-slate-200" aria-label="Toggle menu">
            {open ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pb-5 animate-fade-in">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => `flex items-center justify-between py-3 border-b border-slate-100 font-semibold ${isActive ? 'text-blue-700' : 'text-slate-700'}`}>
              {l.label} <ChevronRight className="w-4 h-4 text-slate-400" />
            </NavLink>
          ))}
          <Link to="/book" className="btn-primary w-full mt-4">Book Now</Link>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const gym = useGym();
  return (
    <footer className="bg-slate-950 text-slate-400 print:hidden">
      <div className="brand-gradient h-1" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 text-sm leading-relaxed">
            Modern equipment, certified coaches and a community that keeps you coming back. Your transformation starts here.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Explore</h4>
          <ul className="space-y-2.5 text-sm">
            {[...LINKS, { to: '/cart', label: 'My Cart' }, { to: '/enquiry', label: 'Enquire Now' }].map((l) => (
              <li key={l.to}><Link to={l.to} className="hover:text-cyan-400 transition-colors">{l.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Programs</h4>
          <ul className="space-y-2.5 text-sm">
            {PROGRAMS.slice(0, 5).map((p) => (
              <li key={p.slug}><Link to={`/workouts#${p.slug}`} className="hover:text-cyan-400 transition-colors">{p.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Visit us</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3"><MapPin className="w-4 h-4 mt-0.5 text-cyan-400 flex-shrink-0" />{gym.address}</li>
            <li className="flex gap-3"><Phone className="w-4 h-4 mt-0.5 text-cyan-400 flex-shrink-0" /><a href={gym.phoneHref} className="hover:text-white">{gym.phone}</a></li>
            <li className="flex gap-3"><Mail className="w-4 h-4 mt-0.5 text-cyan-400 flex-shrink-0" /><a href={`mailto:${gym.email}`} className="hover:text-white">{gym.email}</a></li>
            <li className="flex gap-3"><Clock className="w-4 h-4 mt-0.5 text-cyan-400 flex-shrink-0" /><span>{gym.hours[0][0]}: {gym.hours[0][1]}</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span>© {new Date().getFullYear()} {gym.name}. All rights reserved.</span>
          <Link to="/admin/login" className="hover:text-cyan-400">Admin login</Link>
        </div>
      </div>
    </footer>
  );
}

// Banner at the top of inner pages
export function PageHero({ title, subtitle, image, crumb }) {
  return (
    <section className="relative isolate overflow-hidden bg-slate-900">
      <img src={img(image, 1600)} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/95 via-blue-950/80 to-cyan-900/50" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <p className="flex items-center gap-2 text-sm text-slate-300">
          <Link to="/" className="hover:text-white">Home</Link> <ChevronRight className="w-4 h-4" /> <span className="text-cyan-300">{crumb || title}</span>
        </p>
        <h1 className="mt-4 text-4xl md:text-6xl font-bold text-white">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-lg text-slate-300">{subtitle}</p>}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, subtitle, center = true }) {
  return (
    <div className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <p className="section-eyebrow"><span className="w-6 h-0.5 brand-gradient rounded-full" />{eyebrow}</p>}
      <h2 className="mt-3 text-3xl md:text-4xl font-bold text-slate-900">{title}</h2>
      {subtitle && <p className="mt-4 text-slate-500 text-lg">{subtitle}</p>}
    </div>
  );
}

export function CtaBand() {
  const gym = useGym();
  return (
    <section className="px-4 sm:px-6 py-20">
      <div className="max-w-7xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-cyan-600 to-emerald-600 px-8 py-14 md:px-14 shadow-2xl shadow-cyan-600/30">
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/10" />
        <div className="absolute right-24 -bottom-24 w-56 h-56 rounded-full bg-white/10" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Ready for your first session?</h2>
            <p className="mt-3 text-cyan-50 text-lg">Book a class online in under a minute, or call us to plan a visit.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/book" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-blue-700 shadow-lg hover:bg-cyan-50 transition-colors">
              Book a Class
            </Link>
            <a href={gym.phoneHref} className="inline-flex items-center gap-2 rounded-xl border-2 border-white/70 px-6 py-3.5 font-bold text-white hover:bg-white/10 transition-colors">
              <Phone className="w-4 h-4" /> Call Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function SiteLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  );
}
