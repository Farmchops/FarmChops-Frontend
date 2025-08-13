import React from "react";
import icon1 from "../../assets/AboutIcon/Icons1.png"
import icon2 from "../../assets/AboutIcon/Icons2.png"
import icon3 from "../../assets/AboutIcon/Icons3.png"
import leaf from "../../assets/AboutIcon/flower.png"

const AboutUs: React.FC = () => {
    const cards = [
        {
            title: "Our Story",
            description:
                "We launched Paleovalley with the belief that every ingredient is an opportunity to improve your health.",
            icon: icon1,
        },
        {
            title: "Our Mission",
            description:
                "Our mission is to create products that  always prioritize health over profit.",
            icon: icon2,
        },
        {
            title: "100% Organic",
            description:
                "Many products claimed that their products are100% pure, but our products are 100% Original.",
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

                    <p className="text-[#525252] text-sm md:text-sm md:w-1/2">
                        At Farm Chops, our mission is to help people reclaim vibrant health.
                        We provide products that prioritize nutrient density in an industry
                        that prioritizes everything else. We believe that every dietary choice
                        and every added ingredient is a powerful opportunity to love and care
                        for oneself.
                    </p>
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

                        {/* Button */}
                        <button className="self-start mt-auto py-2 text-[#4A8F7D]">
                            Learn More
                        </button>
                    </div>

                ))}
            </div>
        </section>
    );
};

export default AboutUs;
