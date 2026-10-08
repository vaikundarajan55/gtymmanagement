import { Navigate } from 'react-router-dom';
import { page } from './lazy';

// Admin panel (/admin/*). AdminLayout redirects to /admin/login when not signed in.
const adminRoutes = [
  { path: 'admin/login', ...page(() => import('../pages/admin/Login')) },
  {
    path: 'admin',
    ...page(() => import('../components/admin/AdminLayout')),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',       ...page(() => import('../pages/admin/Dashboard')) },

      // Members & staff
      { path: 'trainers',        ...page(() => import('../pages/admin/Trainers')) },
      { path: 'users',           ...page(() => import('../pages/admin/Users')) },
      { path: 'fees',            ...page(() => import('../pages/admin/Fees')) },
      { path: 'orders',          ...page(() => import('../pages/admin/Orders')) },
      { path: 'birthdays',       ...page(() => import('../pages/admin/Birthdays')) },
      { path: 'plan-completed',  ...page(() => import('../pages/admin/PlanCompleted')) },
      { path: 'reports',         ...page(() => import('../pages/admin/Reports')) },

      // Website content
      { path: 'banners',         ...page(() => import('../pages/admin/Banners')) },

      // Leads
      { path: 'contacts',        ...page(() => import('../pages/admin/Contacts')) },
      { path: 'enquiries',       ...page(() => import('../pages/admin/Enquiries')) },

      // Online booking
      { path: 'bookings',        ...page(() => import('../pages/admin/Bookings')) },
      { path: 'classes',         ...page(() => import('../pages/admin/Classes')) },

      // Settings
      { path: 'gym-details',     ...page(() => import('../pages/admin/GymDetails')) },
      { path: 'change-password', ...page(() => import('../pages/admin/ChangePassword')) },
    ],
  },
];

export default adminRoutes;
