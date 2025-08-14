import React from 'react'
import smilingWoman from "../assets/smilingfarmer.png";
import frame from "../assets/Frame.png"

const WhyChooseUs: React.FC = () => {
    return (
        <section className="bg-[#FFF9ED] flex flex-col md:flex-row items-center md:items-start sm:gap-8 md:gap-16 lg:gap-24 py-16 md:pt-32 md:px-16 lg:px-32 justify-center">
            {/* Left Image */}
            <div className="relative md:w-1/2 flex justify-center h-full">
                {/* Frame - background layer */}
                <img
                    src={frame}
                    alt="frame"
                    className="absolute -top-5 -left-5 z-0 " // adjust size to taste
                />

                {/* Main image - front layer */}
                <div className='w-full h-full'>
                    <img
                        src={smilingWoman}
                        alt="Smiling woman holding fresh vegetables"
                        className="relative z-10 w-full h-full"
                    />
                </div>

                <div className="absolute z-20 bottom-4 left-8 bg-white text-sm px-3 py-2 shadow-md text-center">
                    Cheapest rates in the market <br /> without compromising on quality.
                </div>

            </div>


            {/* Right Text */}
            <div className="max-w-md md:w-1/2 text-[#0A0A0A] md:my-8 m-4 ">
                <p className="uppercase text-xs  ">
                    Why Choose Us
                </p>
                <h2 className="text-xl md:text-2xl font-medium mt-3 ">
                    Benefits of shopping with us
                </h2>
                <p className=" mt-3 text-sm">
                    Discover why we are your ultimate online fresh food and grocery destination                </p>

                <ul className="mt-6 space-y-4  max-w-fit md:pr-6">
                    <li className="border-b border-[#D9D9D9] pb-2 font-medium">Pocket-friendly</li>
                    <li className="border-b border-[#D9D9D9] pb-2 font-medium">100% security on payments</li>
                    <li className="border-b border-[#D9D9D9] pb-2 font-medium">On-time delivery</li>
                    <li className="border-b border-[#D9D9D9] pb-2 font-medium">We value your feedback</li>
                    <li className="font-medium">Verified products</li>
                </ul>
            </div>
        </section>
    )
}

export default WhyChooseUs;
