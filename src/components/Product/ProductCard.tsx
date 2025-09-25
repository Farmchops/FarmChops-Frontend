import { useState, type FC } from "react";
import type { Product } from "../../pages/Products";
import { Heart, Eye } from "lucide-react";
import cartImg from "../../assets/cart.svg";
import { useDispatch } from "react-redux";
import { addItem } from "../../redux/features/cart/cartSlice";

interface ProductCardProps {
    product: Product;
    seller?: string;
    shareable?: boolean;
}

export const ProductCard: FC<ProductCardProps> = ({ product }) => {
    const dispatch = useDispatch();
    const [adding, setAdding] = useState(false);

    const onAddToCart = () => {
        // optimistic UI: brief visual feedback
        setAdding(true);
        dispatch(
            addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
            })
        );
        // short pulse so user sees the change
        setTimeout(() => setAdding(false), 700);
    };

    return (
        <div
            key={product.id}
            className="max-w-72 bg-white rounded-xl shadow hover:-translate-y-2 hover:shadow-lg transition-transform duration-300 overflow-hidden relative p-1 md:p-3"
        >
            {/* Shareable Badge */}
            {product.shareable && (
                <span className="absolute top-2 left-2 bg-[#1D7B3C] text-white text-xs px-3 py-1 rounded-md shadow">
                    SHAREABLE
                </span>
            )}

            {/* Action Icons */}
            <div className="absolute top-2 right-2 flex flex-col space-y-2">
                <button className="bg-white p-2 rounded-full shadow hover:bg-gray-100">
                    <Heart size={16} />
                </button>
                {/* <button className="bg-white p-2 rounded-full shadow hover:bg-gray-100">
                    <Eye size={16} />
                </button> */}
            </div>

            {/* Product Image */}
            <img
                src={product.image}
                alt={product.name}
                className="w-full h-40 md:h-60 object-cover"
            />

            {/* Info Section */}
            <div className="p-3 space-y-1 border-t border-[#E6E6E6]">
                <h3 className="text-base md:text-xl font-medium text-[#1A1A1A]">
                    {product.name}
                </h3>
                {product.seller && (
                    <p className="text-sm md:text-base text-[#808080]">
                        by <span className="font-medium text-[#1D7B3C]">{product.seller}</span>
                    </p>
                )}
            </div>

            {/* Price & Add to Cart */}
            <div className="flex items-center justify-between px-1 md:px-3 pb-3">
                <p className="text-xs md:text-sm font-medium text-[#1A1A1A]">₦{product.price}</p>
                {/* <button 
                    onClick={onAddToCart}
                    disabled={adding} 
                    className="flex items-center gap-1 px-3 py-2 rounded-md bg-[#1D7B3C] text-white text-xs md:text-sm hover:bg-green-700 transition">
                    Add to Cart <img src={cartImg} alt="cart" className="w-3 h-3 md:w-4 md:h-4" />
                </button> */}
                <button
                    onClick={onAddToCart}
                    disabled={adding}
                    className={`flex items-center gap-1 px-3 py-2 rounded-md text-white text-xs md:text-sm transition ${adding ? "bg-gray-400 cursor-not-allowed" : "bg-[#1D7B3C] hover:bg-green-700"
                        }`}
                >
                    {adding ? "Added" : "Add to Cart"}
                    <img src={cartImg} alt="cart" className="w-3 h-3 md:w-4 md:h-4" />
                </button>
            </div>
        </div>
    );
};
