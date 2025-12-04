import React from 'react'
import Footer from '../components/Footer'

const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1D7B3C] to-[#20571E] py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Terms & Conditions
          </h1>
        </div>
      </section>

      {/* Terms Content */}
      <section className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-20">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-6">
              By accessing and using FarmChops' services, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our services.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use of Service</h2>
            <p className="text-gray-600 mb-6">
              FarmChops provides an online platform for purchasing fresh farm produce and vegetables. You agree to use our services only for lawful purposes and in accordance with these Terms and Conditions.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Orders and Pricing</h2>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>All prices are listed in Nigerian Naira (NGN)</li>
              <li>Prices are subject to change without notice</li>
              <li>We reserve the right to refuse or cancel any order</li>
              <li>Payment must be received before order fulfillment</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Delivery</h2>
            <p className="text-gray-600 mb-6">
              We strive to deliver orders within the estimated timeframe. However, delivery times are approximate and may vary due to unforeseen circumstances. FarmChops is not liable for delays beyond our control.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Product Quality</h2>
            <p className="text-gray-600 mb-6">
              We guarantee the freshness and quality of our products. If you receive damaged or unsatisfactory produce, please contact our customer support within 24 hours of delivery.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Returns and Refunds</h2>
            <p className="text-gray-600 mb-6">
              Due to the perishable nature of our products, returns are only accepted for damaged or incorrect items. Refunds will be processed within 7-10 business days.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. User Accounts</h2>
            <p className="text-gray-600 mb-6">
              You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600 mb-6">
              FarmChops shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Modifications to Terms</h2>
            <p className="text-gray-600 mb-6">
              We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the modified terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
            <p className="text-gray-600">
              If you have any questions about these Terms and Conditions, please contact us at{' '}
              <a href="mailto:support@farmchops.com" className="text-[#1D7B3C] hover:text-[#20571E] font-semibold">
                support@farmchops.com
              </a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default TermsAndConditions
