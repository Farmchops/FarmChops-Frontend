import React, { useState } from 'react';
import { Phone, Mail, MapPin, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Footer from '../components/Footer';

const Contacts: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email || !message || !fullName) {
      setStatus('error');
      setErrorMessage("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setErrorMessage("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          message,
          fullName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setStatus('success');
      // Reset form
      setEmail("");
      setMessage("");
      setFullName("");

      // Clear success message after 5 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 5000);
    } catch (error) {
      setStatus('error');
      setErrorMessage("Failed to send message. Please try again or contact us directly at support@farmchops.com");
    } finally {
      setIsLoading(false);
    }
  };




  return (
    <div>
      <div className="flex items-center justify-center min-h-[80vh] bg-green-50">
        <div className=" p-8 w-full max-w-4xl mx-4">
          <h2 className="text-2xl md:text-3xl font-medium text-gray-900 text-center mb-6">
            Contact Us
          </h2>

          {/* Form + Map */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Success Message */}
              {status === 'success' && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">Message sent successfully! We'll get back to you soon.</span>
                </div>
              )}

              {/* Error Message */}
              {status === 'error' && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-sm text-[#121212] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full py-3 px-3 border border-[#E6E6E6] focus:border-[#1D7B3C] rounded-md mb-3 outline-none placeholder:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm text-[#121212] mb-1">
                  Message
                </label>
                <textarea
                  placeholder="Type your message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  disabled={isLoading}
                  rows={4}
                  className="w-full py-3 px-3 border border-[#E6E6E6] focus:border-[#1D7B3C] rounded-md mb-3 outline-none placeholder:text-sm resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm text-[#121212] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full py-3 px-3 border border-[#E6E6E6] focus:border-[#1D7B3C] rounded-md mb-3 outline-none placeholder:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1D7B3C] text-white py-3 rounded-lg hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send Now</span>
                )}
              </button>
            </form>

            {/* Map Placeholder */}
            <div className="flex items-center justify-center w-full h-60">
              <div className="w-full h-60 rounded-md bg-gray-300"></div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col md:flex-row justify-center gap-10 mt-20 text-center">

            <div className="flex items-center gap-3">
              <Phone className="text-[#FF9E67] " />
              <div className='flex flex-col items-start'>
                <p className="font-bold">Call</p>
                <p className="text-sm">07077744060</p>
              </div>
            </div>


            <div className="flex items-center gap-3">
              <Mail className="text-[#FF9E67] " />
              <div className='flex flex-col items-start'>
                <p className="text-sm">Email</p>
                <p className="text-sm font-medium">support@farmchops.com</p>
              </div>
            </div>


            <div className="flex items-center gap-3">
              <MapPin className="text-[#FF9E67] " />
              <div className='flex flex-col items-start'>
                <p className="text-sm">Location</p>
                <p className="text-sm font-medium">Abuja, Nigeria</p>
              </div>
            </div>

          </div>
        </div>

      </div>

      <Footer />

    </div>

  )
}

export default Contacts;