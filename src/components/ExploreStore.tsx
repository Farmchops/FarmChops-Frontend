import React from "react";
import explorebg from "../assets/explorebg.jpg";
import cartImg from "../assets/bag.png"

const ExploreStore: React.FC = () => {
    return (
        <section
            className="relative bg-cover bg-center h-[400px] flex items-center justify-center text-center"
            style={{ backgroundImage: `url(${explorebg})` }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50"></div>

            {/* Content */}
            <div className="relative z-10 max-w-lg px-4 text-white">
                <div className="flex flex-col items-center">
                <h2 className="text-3xl font-medium mb-4 max-w-100">Shop your farm produce
                    at you ease</h2>
                <button className="px-2 py-2 mt-2 rounded-md text-[#1A1A1A] bg-white text-sm font-light  transition flex gap-2" >
                    Explore Now <img src={cartImg} alt="small cart img" />
                </button>                    
                </div>

            </div>
        </section>
    );
};

export default ExploreStore;
