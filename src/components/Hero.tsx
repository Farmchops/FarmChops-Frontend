import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import heroFarm from "../assets/hero-farm.png";
import heroProduce from "../assets/hero-produce.png";
import heroDelivery from "../assets/hero-delivery.png";
import heroCooking from "../assets/hero-cooking.png";
import overlayimg from "../assets/overlay.png";

const Hero: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            image: heroFarm,
            alt: "Nigerian farm with fresh vegetables and crops"
        },
        {
            image: heroProduce,
            alt: "Fresh Nigerian produce and vegetables"
        },
        {
            image: heroDelivery,
            alt: "FarmChops delivery service"
        },
        {
            image: heroCooking,
            alt: "Cooking with fresh FarmChops produce"
        }
    ];

    // Auto-advance slides every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [slides.length]);

    return (
        <section className="relative w-full h-[100dvh] overflow-hidden">
            {/* Image Carousel */}
            <div className="absolute inset-0">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"
                            }`}
                    >
                        <img
                            src={slide.image}
                            alt={slide.alt}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>

            {/* Overlay Image aligned to bottom */}
            <img
                src={overlayimg}
                alt="Overlay"
                className="absolute bottom-0 left-0 w-full h-auto z-5"
            />

            {/* Text Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 text-white">
                <h1 className="text-3xl md:text-5xl font-semibold max-w-[500px]">
                    Fresh from the farm delivered to your door
                </h1>
                <p className="mt-4 max-w-xl text-sm md:text-base">
                    Take advantage of our seasonal discounts on summer
                    favorites. Stock up on juicy berries, ripe melons, and
                    garden-fresh vegetables at unbeatable prices.
                </p>
                <Link
                    to="/products"
                    className="mt-6 px-6 py-3 text-[#20571E] bg-white hover:text-[#1a4718] rounded-lg transition"
                >
                    Shop Today
                </Link>
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
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
