import { useDispatch, useSelector } from 'react-redux';
import { Menu, Bell, Globe } from 'lucide-react';
import { useState } from 'react';
import { toggleSidebar } from '../../store/slices/uiSlice';

const initials = (name = 'Admin') =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

export default function Topbar() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { notifications } = useSelector((s) => s.ui);
  const { onlineUsers, visitors } = useSelector((s) => s.socket);
  const [showNotif, setShowNotif] = useState(false);
  const unread = notifications.length;

  return (
    <header className="h-20 bg-white/95 backdrop-blur border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
        <div className="hidden sm:block min-w-0">
          <p className="font-bold text-slate-900 font-[Space_Grotesk] text-lg leading-tight truncate">Gym Management System</p>
          <p className="text-xs text-slate-500 truncate">GymPro Fitness Centre · Admin panel</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
          title="Admins signed in · website visitors connected right now">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {onlineUsers} admin{onlineUsers === 1 ? '' : 's'}
          <span className="hidden lg:inline-flex items-center gap-1.5 pl-2 border-l border-emerald-200">
            <Globe className="w-3.5 h-3.5" /> {visitors} on website
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="w-11 h-11 inline-flex items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50/60 hover:bg-cyan-50 relative transition-colors shadow-sm shadow-cyan-500/10"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-cyan-700" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          {showNotif && (
            <div className="absolute right-0 top-full mt-2 w-80 glass rounded-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 font-bold text-sm text-slate-900">Notifications</div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">All caught up!</p>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div key={n.id} className="px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <p className="text-sm text-slate-700">{n.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(n.id).toLocaleTimeString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white pl-4 pr-1.5 py-1.5 shadow-sm">
          <span className="text-sm font-semibold text-slate-800 hidden sm:block">{user?.name || 'Admin'}</span>
          <div className="avatar w-9 h-9 text-sm">{initials(user?.name)}</div>
        </div>
      </div>
    </header>
  );
}
