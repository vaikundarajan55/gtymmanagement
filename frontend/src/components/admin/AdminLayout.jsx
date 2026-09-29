import { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { initSocket } from '../../services/socket';

export default function AdminLayout() {
  const { token } = useSelector((s) => s.auth);
  const { sidebarOpen } = useSelector((s) => s.ui);

  useEffect(() => {
    if (token) initSocket();
  }, [token]);

  if (!token) return <Navigate to="/admin/login" replace />;

  return (
    <div className="flex h-screen bg-[#f4f7fb] overflow-hidden">
      <Sidebar />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300
        ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-[72px]'}`}>
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 xl:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
