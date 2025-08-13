import React from 'react'
import forfarmer from "../../assets/AboutIcon/forfarmer.png";

import forconsumer from "../../assets/AboutIcon/forconsumer.png"
import checker from "../../assets/AboutIcon/aboutcheck.png"

const OurSolution: React.FC = () => {
    return (
        <section className="px-6 md:px-12 lg:px-20 py-12 md:py-16 bg-gray-200">

            {/* For Farmer */}


            <div className="mx-auto mb-20  flex items-center">
                <div className="flex flex-col md:flex-row md:gap-16 justify-center items-center w-full">
                    {/* Text Section */}
                    <div className="md:w-1/2 max-w-[450px] text-left">
                        <p className="text-[#4A8F7D] uppercase tracking-wide text-sm mb-4">
                            About Us
                        </p>
                        <h2 className="text-3xl text-[#4A8F7D] md:text-4xl font-medium mt-2 mb-4">
                            For Farmers
                        </h2>
                        <p className="text-[#525252]">
                            At Paleovalley, our mission is to help people reclaim vibrant health.
                            We provide products that prioritize nutrient density in an industry that
                            prioritizes everything else. We believe that every dietary choice and
                            every added ingredient is a powerful opportunity to love and care for
                            oneself.
                        </p>

                        <div className="mt-3 space-y-3">
                            <div className="flex items-start gap-3 text-[#525252]">
                                <img src={checker} alt="check" className="mt-1" />
                                <p>
                                    Sell directly, potentially increasing profit margins by cutting out
                                    intermediaries.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 text-[#525252]">
                                <img src={checker} alt="check" className="mt-1" />
                                <p>
                                    Reach buyers in different cities or even states, expanding sales
                                    opportunities.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 text-[#525252]">
                                <img src={checker} alt="check" className="mt-1" />
                                <p>
                                    Gain insights into market trends and buyer preferences to optimize
                                    pricing and production.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="md:w-1/2 flex justify-center m-4 md:mt-0">
                        <img src={forfarmer} alt="for_farmer" className="max-w-full h-auto" />
                    </div>
                </div>
            </div>







            {/* For Consumer */}


            <div className="mx-auto mb-12 flex items-center">
                <div className="flex flex-col md:flex-row md:gap-16 justify-center items-center w-full">
                   
                    {/* Image Section */}
                    <div className="md:w-1/2 flex justify-center m-4 md:mt-0">
                        <img src={forconsumer} alt="for_farmer" className="max-w-full h-auto" />
                    </div>
                   
                    {/* Text Section */}
                    <div className="md:w-1/2 max-w-[450px] text-left">
                        <p className="text-[#4A8F7D] uppercase tracking-wide text-sm mb-4">
                            About Us
                        </p>
                        <h2 className="text-3xl text-[#4A8F7D] md:text-4xl font-medium mt-2 mb-4">
                            For Farmers
                        </h2>
                        <p className="text-[#525252]">
                            At Paleovalley, our mission is to help people reclaim vibrant health.
                            We provide products that prioritize nutrient density in an industry that
                            prioritizes everything else. We believe that every dietary choice and
                            every added ingredient is a powerful opportunity to love and care for
                            oneself.
                        </p>

                        <div className="mt-3 space-y-3">
                            <div className="flex items-start gap-3 text-[#525252]">
                                <img src={checker} alt="check" className="mt-1" />
                                <p>
                                    Sell directly, potentially increasing profit margins by cutting out
                                    intermediaries.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 text-[#525252]">
                                <img src={checker} alt="check" className="mt-1" />
                                <p>
                                    Reach buyers in different cities or even states, expanding sales
                                    opportunities.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 text-[#525252]">
                                <img src={checker} alt="check" className="mt-1" />
                                <p>
                                    Gain insights into market trends and buyer preferences to optimize
                                    pricing and production.
                                </p>
                            </div>
                        </div>
                    </div>


                </div>
            </div>

        </section>

    )
}

export default OurSolution
