import React from 'react'
import forfarmer from "../../assets/AboutIcon/forfarmer.png";

// NOTE: place the provided image file at src/assets/AboutIcon/Gemini_Generated_Image_tclq5ztclq5ztclq.png
// then the import below will resolve and the consumer section will show the new image.
import forconsumer from "../../assets/AboutIcon/forconsumer.png"
import checker from "../../assets/AboutIcon/aboutcheck.png"

const OurSolution2: React.FC = () => {
    return (
    <section className="px-6 md:px-12 lg:px-20 py-12 md:py-16 bg-green-50 text-gray-800">

            {/* For Farmer */}


            <div className="mx-auto mb-20  flex items-center">
                <div className="flex flex-col md:flex-row md:gap-16 justify-center items-center w-full">
                    {/* Text Section */}
                    <div className="md:w-1/2 max-w-[540px] text-left">
                        <p className="text-[#20571E] uppercase tracking-wide text-sm mb-2 font-semibold">
                            Our Solution
                        </p>
                        <h2 className="text-2xl md:text-3xl text-[#0F5132] font-semibold mt-1 mb-4">
                            PayForMe
                        </h2>


                        <div className="mt-3 space-y-4 font-normal">


                            <div className='flex items-start gap-4 border-b pb-4 border-gray-200'>
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-[#E6F4EA] text-[#0F5132] flex items-center justify-center font-semibold">1</div>
                                </div>
                                <div className="flex flex-col items-start gap-2 text-base text-gray-700">
                                    <p className='font-semibold'>Shop and Checkout</p>
                                    <p>
                                        Add items to your cart and proceed to checkout as usual. It's simple and familiar.
                                    </p>
                                </div>
                            </div>


                            <div className='flex items-start gap-4 border-b pb-4 border-gray-200'>
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-[#E6F4EA] text-[#0F5132] flex items-center justify-center font-semibold">2</div>
                                </div>
                                <div className="flex flex-col items-start gap-2 text-base text-gray-700">
                                    <p className='font-semibold'>Generate a Secure Payment Link</p>
                                    <p>
                                        We create a secure payment link you can share with someone who will pay on your behalf.
                                    </p>
                                </div>
                            </div>


                            <div className='flex items-start gap-4 border-b pb-4 border-gray-200'>
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-[#E6F4EA] text-[#0F5132] flex items-center justify-center font-semibold">3</div>
                                </div>
                                <div className="flex flex-col items-start gap-2 text-base text-gray-700">
                                    <p className='font-semibold'>Share the Link</p>
                                    <p>
                                        Send the secure link to your chosen payer—family, friend or partner.
                                    </p>
                                </div>
                            </div>


                            <div className='flex items-start gap-4 border-b pb-4 border-gray-200'>
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-[#E6F4EA] text-[#0F5132] flex items-center justify-center font-semibold">4</div>
                                </div>
                                <div className="flex flex-col items-start gap-2 text-base text-gray-700">
                                    <p className='font-semibold'>Payment & Confirmation</p>
                                    <p>
                                        The payer completes payment via the link. Once paid, the order is confirmed and we'll start preparing it for delivery.
                                    </p>
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
                        <img src={forconsumer} alt="for_consumer" className="max-w-[420px] w-full h-auto object-cover" />
                    </div>

                    {/* Text Section */}
                    <div className="md:w-1/2 max-w-[450px] text-left">
                        <p className="text-[#4A8F7D] uppercase tracking-wide text-sm mb-4">
                            About Us
                        </p>
                        <h2 className="text-3xl text-[#4A8F7D] md:text-4xl font-medium mt-2 mb-4">
                            PayLater
                        </h2>

                        <p className="text-gray-700 text-lg leading-relaxed">
                            PayLater lets eligible customers buy fresh produce today and spread
                            the cost over simple, transparent instalments. Choose a payment plan
                            at checkout and complete your purchase without upfront full payment.
                        </p>

                        <div className="mt-3 space-y-3">
                            <div className="flex items-start gap-3 text-[#525252]">
                                <img src={checker} alt="check" className="mt-1" />
                                <p>
                                    Flexible instalment options to split your purchase into manageable payments.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 text-[#525252]">
                                <img src={checker} alt="check" className="mt-1" />
                                <p>
                                    Transparent terms and quick eligibility checks — no surprises at checkout.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 text-[#525252]">
                                <img src={checker} alt="check" className="mt-1" />
                                <p>
                                    Responsible lending practices with clear reminders and easy repayments.
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
