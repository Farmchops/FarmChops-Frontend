import React from "react";
import { Link } from "react-router-dom";
import promoBannerImg from "../assets/promo-banner.png";

const PromoBanner: React.FC = () => {
    return (
        <section className="w-full py-6 flex justify-center px-4">
            <Link to="/products" className="block group max-w-sm w-full">
                <img
                    src={promoBannerImg}
                    alt="Sallah Offer - Bag of Rice at ₦54,999"
                    className="w-full h-auto rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-[1.02]"
                />
            </Link>
        </section>
    );
};

export default PromoBanner;
