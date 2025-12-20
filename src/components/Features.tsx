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
            "Secure, simple, and seamless payments. Top up your Farmchops wallet and enjoy quick, stress- free transactions every time you shop.With our integrated wallet system, you can store funds, save your payment details securely, and check out in seconds — no need to re - enter card info or worry about failed payments."
    },
    {
        id: 2,
        icon: group,
        title: "PayForMe",
        description:
            "Share your cart, get a little help.Need a hand covering your grocery bill? Our PayForMe feature lets you send your Farmchops invoice to a friend, family member, or loved one who can pay on your behalf - instantly and securely."
    },
    {
        id: 3,
        icon: people,
        title: "Bulk Buying",
        description:
            "Shop smart. Save big. Eat fresh. Introducing Bulk Buying — the easiest way to save more while eating better.Buy larger quantities of your favorite farm- fresh products at unbeatable discounts.Perfect for families, meal preppers, or community groups."
    },
    {
        id: 4,
        icon: shop,
        title: "PayLater",
        description:
            "Buy now, pay later — split your purchase into simple instalments at checkout. PayLater offers eligible customers flexible, transparent payment plans so you can enjoy fresh produce today and pay over time."
    },
    {
        id: 5,
        icon: shop,
        title: "Deal of the day",
        description: "Fresh deals, every single day! Get ready for unbeatable savings on farm-fresh produce with our Deals of the Day. Each day, new items go live for bidding — and the highest bidder at the end of the timer takes home the deal!"
    },
    {
        id: 6,
    icon: group,
    title: "Become a Farmer",
        description:
            "Grow with Farmchops. Are you a farmer or producer passionate about sustainability and quality? Join our growing network of local farmers and showcase your harvest to thousands of happy customers."
    }
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



