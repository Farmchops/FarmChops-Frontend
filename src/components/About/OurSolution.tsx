import React from 'react'
import forfarmer from "../../assets/AboutIcon/forfarmer.png";

// New consumer image provided by user (copied from Downloads)
import consumerNew2 from "../../assets/AboutIcon/Gemini_Generated_Image_gzvu9xgzvu9xgzvu.png"
// (old fallback image kept on disk but no longer imported)
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
                        <h2 className="text-3xl text-[#20571E] md:text-4xl font-semibold mt-2 mb-4">
                            For Farmers
                        </h2>
                        <p className="text-gray-700 text-lg leading-relaxed">
                            FarmChops grows produce on our own family farms and delivers fresh
                            products directly to customers. We manage harvesting, orders and
                            delivery to ensure quality, fair pricing and reduced food waste.
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
                        <img src={forfarmer} alt="for_farmer" className="max-w-[420px] w-full h-auto object-cover" />
                    </div>
                </div>
            </div>







            {/* For Consumer */}


            <div className="mx-auto mb-12 flex items-center">
                <div className="flex flex-col md:flex-row md:gap-16 justify-center items-center w-full">
                   
                    {/* Image Section */}
                    <div className="md:w-1/2 flex justify-center m-4 md:mt-0">
                        <img src={consumerNew2} alt="for_consumer" className="max-w-[420px] w-full h-auto object-cover" />
                    </div>
                   
                    {/* Text Section */}
                    <div className="md:w-1/2 max-w-[450px] text-left">
                        <p className="text-[#4A8F7D] uppercase tracking-wide text-sm mb-4">
                            About Us
                        </p>
                        <h2 className="text-3xl text-[#20571E] md:text-4xl font-semibold mt-2 mb-4">
                            For Consumers
                        </h2>
                        <p className="text-gray-700 text-lg leading-relaxed">
                            Buy fresh, seasonal produce directly from local farmers. Enjoy higher
                            quality, clear sourcing information, and great value — delivered to
                            your doorstep.
                        </p>

                        <div className="mt-3 space-y-3">
                            <div className="flex items-start gap-3 text-[#525252]">
                                <img src={checker} alt="check" className="mt-1" />
                                <p>
                                    Access fresher, seasonal produce harvested by local growers.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 text-[#525252]">
                                <img src={checker} alt="check" className="mt-1" />
                                <p>
                                    Support local farms and strengthen the regional food economy.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 text-[#525252]">
                                <img src={checker} alt="check" className="mt-1" />
                                <p>
                                    See where your food comes from with transparent sourcing and farm
                                    details.
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
