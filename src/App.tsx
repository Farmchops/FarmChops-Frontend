import './App.css'
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from './components/Navbar';

import { useEffect, Suspense } from 'react';

import { AuthSessionHandler } from './lib/authSessionHandler';
import { checkAppVersion } from './lib/versionCheck';
import type { RootState } from './redux/store';
import { useSelector } from 'react-redux';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

//Checking if I can update git
function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, profileComplete } = useSelector((state: RootState) => state.auth);

  // Check app version and clear cache if needed (run once on app load)
  useEffect(() => {
    checkAppVersion();
  }, []);

  // Initialize session handler
  useEffect(() => {
    AuthSessionHandler.getInstance();
  }, []);


  // Show session expired message
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('session') === 'expired') {
      alert('Your session has expired. Please login again.');
      // Remove the query param
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);


  // Show session expired message
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('session') === 'expired') {
      alert('Your session has expired. Please login again.');
      // Remove the query param
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  // Redirect logic based on auth state
  useEffect(() => {
    if (isAuthenticated && !profileComplete && location.pathname !== '/complete-profile') {
      navigate('/complete-profile');
    }
  }, [isAuthenticated, profileComplete, location, navigate]);

  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
      <Navbar />

      <main>
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
            <div className="w-12 h-12 border-4 border-green-200 border-t-[#1D7B3C] rounded-full animate-spin will-change-transform" />
            <p className="mt-4 text-[#1D7B3C] text-sm font-medium">Loading...</p>
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>
    </GoogleReCaptchaProvider>
  )
}

export default App;