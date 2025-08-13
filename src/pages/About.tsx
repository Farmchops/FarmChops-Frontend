import React from 'react'
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
      <Footer />
    </div>
  )
}

export default About
