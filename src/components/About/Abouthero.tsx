import React from 'react'
import heroBg from "../../assets/smilingfarmer.png";
const AboutHero: React.FC = () => {
    //   className="relative h-[80vh] flex items-center justify-center text-center text-white"
    return (
        <section
            className="relative bg-cover bg-center h-[80vh] flex items-center justify-start"
            style={{ backgroundImage: `url(${heroBg})` }}
        >
            {/* Overlay */}
            <div className="absolute inset-0  w-1/2 bg-gradient-to-r from-[#0A0A0A] to-transparent"></div>

            {/* Content */}
            <div className="relative z-10 max-w-lg px-4 text-white pl-8 md:pl-16">
                <div className="flex flex-col items-start">
                    <p className='text-sm uppercase my-3'>WHY CHOOSE US</p>
                    <h2 className="text-4xl md:text-5xl font-medium mb-4 max-w-140">Farmchops, the home of fresh food</h2>
                    <p className='text-sm my-3'>Discover why we are your ultimate online fresh food and grocery destination</p>
                </div>

            </div>
        </section>
    )
}
export default AboutHero
