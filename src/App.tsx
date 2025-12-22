import './App.css'
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from './components/Navbar';

import { useEffect } from 'react';

import { AuthSessionHandler } from './lib/authSessionHandler';
import type { RootState } from './redux/store';
import { useSelector } from 'react-redux';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

//Checking if I can update git
function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, profileComplete } = useSelector((state: RootState) => state.auth);

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
        <Outlet />
      </main>
    </GoogleReCaptchaProvider>
  )
}

export default App;