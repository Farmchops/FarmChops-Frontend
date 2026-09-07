import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import explorebg from "../assets/explorebg.jpg";

const ExploreStore: React.FC = () => (
    <section
        className="relative flex h-80 items-center justify-center bg-cover bg-center text-center"
        style={{ backgroundImage: `url(${explorebg})` }}
    >
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 max-w-[36ch] px-4 text-balance">
            <h2 className="text-display font-bold text-white">
                Everything for your kitchen, in one place
            </h2>
            <Link
                to="/products"
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-card bg-surface px-6 text-body font-medium text-brand-ink outline-none transition-colors hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-white"
            >
                Browse all products
                <ArrowRight size={16} aria-hidden="true" />
            </Link>
        </div>
    </section>
);

export default ExploreStore;
