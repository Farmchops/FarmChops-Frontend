import React from 'react'
import Hero from '../components/Hero'
import Category from '../components/Category'
import Featured from '../components/Featured'
import HowItWork from '../components/HowItWork'
import Features from '../components/Features'
import WhyChooseUs from '../components/WhyChooseUs'
import Footer from '../components/Footer'
import ExploreStore from '../components/ExploreStore'

const Home: React.FC = () => {
    return (
        <div>
            <Hero />
            <Category />
            <Featured />
            <HowItWork />
            <Features />
            <WhyChooseUs />
            <ExploreStore />
            <Footer />
        </div>
    )
}

export default Home
