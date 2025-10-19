import React from 'react';
import cartHero from "../../assets/cart/carthero.jpg"
import carthome from "../../assets/cart/homecart.png"
import arrow from "../../assets/cart/arrow-right.png"

const CartHero: React.FC = () => {
    return (
        <div>
            <section
                className="relative bg-cover bg-center h-20 md:h-40 flex items-center justify-start"
                style={{ backgroundImage: `url(${cartHero})` }}
            >
                {/* Overlay */}
                <div className="absolute inset-0  w-2/3 bg-gradient-to-r from-[#0A0A0A] to-transparent"></div>

                {/* Content */}
                <div className="relative z-10 max-w-lg px-4 text-white pl-8 md:pl-16 flex items-center ">
                    <img src={carthome} alt="cart_home" />
                    <img src={arrow} alt="arrow-right" className='mx-4'/>
                    <p className='text-[#00B207] font-medium text-xl'> Cart</p>
                </div>
            </section>
        </div>
    )
}

export default CartHero