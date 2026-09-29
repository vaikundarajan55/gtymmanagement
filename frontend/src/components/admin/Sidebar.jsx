import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, Users, Dumbbell, CreditCard, ShoppingBag,
  PartyPopper, MessageSquare, CircleHelp, Lock, LogOut, X, Zap, Globe,
  CalendarCheck, CalendarDays, CalendarX2, Building2, GalleryHorizontal
} from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { disconnectSocket } from '../../services/socket';

const NAV = [
  { section: 'Overview' },
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { section: 'Management' },
  { to: '/admin/trainers', icon: Dumbbell, label: 'Trainers' },
  { to: '/admin/users', icon: Users, label: 'Members' },
  { to: '/admin/fees', icon: CreditCard, label: 'Fees' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/birthdays', icon: PartyPopper, label: 'Birthdays' },
  { to: '/admin/plan-completed', icon: CalendarX2, label: 'Plan Completed' },
  { section: 'Online Booking' },
  { to: '/admin/bookings', icon: CalendarCheck, label: 'Bookings' },
  { to: '/admin/classes', icon: CalendarDays, label: 'Class Master' },
  { section: 'Website' },
  { to: '/admin/banners', icon: GalleryHorizontal, label: 'Banners' },
  { section: 'Inbox' },
  { to: '/admin/contacts', icon: MessageSquare, label: 'Contacts' },
  { to: '/admin/enquiries', icon: CircleHelp, label: 'Enquiries' },
  { section: 'Settings' },
  { to: '/admin/gym-details', icon: Building2, label: 'Gym Details' },
  { to: '/admin/change-password', icon: Lock, label: 'Change Password' },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sidebarOpen } = useSelector((s) => s.ui);
  const { connected } = useSelector((s) => s.socket);

  const handleLogout = () => {
    disconnectSocket();
    dispatch(logout());
    navigate('/admin/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-20 lg:hidden" onClick={() => dispatch(toggleSidebar())} />
      )}

      <aside className={`fixed top-0 left-0 h-full z-30 flex flex-col
        bg-white border-r border-slate-200 shadow-[4px_0_24px_rgba(15,23,42,0.04)] transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-64' : 'w-0 lg:w-[72px] overflow-hidden'}`}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-20 border-b border-slate-100">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 truncate font-[Space_Grotesk] text-lg leading-tight">GymPro</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span className="text-xs text-slate-500">{connected ? 'Live' : 'Offline'}</span>
              </div>
            </div>
          )}
          {sidebarOpen && (
            <button onClick={() => dispatch(toggleSidebar())} className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg" aria-label="Close menu">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => item.section ? (
            sidebarOpen
              ? <p key={item.section} className="px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 first:pt-0">{item.section}</p>
              : <div key={item.section} className="my-2 border-t border-slate-100 first:hidden" />
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              title={sidebarOpen ? undefined : item.label}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150
                ${isActive
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-cyan-500/25'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'}`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-slate-100 space-y-0.5">
          <Link to="/" target="_blank"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
            <Globe className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">View Website</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
