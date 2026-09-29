import { Outlet, useNavigation } from 'react-router-dom';

// While the router fetches the next page's chunk the current page stays on screen;
// this thin bar at the top shows that a navigation is in progress.
export default function RootLayout() {
  const loading = useNavigation().state === 'loading';
  return (
    <>
      <div
        aria-hidden="true"
        className={`fixed inset-x-0 top-0 z-[100] h-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 origin-left transition-all duration-500 print:hidden ${loading ? 'scale-x-75 opacity-100' : 'scale-x-100 opacity-0'}`}
      />
      <Outlet />
    </>
  );
}
