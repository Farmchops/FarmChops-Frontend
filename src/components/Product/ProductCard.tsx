import React from "react";
import type { Product } from "../../pages/Products";
import cartImg from "../../assets/cart.svg";

interface ProductCardProps {
    product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    return (
        <div>

            <div
                key={product.id}
                className="w-fit m-auto overflow-hidden   rounded-[5px] hover:-translate-y-2 hover:shadow-lg transition-shadow duration-300"
            >
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-50 h-40 md:w-80 md:h-60 object-cover"
                />
                <div className="p-4 text-[#1A1A1A] bg-white">
                    <h3 className="text-sm">{product.name}</h3>
                    <p className='font-medium'>₦{product.price}</p>
                    <button className="px-2 py-2 mt-2 rounded-md bg-[#20571E] text-white text-sm font-light hover:bg-[#20571E]  transition flex gap-2 ">
                        Add to cart <img src={cartImg} alt="small cart img" />
                    </button>
                </div>

            </div>            
        </div>

        
    );
};
