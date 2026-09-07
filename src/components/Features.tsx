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
        title: "Become a Vendor",
        description:
            "Grow with Farmchops. Are you a farmer or producer passionate about sustainability and quality? Join our growing network of local farmers and showcase your harvest to thousands of happy customers."
    }
];

const Features: React.FC = () => (
    <section className="bg-brand-tint">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-5 py-12 md:py-16">
            <h2 className="mb-8 text-heading font-semibold text-ink">Features</h2>
            <div className="grid gap-px overflow-hidden rounded-card border border-line-strong bg-line-strong md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature) => (
                    <div key={feature.id} className="bg-surface p-6">
                        <img src={feature.icon} alt="" className="mb-3 h-8 w-8 object-contain" />
                        <h3 className="text-body font-semibold text-brand-ink">{feature.title}</h3>
                        <p className="mt-2 text-meta text-ink-secondary">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
)

export default Features;
