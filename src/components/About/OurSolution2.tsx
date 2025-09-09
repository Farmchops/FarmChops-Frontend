import React from 'react'
import forfarmer from "../../assets/AboutIcon/forfarmer.png";

import forconsumer from "../../assets/AboutIcon/forconsumer.png"
import checker from "../../assets/AboutIcon/aboutcheck.png"

const OurSolution2: React.FC = () => {
    return (
        <section className="px-6 md:px-12 lg:px-20 py-12 md:py-16 bg-[#121212] text-white ">

            {/* For Farmer */}


            <div className="mx-auto mb-20  flex items-center">
                <div className="flex flex-col md:flex-row md:gap-16 justify-center items-center w-full">
                    {/* Text Section */}
                    <div className="md:w-1/2 max-w-[450px] text-left">
                        <p className="text-white uppercase tracking-wide text-sm mb-4">
                            Our Solution
                        </p>
                        <h2 className="text-3xl text-[#4A8F7D] md:text-4xl font-medium mt-2 mb-4">
                            Payforme
                        </h2>


                        <div className="mt-3 space-y-3 font-normal">


                            <div className='flex items-start gap-3 border-b pb-3 border-[#464646]'>
                                <div>
                                    <p>01</p>
                                </div>
                                <div className="flex flex-col items-start gap-2 text-sm">
                                    <p className='font-medium text-base'>Shop and Checkout:</p>
                                    <p>
                                        Browse our website and add all the items you need to your cart, just like a regular purchase.
                                    </p>
                                </div>
                            </div>


                            <div className='flex items-start gap-3 border-b pb-3 border-[#464646]'>
                                <div>
                                    <p>01</p>
                                </div>
                                <div className="flex flex-col items-start gap-2 text-sm">
                                    <p className='font-medium text-base'>Shop and Checkout:</p>
                                    <p>
                                        Browse our website and add all the items you need to your cart, just like a regular purchase.
                                    </p>
                                </div>
                            </div>


                            <div className='flex items-start gap-3 border-b pb-3 border-[#464646]'>
                                <div>
                                    <p>01</p>
                                </div>
                                <div className="flex flex-col items-start gap-2 text-sm">
                                    <p className='font-medium text-base'>Generate a Secure Payment Link</p>
                                    <p>
                                        Our system will generate a unique and secure payment link for your order.
                                    </p>
                                </div>
                            </div>


                            <div className='flex items-start gap-3 border-b pb-3 border-[#464646]'>
                                <div>
                                    <p>01</p>
                                </div>
                                <div className="flex flex-col items-start gap-2 text-sm">
                                    <p className='font-medium text-base'>Share the Link</p>
                                    <p>
                                        You can easily share this link with the person who will be paying for your order—whether it's a partner, a family member, or a business associate.                                    </p>
                                </div>
                            </div>
                            <div className='flex items-start gap-3 border-b pb-3 border-[#464646]'>
                                <div>
                                    <p>01</p>
                                </div>
                                <div className="flex flex-col items-start gap-2 text-sm">
                                    <p className='font-medium text-base'>Payment and Order Confirmation</p>
                                    <p>
                                        The payer simply clicks the link, reviews the order details, and completes the payment securely. As soon as the payment is made, the order is confirmed, and we'll begin processing your items for delivery.                                    </p>
                                </div>
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
                            PayLater
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

export default OurSolution2
