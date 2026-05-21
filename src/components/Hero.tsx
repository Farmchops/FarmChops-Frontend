import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import heroFarm from "../assets/hero-farm.png";
import heroProduce from "../assets/hero-produce.png";
import heroDelivery from "../assets/hero-delivery.png";
import heroCooking from "../assets/hero-cooking.png";
import overlayimg from "../assets/overlay.png";
import promoBanner from "../assets/promo-banner.png";

const PROMO_EXPIRY = new Date("2026-06-09");

const Hero: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const promoActive = new Date() < PROMO_EXPIRY;

    const allSlides = [
        ...(promoActive ? [{
            image: promoBanner,
            alt: "Sallah Offer - 50kg Bag of Rice at ₦54,999",
            headline: "",
            subtext: "",
            ctaText: "Shop Now",
            ctaLink: "/products/premium-bag-of-rice",
            isPromo: true,
        }] : []),
        {
            image: heroFarm,
            alt: "Nigerian farm with fresh vegetables and crops",
            headline: "Fresh from the farm\ndelivered to your door",
            subtext: "Take advantage of our seasonal discounts on summer favorites. Stock up on juicy berries, ripe melons, and garden-fresh vegetables at unbeatable prices.",
            ctaText: "Shop Today",
            ctaLink: "/products",
        },
        {
            image: heroDelivery,
            alt: "FarmChops international shipping worldwide",
            headline: "Now Shipping\nWorldwide 🌍",
            subtext: "Order fresh Nigerian produce from anywhere in the world. Pay securely with your international card and we'll deliver straight to your door.",
            ctaText: "Order Now",
            ctaLink: "/products",
        },
        {
            image: heroProduce,
            alt: "Fresh Nigerian produce and vegetables",
            headline: "Fresh from the farm\ndelivered to your door",
            subtext: "Take advantage of our seasonal discounts on summer favorites. Stock up on juicy berries, ripe melons, and garden-fresh vegetables at unbeatable prices.",
            ctaText: "Shop Today",
            ctaLink: "/products",
        },
        {
            image: heroDelivery,
            alt: "FarmChops delivery service",
            headline: "Fresh from the farm\ndelivered to your door",
            subtext: "Take advantage of our seasonal discounts on summer favorites. Stock up on juicy berries, ripe melons, and garden-fresh vegetables at unbeatable prices.",
            ctaText: "Shop Today",
            ctaLink: "/products",
        },
        {
            image: heroCooking,
            alt: "Cooking with fresh FarmChops produce",
            headline: "Fresh from the farm\ndelivered to your door",
            subtext: "Take advantage of our seasonal discounts on summer favorites. Stock up on juicy berries, ripe melons, and garden-fresh vegetables at unbeatable prices.",
            ctaText: "Shop Today",
            ctaLink: "/products",
        },
    ];

    const slides = allSlides;

    useEffect(() => {
        const duration = (slides[currentSlide] as any).isPromo ? 8000 : 5000;
        const timer = setTimeout(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, duration);

        return () => clearTimeout(timer);
    }, [currentSlide, slides.length]);

    return (
        <section className="relative w-full h-[100dvh] overflow-hidden">
            {/* Image Carousel */}
            <div className="absolute inset-0">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
                            }`}
                    >
                        {(slide as any).isPromo ? (
                            <Link to={slide.ctaLink} className="relative block w-full h-full bg-[#f5eed8] flex items-center justify-center cursor-pointer group">
                                <img
                                    src={slide.image}
                                    alt={slide.alt}
                                    className="w-full h-full object-contain"
                                />
                                <span className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-[#e07b00] hover:bg-[#c96d00] text-white font-bold text-sm md:text-base px-8 py-3 rounded-lg shadow-lg transition-transform group-hover:scale-105">
                                    Shop Now →
                                </span>
                            </Link>
                        ) : (
                            <img
                                src={slide.image}
                                alt={slide.alt}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Overlay Image aligned to bottom */}
            {!(slides[currentSlide] as any).isPromo && (
                <img
                    src={overlayimg}
                    alt="Overlay"
                    className="absolute bottom-0 left-0 w-full h-auto z-5"
                />
            )}

            {/* Text Content */}
            <div className={`relative z-10 flex flex-col items-center justify-center h-full text-center px-4 text-white ${(slides[currentSlide] as any).isPromo ? "hidden" : ""}`}>
                <h1 className="text-3xl md:text-5xl font-semibold max-w-[500px] whitespace-pre-line">
                    {slides[currentSlide].headline}
                </h1>
                <p className="mt-4 max-w-xl text-sm md:text-base">
                    {slides[currentSlide].subtext}
                </p>
                <Link
                    to={slides[currentSlide].ctaLink}
                    className="mt-6 px-6 py-3 text-[#20571E] bg-white hover:text-[#1a4718] rounded-lg transition"
                >
                    {slides[currentSlide].ctaText}
                </Link>
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all ${index === currentSlide
                            ? "bg-white w-8"
                            : "bg-white/50 hover:bg-white/75"
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};

export default Hero;
