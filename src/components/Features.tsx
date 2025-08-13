import React from 'react'
import group from "../assets/featureIcon/Group.png";
import people from "../assets/featureIcon/people.png";
import shop from "../assets/featureIcon/shop.png";
import wallet from "../assets/featureIcon/wallet.png"
const features = [
    {
        id: 1,
        icon: wallet,
        title: "Wallet Integration",
        description:
            "Fund your wallet with ease and enjoy fast and reliable transactions. Store your payment information securely and checkout faster with our wallet payment system."
    },
    {
        id: 2,
        icon: group,
        title: "PayForMe",
        description:
            "Split bills with friends and family or pay for someone else's groceries remotely. Perfect for gifting or helping loved ones with their shopping needs."
    },
    {
        id: 3,
        icon: people,
        title: "Groups/Shared Order Flow",
        description:
            "Fund your wallet with ease and enjoy fast and reliable transactions. Store your payment information securely and checkout faster with our wallet payment system."
    },
    {
        id: 4,
        icon: shop,
        title: "PayLater",
        description:
            "Fund your wallet with ease and enjoy fast and reliable transactions. Store your payment information securely and checkout faster with our wallet payment system."
    },
];


const Features: React.FC = () => {
    return (
            <section className="py-16 md:pt-32 bg-green-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <h2 className="text-3xl font-medium text-center mb-12 text-[#20571E]">
                        Features
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
                        {features.map((feature) => (
                            <div
                                key={feature.id}
                                className="bg-white p-6 hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className="mb-4 text-[#000000] text-base font-light"><img src={feature.icon} alt="" /></div>

                                <h3 className="text-lg font-bold text-[#20571E]">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-[#0A0A0A] mt-2">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
    )
}

export default Features;



