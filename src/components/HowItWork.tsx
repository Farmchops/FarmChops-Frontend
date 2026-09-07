import React from "react";

const steps = [
    {
        title: "Place your order",
        description:
            "Browse seasonal produce and staples. Add a retail pack or a bulk tier to your cart — no subscription required.",
    },
    {
        title: "We prepare & pack",
        description:
            "Our farmers hand-pick your order and pack it fresh, so everything arrives at its best.",
    },
    {
        title: "Delivered to you",
        description:
            "Our delivery partners bring it to your door, ready to cook or store.",
    },
];

const HowItWork: React.FC = () => (
    <section className="mx-auto max-w-[1440px] px-4 sm:px-5 py-12 md:py-16">
        <p className="text-caption font-semibold uppercase tracking-wide text-brand-ink">
            How it works
        </p>
        <h2 className="mt-1 text-heading font-semibold text-ink">
            From the farm to your door
        </h2>

        <ol className="mt-8 grid gap-6 md:grid-cols-3 md:gap-8">
            {steps.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                    <span
                        aria-hidden="true"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-brand text-meta font-bold text-brand-fg"
                    >
                        {i + 1}
                    </span>
                    <div>
                        <h3 className="text-body font-semibold text-ink">{step.title}</h3>
                        <p className="mt-1 text-meta text-ink-muted">{step.description}</p>
                    </div>
                </li>
            ))}
        </ol>
    </section>
);

export default HowItWork;
