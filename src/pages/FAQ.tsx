import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Footer from '../components/Footer'

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      category: "Orders & Delivery",
      questions: [
        {
          question: "How do I place an order?",
          answer: "Simply browse our products, add items to your cart, and proceed to checkout. You'll need to create an account or log in to complete your purchase."
        },
        {
          question: "What are your delivery hours?",
          answer: "We deliver Monday to Saturday, between 8:00 AM and 6:00 PM. Same-day delivery is available for orders placed before 12:00 PM."
        },
        {
          question: "How much is delivery?",
          answer: "Delivery fees vary based on your location. You'll see the exact delivery cost at checkout before confirming your order."
        },
        {
          question: "Can I track my order?",
          answer: "Yes! Once your order is dispatched, you'll receive a tracking link via SMS and email. You can also track your order from your account dashboard."
        }
      ]
    },
    {
      category: "Payment & Pricing",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept card payments (Visa, Mastercard, Verve), bank transfers, and wallet payments. We also offer PayLater for eligible customers."
        },
        {
          question: "Is it safe to pay online?",
          answer: "Absolutely! We use industry-standard encryption and secure payment gateways (Paystack) to protect your payment information."
        },
        {
          question: "Can I pay on delivery?",
          answer: "Currently, we only accept online payments to ensure smooth and contactless delivery."
        },
        {
          question: "What is PayLater?",
          answer: "PayLater allows approved customers to shop now and have the payment automatically deducted from their salary after a month. Apply through your account to check your eligibility."
        }
      ]
    },
    {
      category: "Products & Quality",
      questions: [
        {
          question: "How fresh are your products?",
          answer: "All our produce is harvested fresh from our partner farms and delivered within 24-48 hours. We guarantee peak freshness and quality."
        },
        {
          question: "Are your products organic?",
          answer: "We offer both organic and conventionally grown produce. Products are clearly labeled on our website so you can make informed choices."
        },
        {
          question: "What if I receive damaged or poor-quality produce?",
          answer: "We guarantee quality! If you're not satisfied, contact our support team within 24 hours of delivery with photos, and we'll arrange a replacement or refund."
        },
        {
          question: "Can I request specific products not listed on your website?",
          answer: "Yes! Contact our customer support with your request, and we'll do our best to source it for you."
        }
      ]
    },
    {
      category: "Account & Special Features",
      questions: [
        {
          question: "Do I need an account to shop?",
          answer: "Yes, you need to create an account to place orders. This helps us track your orders and provide better service."
        },
        {
          question: "What is PayForMe?",
          answer: "PayForMe lets you generate a secure payment link for your order that someone else can pay on your behalf - perfect for gifts or when someone else is covering your groceries!"
        },
        {
          question: "How does Group Sharing work?",
          answer: "Group Sharing allows you to create or join bulk orders with friends and split the cost. It's perfect for saving money on larger quantities!"
        },
        {
          question: "What is Deal of the Day?",
          answer: "Every day we feature select products at special discounted prices. These deals are limited in quantity and available only while supplies last!"
        }
      ]
    },
    {
      category: "Returns & Refunds",
      questions: [
        {
          question: "Can I return products?",
          answer: "Due to the perishable nature of our products, we only accept returns for damaged or incorrect items. Please contact us within 24 hours of delivery."
        },
        {
          question: "How long do refunds take?",
          answer: "Approved refunds are processed within 7-10 business days and will be credited to your original payment method or FarmChops wallet."
        },
        {
          question: "Can I cancel my order?",
          answer: "You can cancel your order within 1 hour of placing it. After that, the order is prepared for delivery and cannot be cancelled."
        }
      ]
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  let globalIndex = 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1D7B3C] to-[#20571E] py-20">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-green-100">
            Find answers to common questions about FarmChops
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-20">
        <div className="space-y-12">
          {faqs.map((category, catIndex) => (
            <div key={catIndex}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.questions.map((faq, qIndex) => {
                  const currentIndex = globalIndex++
                  return (
                    <div
                      key={qIndex}
                      className="bg-white rounded-lg shadow-sm overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFAQ(currentIndex)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-900 pr-4">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-[#1D7B3C] flex-shrink-0 transition-transform duration-200 ${
                            openIndex === currentIndex ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-200 ${
                          openIndex === currentIndex ? 'max-h-96' : 'max-h-0'
                        }`}
                      >
                        <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-16 bg-gradient-to-br from-green-100 to-emerald-50 rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Our support team is here to help!
          </p>
          <a
            href="/support"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#1D7B3C] text-white rounded-full font-semibold hover:bg-[#20571E] transition-colors"
          >
            Contact Support
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default FAQ
