import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const ThankYou: React.FC = () => {
  const location = useLocation();
  // Optionally the form may have redirected with state containing created vendor
  const state = location.state as { vendor?: { firstName?: string } } | null;
  const vendor = state?.vendor;

  return (
    <div className="max-w-4xl mx-auto py-20 px-4 text-center">
      <h1 className="text-3xl font-bold text-[#1D7B3C] mb-4">Thank you for applying</h1>
      <p className="text-gray-700 mb-6">
        {vendor
          ? `We've received your application, ${vendor.firstName || ''}. Our team will review your submission and get back to you shortly.`
          : 'We received your application. Our team will review it and reach out if we need more information.'}
      </p>

      <div className="flex items-center justify-center gap-4">
        <Link to="/" className="px-4 py-2 bg-[#1D7B3C] text-white rounded">Back to home</Link>
        <Link to="/become-vendor" className="px-4 py-2 border border-[#1D7B3C] text-[#1D7B3C] rounded">Submit another</Link>
      </div>

      {/* Support note removed as requested */}
    </div>
  );
};

export default ThankYou;
