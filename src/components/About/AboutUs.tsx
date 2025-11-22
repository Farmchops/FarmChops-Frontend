import React from "react";
import icon1 from "../../assets/AboutIcon/Icons1.png"
import icon2 from "../../assets/AboutIcon/Icons2.png"
import icon3 from "../../assets/AboutIcon/Icons3.png"
import leaf from "../../assets/AboutIcon/flower.png"

const AboutUs: React.FC = () => {
    const cards = [
        {
            title: "Our Vision",
            description: (
                <>
                    To transform the farm-to-table experience by offering superior-quality, ethically grown produce and becoming the leading provider of fresh, sustainable farm products, fostering transparency in food sourcing and setting the benchmark for agricultural excellence.
                </>
            ),
            icon: icon1,
        },
        {
            title: "Our Mission",
            description: (
                <>
                    To promote sustainable living and strengthen local economies by delivering premium, responsibly sourced products. We provide organic produce at competitive prices, procure from reputable local farmers, support local agricultural initiatives, and facilitate access to high-quality artisanal goods.
                </>
            ),
            icon: icon2,
        },
        {
            title: "Quality & Sourcing",
            description: (
                <>
                    <strong className="font-semibold">Carefully sourced.</strong> We partner with vetted local growers and manage handling end-to-end so you receive the best produce, responsibly grown and packed with care.
                </>
            ),
            icon: icon3,
        },
    ];

    return (
        <section className="px-6 md:px-12 lg:px-20 py-12 md:py-16 ">
            {/* Section Heading */}
            <div className=" mx-auto mb-12">

                <div className="flex flex-col md:flex-row md:gap-16 justify-between items-center ">
                    <div className="md:w-1/2">
                        <p className="text-[#4A8F7D] uppercase tracking-wide text-sm  mb-4 d:mb-8">
                            About US
                        </p>
                        <h2 className="text-3xl text-[#4A8F7D] md:text-4xl font-medium mt-2 mb-4">
                            Why Our Deals Are Best In The Market
                        </h2>
                    </div>

                    {/* intro intentionally removed */}
                </div>

            </div>

            {/* Cards Section */}
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className="relative bg-[#EFFBF9] px-6 py-9 rounded-2xl shadow hover:shadow-sm transition-all duration-300 flex flex-col justify-between border border-[#20571E]/34"
                    >
                        {/* Small image at top-left */}
                        <img
                            src={leaf}
                            alt="small icon"
                            className="absolute -top-3 -left-3 w-6 h-6"
                        />

                        {/* Title + Icon */}
                        <div className="flex items-center justify-between mb-4 mt-4">
                            <h3 className="text-2xl font-semibold text-[#3F7C6C]">
                                {card.title}
                            </h3>
                            <img src={card.icon} alt="icon" />
                        </div>

                        {/* Description */}
                        <p className="text-[#525252] text-sm mb-6 flex-grow">
                            {card.description}
                        </p>
                    </div>

                ))}
            </div>
        </section>
    );
};

export default AboutUs;
