import React from 'react'
import { BookOpen, FileText, Video, HelpCircle } from 'lucide-react'
import Footer from '../components/Footer'

const Resources: React.FC = () => {
  const resources = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Fresh Produce Guide",
      description: "Learn how to select, store, and prepare fresh fruits and vegetables for maximum freshness and nutrition.",
      link: "#"
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: "Video Tutorials",
      description: "Watch our video guides on seasonal produce, cooking tips, and sustainable farming practices.",
      link: "#"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Recipes & Meal Ideas",
      description: "Discover delicious recipes using fresh, seasonal ingredients delivered to your door.",
      link: "#"
    },
    {
      icon: <HelpCircle className="w-8 h-8" />,
      title: "FAQs",
      description: "Find answers to common questions about ordering, delivery, and our products.",
      link: "#"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1D7B3C] to-[#20571E] py-20">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Resources
          </h1>
          <p className="text-xl text-green-100">
            Everything you need to know about fresh produce, healthy eating, and making the most of your FarmChops experience.
          </p>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-8">
          {resources.map((resource, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#1D7B3C] to-[#20571E] rounded-xl flex items-center justify-center text-white mb-6">
                {resource.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {resource.title}
              </h3>
              <p className="text-gray-600 mb-6">
                {resource.description}
              </p>
              <a
                href={resource.link}
                className="inline-flex items-center text-[#1D7B3C] font-semibold hover:text-[#20571E] transition-colors"
              >
                Learn More →
              </a>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Resources
