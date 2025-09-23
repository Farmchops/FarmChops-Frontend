import React from "react";
import explorebg2 from "../../assets/productIcon/productPageHero.jpg";
import bagg from "../../assets/Bag.png"

const ProductPageHero: React.FC = () => {
    return (
        <section
            className="relative bg-cover bg-center h-[200px] md:h-[350px] flex items-center justify-center text-center m-2 rounded-2xl md:my-4 md:mx-8 md:rounded-4xl"
            style={{ backgroundImage: `url(${explorebg2})` }}
        >
            {/* Overlay (sticks to bottom) */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent rounded-4xl "></div>

            {/* Content */}
            <div className="relative z-10 max-w-lg px-4 text-white">
                <div className="flex flex-col items-center">
                    <h2 className="text-3xl font-medium mb-4 max-w-100">Shop your farm produce
                        at you ease</h2>
                    <button className="px-2 py-2 mt-2 rounded-md text-[#20571E] bg-white text-sm transition flex gap-2" >
                        Explore Now <img src={bagg} alt="small cart img" />
                    </button>
                </div>

            </div>
        </section>
    );
};

export default ProductPageHero;
