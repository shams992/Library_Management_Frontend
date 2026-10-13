import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/landing/Navbar.jsx';
import { Footer } from '../components/landing/Footer.jsx';

export const PublicLayout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main" className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
