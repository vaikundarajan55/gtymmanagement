import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { LayoutDashboard, CalendarCheck, UserRound, KeyRound, LogOut, CalendarPlus } from 'lucide-react';
import { logoutCustomer } from '../../../store/slices/customerSlice';

const NAV = [
  { to: '/account', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/account/bookings', label: 'My Bookings', icon: CalendarCheck },
  { to: '/account/profile', label: 'Profile', icon: UserRound },
  { to: '/account/change-password', label: 'Change Password', icon: KeyRound },
];

export const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'U';

// Redirects to login (and back here afterwards) when no customer is signed in
export function RequireCustomer({ children }) {
  const { token } = useSelector((s) => s.customer);
  const location = useLocation();
  if (!token) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  return children;
}

export default function AccountLayout() {
  const { customer } = useSelector((s) => s.customer);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logout = () => {
    dispatch(logoutCustomer());
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <RequireCustomer>
      <section className="bg-[#f4f7fb] min-h-[75vh] print:bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 grid gap-6 lg:gap-8 lg:grid-cols-[270px_1fr] items-start print:block print:p-0">
          <aside className="card min-w-0 p-4 sm:p-5 lg:sticky lg:top-28 print:hidden">
            <div className="flex items-center gap-3 pb-4 lg:pb-5 border-b border-slate-100">
              <div className="avatar w-12 h-12 text-base">{initials(customer?.name)}</div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 truncate">{customer?.name}</p>
                <p className="text-xs text-slate-500 truncate">{customer?.email}</p>
              </div>
            </div>
            {/* Phones/tablets: a swipeable row of tabs; desktop: a vertical menu */}
            <nav className="mt-4 flex gap-2 overflow-x-auto -mx-1 px-1 pb-1 lg:block lg:space-y-1 lg:overflow-visible lg:mx-0 lg:px-0 lg:pb-0">
              {NAV.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end}
                  className={({ isActive }) => `flex flex-shrink-0 items-center gap-2 lg:gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all
                    ${isActive ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}>
                  <Icon className="w-5 h-5" /> {label}
                </NavLink>
              ))}
              <button onClick={logout} className="lg:w-full flex flex-shrink-0 items-center gap-2 lg:gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap text-rose-600 hover:bg-rose-50">
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </nav>
            <NavLink to="/book" className="btn-primary w-full mt-5 !hidden lg:!inline-flex"><CalendarPlus className="w-4 h-4" /> Book a class</NavLink>
          </aside>
          <div className="min-w-0"><Outlet /></div>
        </div>
      </section>
    </RequireCustomer>
  );
}
