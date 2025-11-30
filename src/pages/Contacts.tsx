import React, { useState } from 'react';
import { Phone, Mail, MapPin } from "lucide-react";
import Footer from '../components/Footer';

const Contacts: React.FC = () => {


  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, message, fullName });
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
              <div>
                <label className="block text-sm text-[#121212] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md mb-3 outline-none placeholder:text-sm"
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
                  rows={2}
                  className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md mb-3 outline-none placeholder:text-sm resize-none"
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
                  className="w-full py-2 px-3 border border-[#E6E6E6] focus:border-[#E6E6E6] rounded-md mb-3 outline-none placeholder:text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1D7B3C] text-white py-2 rounded-lg hover:bg-green-800"
              >
                Send Now
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