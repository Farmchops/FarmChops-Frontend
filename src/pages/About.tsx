import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import AboutHero from '../components/About/Abouthero'
import AboutUs from '../components/About/AboutUs'
import OurSolution from '../components/About/OurSolution'
import Footer from '../components/Footer'

const About: React.FC = () => {
  return (
    <div>
      <AboutHero />
      <AboutUs />
      <OurSolution />

      {/* Simple Services Link */}
      <section className="px-6 md:px-12 lg:px-20 py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 mb-4">
            Interested in our special features?
          </p>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-[#1D7B3C] font-semibold hover:text-[#20571E] transition-colors group"
          >
            <span>View Our Services</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default About
