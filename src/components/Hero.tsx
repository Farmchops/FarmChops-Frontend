import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import heroFarm from "../assets/hero-farm.png";
import heroDelivery from "../assets/hero-delivery.png";
import promoBanner from "../assets/promo-banner.png";

const PROMO_EXPIRY = new Date("2026-06-09");

type Slide = {
    image: string;
    alt: string;
    headline?: string;
    subtext?: string;
    ctaText: string;
    ctaLink: string;
    isPromo?: boolean;
};

const Hero: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const promoActive = new Date() < PROMO_EXPIRY;

    const slides: Slide[] = [
        ...(promoActive
            ? [
                  {
                      image: promoBanner,
                      alt: "Sallah offer — 50kg bag of rice at ₦54,999",
                      ctaText: "Shop the offer",
                      ctaLink: "/products/premium-bag-of-rice",
                      isPromo: true,
                  } as Slide,
              ]
            : []),
        {
            image: heroFarm,
            alt: "Nigerian farm with fresh vegetables and crops",
            headline: "Fresh from the farm, to your door",
            subtext: "Seasonal produce and everyday staples, sourced direct and delivered across Nigeria.",
            ctaText: "Start shopping",
            ctaLink: "/products",
        },
        {
            image: heroDelivery,
            alt: "FarmChops delivery, shipping Nigerian produce worldwide",
            headline: "Now shipping worldwide",
            subtext: "Order fresh Nigerian produce from anywhere, pay with your card, and we deliver.",
            ctaText: "Order now",
            ctaLink: "/products",
        },
    ];

    const active = slides[currentSlide] ?? slides[0];

    useEffect(() => {
        const timer = setTimeout(
            () => setCurrentSlide((prev) => (prev + 1) % slides.length),
            active.isPromo ? 8000 : 6000
        );
        return () => clearTimeout(timer);
    }, [currentSlide, slides.length, active.isPromo]);

    return (
        <section className="relative h-[420px] w-full overflow-hidden bg-surface-sunken sm:h-[460px] lg:h-[520px]">
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-700 ${
                        index === currentSlide ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                >
                    {slide.isPromo ? (
                        <Link to={slide.ctaLink} className="group block h-full w-full bg-[#f5f0e8]">
                            <img src={slide.image} alt={slide.alt} className="h-full w-full object-contain" />
                            <span className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-card bg-deal px-6 py-3 text-meta font-semibold text-deal-fg shadow-e2 transition-colors group-hover:bg-deal-hover">
                                {slide.ctaText} →
                            </span>
                        </Link>
                    ) : (
                        <>
                            <img src={slide.image} alt={slide.alt} className="h-full w-full object-cover" />
                            {/* Scrim for text legibility over the photo */}
                            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-black/10" />
                        </>
                    )}
                </div>
            ))}

            {!active.isPromo && (
                <div className="absolute inset-0 flex items-end">
                    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-5 pb-12 md:pb-14">
                        <div className="max-w-[34ch] text-balance">
                            <h1 className="text-display font-bold text-white lg:text-hero">
                                {active.headline}
                            </h1>
                            <p className="mt-2 text-body text-white/90">{active.subtext}</p>
                            <Link
                                to={active.ctaLink}
                                className="mt-5 inline-flex h-11 items-center rounded-card bg-surface px-6 text-body font-medium text-brand-ink outline-none transition-colors hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-white"
                            >
                                {active.ctaText}
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {slides.length > 1 && (
                <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setCurrentSlide(index)}
                            className={`h-2 rounded-pill bg-white transition-all ${
                                index === currentSlide ? "w-6" : "w-2 bg-white/50 hover:bg-white/80"
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default Hero;
