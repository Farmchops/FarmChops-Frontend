import React from 'react'
import { Mail, Phone, Clock } from 'lucide-react'
import Footer from '../components/Footer'

const CustomerSupport: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1D7B3C] to-[#20571E] py-20">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Customer Support
          </h1>
          <p className="text-xl text-green-100">
            We're here to help! Get in touch with our support team.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Email Support */}
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#1D7B3C] to-[#20571E] rounded-full flex items-center justify-center text-white mx-auto mb-6">
              <Mail className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Email Us</h3>
            <p className="text-gray-600 mb-4">
              Send us an email and we'll get back to you within 24 hours.
            </p>
            <a
              href="mailto:support@farmchops.com"
              className="text-[#1D7B3C] font-semibold hover:text-[#20571E]"
            >
              support@farmchops.com
            </a>
          </div>

          {/* Phone Support */}
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#1D7B3C] to-[#20571E] rounded-full flex items-center justify-center text-white mx-auto mb-6">
              <Phone className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Call Us</h3>
            <p className="text-gray-600 mb-4">
              Speak directly with our support team.
            </p>
            <a
              href="tel:07077744060"
              className="text-[#1D7B3C] font-semibold hover:text-[#20571E]"
            >
              07077744060
            </a>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Clock className="w-8 h-8 text-[#1D7B3C]" />
            <h2 className="text-2xl font-bold text-gray-900">Business Hours</h2>
          </div>
          <div className="space-y-3 text-center">
            <p className="text-gray-600">
              <span className="font-semibold">Monday - Friday:</span> 9:00 AM - 5:00 PM
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Saturday:</span> 9:00 AM - 4:00 PM
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Sunday:</span> Closed
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default CustomerSupport
