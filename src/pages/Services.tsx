import React from 'react'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'
import { ArrowRight, CreditCard, Tag, Users, ShoppingCart, Wallet } from 'lucide-react'
import paylaterImg from '../assets/paylater_realistic_1767287390281.png'
import payformeImg from '../assets/payforme_realistic_1767287422338.png'
import dealImg from '../assets/deal_realistic_1767287461795.png'
import bulkImg from '../assets/bulk_realistic_1767287511931.png'
import walletImg from '../assets/wallet_realistic_1767287547039.png'

const Services: React.FC = () => {
  const services = [
    {
      id: 1,
      title: "PayLater",
      tagline: "Shop Now, Pay Later",
      description: "Get fresh produce today and pay later from your salary. Approved customers can shop now and have the amount automatically deducted from their salary after a month.",
      icon: <CreditCard className="w-12 h-12" />,
      image: paylaterImg,
      link: "/paylater",
      features: [
        "Automatic salary deduction after a month",
        "Quick approval process",
        "No upfront payment required",
        "Simple and transparent terms"
      ]
    },
    {
      id: 2,
      title: "PayForMe",
      tagline: "Share Your Cart, Share the Love",
      description: "Shopping for someone else or need someone to pay for you? Generate a secure payment link and share it with family, friends, or partners.",
      icon: <Users className="w-12 h-12" />,
      image: payformeImg,
      link: "/checkout",
      features: [
        "Secure payment links",
        "Easy sharing via WhatsApp, email, or SMS",
        "Real-time payment confirmation",
        "Perfect for gifts and group purchases"
      ]
    },
    {
      id: 3,
      title: "Deal of the Day",
      tagline: "Unbeatable Daily Discounts",
      description: "Discover amazing deals on fresh produce every day. Limited quantities at discounted prices - grab them before they're gone!",
      icon: <Tag className="w-12 h-12" />,
      image: dealImg,
      link: "/deals",
      features: [
        "Daily rotating deals on premium produce",
        "Up to 50% off regular prices",
        "Limited quantities - first come, first served",
        "Fresh, quality products at unbeatable prices"
      ]
    },
    {
      id: 4,
      title: "Bulk Buying",
      tagline: "Buy More, Save More",
      description: "Purchase in bulk and enjoy significant savings. Perfect for families, restaurants, or group orders. Share with friends and split the cost!",
      icon: <ShoppingCart className="w-12 h-12" />,
      image: bulkImg,
      link: "/group-sharing",
      features: [
        "Wholesale prices for bulk orders",
        "Group buying with shared delivery",
        "Perfect for businesses and large families",
        "Share orders and split costs easily"
      ]
    },
    {
      id: 5,
      title: "FarmChops Wallet",
      tagline: "Quick & Easy Payments",
      description: "Load funds into your FarmChops wallet for faster checkouts and seamless transactions. Enjoy the convenience of instant payments and track your spending easily.",
      icon: <Wallet className="w-12 h-12" />,
      image: walletImg,
      link: "/profile/wallet",
      features: [
        "Instant payment processing",
        "No need to enter card details every time",
        "Track your wallet balance and transactions",
        "Secure and convenient payment method"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-green-50">
      {/* Hero Section */}
      <section className="relative px-6 md:px-12 lg:px-20 py-20 md:py-28 bg-gradient-to-br from-[#1D7B3C] to-[#20571E] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Our Services
          </h1>
          <p className="text-lg md:text-xl text-green-100 max-w-2xl mx-auto">
            Discover our innovative features designed to make fresh produce shopping easier, more affordable, and more convenient than ever before.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8 md:gap-10 lg:gap-12">
            {services.map((service, index) => (
              <div
                key={service.id}
                className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  } flex flex-col md:flex`}
              >
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#1D7B3C] to-[#20571E] opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>

                {/* Image/Icon Section */}
                <div className="relative flex items-center justify-center md:w-2/5 overflow-hidden">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center p-12 w-full h-full bg-gradient-to-br from-[#1D7B3C] to-[#20571E]">
                      <div className="text-white transform group-hover:scale-110 transition-transform duration-500">
                        {service.icon}
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                </div>

                {/* Content Section */}
                <div className="relative p-8 md:p-12 md:w-3/5 flex flex-col justify-center">
                  <div className="mb-4">
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-sm font-semibold uppercase tracking-wider text-[#1D7B3C]">
                      {service.tagline}
                    </p>
                  </div>

                  <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-700">
                        <div className="flex-shrink-0 mt-1 w-5 h-5 rounded-full bg-[#1D7B3C] flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm md:text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link
                    to={service.link}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1D7B3C] to-[#20571E] text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 w-fit group"
                  >
                    <span>Explore {service.title}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 md:px-12 lg:px-20 py-16 md:py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Choose the service that best fits your needs and start enjoying fresh, quality produce delivered right to your doorstep.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1D7B3C] text-white rounded-full font-semibold hover:bg-[#20571E] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Shop Now</span>
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#1D7B3C] border-2 border-[#1D7B3C] rounded-full font-semibold hover:bg-green-50 transform hover:scale-105 transition-all duration-300"
            >
              <span>Contact Us</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Services
