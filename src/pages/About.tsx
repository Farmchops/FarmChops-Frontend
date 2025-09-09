import React from 'react'
import AboutHero from '../components/About/Abouthero'
import AboutUs from '../components/About/AboutUs'
import OurSolution from '../components/About/OurSolution'
import Footer from '../components/Footer'
import OurSolution2 from '../components/About/OurSolution2'

const About: React.FC = () => {
  return (
    <div>
      <AboutHero />
      <AboutUs />
      <OurSolution />
      <OurSolution2/>
      <Footer />
    </div>
  )
}

export default About
