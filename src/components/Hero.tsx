import React from "react";
import { Link } from "react-router-dom";
import heroVideo from "../assets/farm-video.mp4";
import overlayimg from "../assets/overlay.png";

const Hero: React.FC = () => {
    return (
        // <section className="relative w-full h-screen overflow-hidden">
        <section className="relative w-full h-[100dvh] overflow-hidden">

            {/* Background Video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            >
                <source
                    src={heroVideo}
                    type="video/mp4" />
                {/* Your browser does not support the video tag. */}
            </video>

            {/* Overlay Image aligned to bottom */}
            <img
                src={overlayimg}
                alt="Overlay"
                className="absolute bottom-0 left-0 w-full h-auto"
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
        </section>
    );
};

export default Hero;
