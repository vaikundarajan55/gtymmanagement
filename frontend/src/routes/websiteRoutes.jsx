import { page } from './lazy';

// Public website + customer account (/account/*)
const websiteRoutes = [
  {
    ...page(() => import('../components/website/SiteLayout')),
    children: [
      { index: true,                         ...page(() => import('../pages/website/Home')) },
      { path: 'about',                       ...page(() => import('../pages/website/About')) },
      { path: 'workouts',                    ...page(() => import('../pages/website/Workouts')) },
      { path: 'contact',                     ...page(() => import('../pages/website/Contact')) },
      { path: 'enquiry',                     ...page(() => import('../pages/website/Enquiry')) },

      // Booking flow
      { path: 'book',                        ...page(() => import('../pages/website/BookClass')) },
      { path: 'cart',                        ...page(() => import('../pages/website/Cart')) },
      { path: 'checkout',                    ...page(() => import('../pages/website/Checkout')) },
      { path: 'payment/:publicId',           ...page(() => import('../pages/website/Payment')) },
      { path: 'payment/:publicId/status',    ...page(() => import('../pages/website/PaymentStatus')) },

      // Customer auth
      { path: 'login',                       ...page(() => import('../pages/website/auth/CustomerLogin')) },
      { path: 'register',                    ...page(() => import('../pages/website/auth/CustomerRegister')) },
      { path: 'forgot-password',             ...page(() => import('../pages/website/auth/ForgotPassword')) },
      { path: 'reset-password/:token',       ...page(() => import('../pages/website/auth/ResetPassword')) },

      // Customer account
      {
        path: 'account',
        ...page(() => import('../pages/website/account/AccountLayout')),
        children: [
          { index: true,                         ...page(() => import('../pages/website/account/AccountDashboard')) },
          { path: 'bookings',                    ...page(() => import('../pages/website/account/MyBookings')) },
          { path: 'bookings/:bookingNo',         ...page(() => import('../pages/website/account/BookingDetail')) },
          { path: 'bookings/:bookingNo/invoice', ...page(() => import('../pages/website/account/Invoice')) },
          { path: 'profile',                     ...page(() => import('../pages/website/account/Profile')) },
          { path: 'change-password',             ...page(() => import('../pages/website/account/AccountChangePassword')) },
        ],
      },
    ],
  },
];

export default websiteRoutes;
