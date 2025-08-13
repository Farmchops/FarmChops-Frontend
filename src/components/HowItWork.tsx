import React from 'react'
import flower1 from "../assets/flower1.png";
import flower2 from "../assets/flower2.png";


const steps = [
    {
        title: "Place Your Order",
        description:
            "Browse our selection of seasonal produce and add your favorite items to your cart. You can choose a one-time order or subscribe for regular deliveries to save time and money."
    },
    {
        title: "We Prepare & Deliver",
        description:
            "Once your order is confirmed, our farmers get to work. They hand-pick and carefully pack your produce, ensuring everything is at its peak of freshness and quality."
    },
    {
        title: "Enjoy Fresh Produce",
        description:
            "We work with a network of reliable delivery partners to get your produce to you as quickly as possible. It arrives at your home ready to be enjoyed."
    },
];










const HowItWork: React.FC = () => {
    return (


        <section className="relative overflow-visible bg-[#20571E] text-white py-16  pt-24">

            {/* Top left flower */}
            <img
                src={flower1}
                alt="Decorative flower"
                className="absolute z-0 top-0 left-0 w-32 sm:w-32 md:w-[230px] h-auto -translate-y-1/3 rotate-[0deg] overflow-x-hidden"
            />

            {/* Top right flower */}
            <img
                src={flower2}
                alt="Decorative flower"
                className="absolute z-0 top-0 right-0 w-32 sm:w-32 md:w-[230px] h-auto -translate-y-1/3 rotate-[0deg] overflow-x-hidden"
            />



            <div className="container mx-auto px-4 text-center z-5">
                <p className="text-green-300 uppercase tracking-wide text-sm">
                    How it works
                </p>
                <h2 className="text-2xl md:text-3xl font-medium mt-2">
                    From the farm <br /> to you in no time
                </h2>




                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-4 p-4 rounded-lg transition"
                        >
                            {/* Icon circle */}
                            <div className="flex-shrink-0 w-12 h-12 bg-[#D9D9D9] rounded-full flex items-center justify-center text-white font-bold">
                            </div>

                            {/* Text content */}
                            <div>
                                <h3 className="font-semibold text-lg">{step.title}</h3>
                                <p className="text-sm text-green-50 mt-2">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>



            </div>


        </section>



    )
}

export default HowItWork;














