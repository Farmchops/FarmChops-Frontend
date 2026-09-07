import React from 'react'
import { Check } from 'lucide-react'
import smilingWoman from "../assets/smilingfarmer.png";

const reasons = [
    "Pocket-friendly prices",
    "100% secure payments",
    "On-time delivery",
    "We act on your feedback",
    "Verified products",
];

const WhyChooseUs: React.FC = () => (
    <section className="mx-auto grid max-w-[1440px] items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-16 lg:gap-16 sm:px-5">
        <div className="relative overflow-hidden rounded-panel">
            <img
                src={smilingWoman}
                alt="A farmer holding a basket of fresh vegetables"
                className="w-full object-cover"
                loading="lazy"
            />
            <p className="absolute bottom-4 left-4 rounded-card bg-surface px-3 py-2 text-fine font-medium text-ink shadow-e2">
                Cheapest rates in the market, without cutting quality.
            </p>
        </div>

        <div>
            <p className="text-caption font-semibold uppercase tracking-wide text-brand-ink">
                Why choose us
            </p>
            <h2 className="mt-1 text-heading font-semibold text-ink">
                Benefits of shopping with us
            </h2>
            <p className="mt-3 text-meta text-ink-muted">
                Your fresh food and grocery destination — sourced direct, priced fair.
            </p>

            <ul className="mt-6 space-y-3">
                {reasons.map((r) => (
                    <li key={r} className="flex items-center gap-2 text-body text-ink">
                        <Check size={18} className="shrink-0 text-brand" aria-hidden="true" />
                        {r}
                    </li>
                ))}
            </ul>
        </div>
    </section>
)

export default WhyChooseUs;
