// import { useState, type FC } from "react";
// import type { Product } from "../../pages/Products";
// import { Heart,} from "lucide-react";
// // import { Heart, Eye } from "lucide-react";
// import cartImg from "../../assets/cart.svg";
// import { useDispatch } from "react-redux";
// import { addItem } from "../../redux/features/cart/cartSlice";

// interface ProductCardProps {
//     product: Product;
//     seller?: string;
//     shareable?: boolean;
// }

// export const ProductCard: FC<ProductCardProps> = ({ product }) => {
//     const dispatch = useDispatch();
//     const [adding, setAdding] = useState(false);

//     const onAddToCart = () => {
//         // optimistic UI: brief visual feedback
//         setAdding(true);
//         dispatch(
//             addItem({
//                 id: product.id,
//                 name: product.name,
//                 price: product.price,
//                 image: product.image,
//             })
//         );
//         // short pulse so user sees the change
//         setTimeout(() => setAdding(false), 700);
//     };

//     return (
//         <div
//             key={product.id}
//             className="max-w-72 bg-white rounded-xl shadow hover:-translate-y-2 hover:shadow-lg transition-transform duration-300 overflow-hidden relative p-1 md:p-3"
//         >
//             {/* Shareable Badge */}
//             {product.shareable && (
//                 <span className="absolute top-2 left-2 bg-[#1D7B3C] text-white text-xs px-3 py-1 rounded-md shadow">
//                     SHAREABLE
//                 </span>
//             )}

//             {/* Action Icons */}
//             <div className="absolute top-2 right-2 flex flex-col space-y-2">
//                 <button className="bg-white p-2 rounded-full shadow hover:bg-gray-100">
//                     <Heart size={16} />
//                 </button>
//                 {/* <button className="bg-white p-2 rounded-full shadow hover:bg-gray-100">
//                     <Eye size={16} />
//                 </button> */}
//             </div>

//             {/* Product Image */}
//             <img
//                 src={product.image}
//                 alt={product.name}
//                 className="w-full h-40 md:h-60 object-cover"
//             />

//             {/* Info Section */}
//             <div className="p-3 space-y-1 border-t border-[#E6E6E6]">
//                 <h3 className="text-base md:text-xl font-medium text-[#1A1A1A]">
//                     {product.name}
//                 </h3>
//                 {product.seller && (
//                     <p className="text-sm md:text-base text-[#808080]">
//                         by <span className="font-medium text-[#1D7B3C]">{product.seller}</span>
//                     </p>
//                 )}
//             </div>

//             {/* Price & Add to Cart */}
//             <div className="flex  items-center justify-between px-1 md:px-3 pb-3">
//                 <p className="text-xs md:text-sm font-medium text-[#1A1A1A]">₦{product.price}</p>
//                 {/* <button 
//                     onClick={onAddToCart}
//                     disabled={adding} 
//                     className="flex items-center gap-1 px-3 py-2 rounded-md bg-[#1D7B3C] text-white text-xs md:text-sm hover:bg-green-700 transition">
//                     Add to Cart <img src={cartImg} alt="cart" className="w-3 h-3 md:w-4 md:h-4" />
//                 </button> */}
//                 <button
//                     onClick={onAddToCart}
//                     disabled={adding}
//                     className={`flex items-center gap-1 px-1 py-1 md:px-3 md:py-2 rounded-md text-white text-xs md:text-sm transition ${adding ? "bg-gray-400 cursor-not-allowed" : "bg-[#1D7B3C] hover:bg-green-700"
//                         }`}
//                 >
//                     {adding ? "Added" : "Add to cart"}
//                     <img src={cartImg} alt="cart" className="w-3 h-3 md:w-4 md:h-4" />
//                 </button>
//             </div>
//         </div>
//     );
// };




// src/components/Product/ProductCard.tsx - Updated with API data
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import type { Product } from "../../types/product";
import cartImg from "../../assets/cart.svg";
import { useDispatch } from "react-redux";
import { addItem } from "../../redux/features/cart/cartSlice";
import { BulkBuying } from "./BulkBuying";

interface ProductCardProps {
    product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [adding, setAdding] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);

    const isOutOfStock = product.status === "out_of_stock" || product.inventory.availableStock === 0;
    const canBuyBulk = product.inventory.availableStock >= product.pricing.bulk.minQuantity && !isOutOfStock;
    const bulkSavings = product.bulkSavings?.percentage || 0;

    const handleRetailAddToCart = () => {
        if (isOutOfStock) return;

        setAdding(true);
        dispatch(
            addItem({
                id: product._id,
                name: product.name,
                price: product.pricing.retail.price,
                image: product.images[0],
                quantity: product.pricing.retail.minQuantity,
                quantityType: "retail",
                unit: product.pricing.retail.unit,
            })
        );
        setTimeout(() => setAdding(false), 700);
    };

    const handleBulkClick = () => {
        if (canBuyBulk) {
            setShowBulkModal(true);
        }
    };

    const handleProductClick = () => {
        navigate(`/products/${product.slug}`);
    };

    return (
        <>
            <div className="max-w-72 bg-white rounded-xl shadow hover:-translate-y-2 hover:shadow-lg transition-transform duration-300 overflow-hidden relative p-1 md:p-3">
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {canBuyBulk && bulkSavings > 0 && (
                        <span className="bg-[#1D7B3C] text-white text-xs px-2 py-1 rounded-md shadow font-medium">
                            SAVE {bulkSavings}%
                        </span>
                    )}
                    {isOutOfStock && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-md shadow">
                            OUT OF STOCK
                        </span>
                    )}
                    {product.isLowStock && !isOutOfStock && (
                        <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-md shadow">
                            LOW STOCK
                        </span>
                    )}
                </div>

                {/* Action Icons */}
                {/* <div className="absolute top-2 right-2 flex flex-col space-y-2 z-10">
                    <button className="bg-white p-2 rounded-full shadow hover:bg-gray-100 transition-colors">
                        <Heart size={16} />
                    </button>
                </div> */}

                {/* Product Image */}
                <div onClick={handleProductClick} className="cursor-pointer">
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className={`w-full h-40 md:h-60 object-cover ${isOutOfStock ? "opacity-50 grayscale" : ""}`}
                    />
                </div>

                {/* Info Section */}
                <div className="p-3 space-y-1 border-t border-[#E6E6E6]">
                    <h3
                        onClick={handleProductClick}
                        className="text-base md:text-xl font-medium text-[#1A1A1A] line-clamp-2 cursor-pointer hover:text-[#1D7B3C]"
                    >
                        {product.name}
                    </h3>
                    <p className="text-sm text-[#808080]">
                        by <span className="font-medium text-[#1D7B3C]">FarmChops</span>
                    </p>
                    {/* <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                        <span>{product.inventory.availableStock} {product.inventory.unit} available</span>
                        <span>{product.stats.orderCount} orders</span>
                    </div> */}
                </div>

                {/* Price & Buttons */}
                <div className="px-3 pb-3 space-y-2">
                    {/* Price Display */}
                    <div className="flex items-baseline gap-2">
                        <p className="text-sm md:text-base font-semibold text-[#1A1A1A]">
                            ₦{product.pricing.retail.price.toLocaleString()}
                        </p>
                        <span className="text-xs text-gray-500">per {product.pricing.retail.unit}</span>
                    </div>

                    {/* Buttons */}
                    {canBuyBulk ? (
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={handleRetailAddToCart}
                                disabled={adding || isOutOfStock}
                                className="flex items-center justify-center gap-1 px-2 py-2 rounded-md text-white text-xs bg-[#1D7B3C] hover:bg-green-700 transition"
                            >
                                {adding ? "Added" : "Add to Cart"} <img src={cartImg} alt="cart" className="w-3 h-3" />
                            </button>
                            <button
                                onClick={handleBulkClick}
                                className="flex items-center justify-center gap-1 px-2 py-2 rounded-md text-white text-xs bg-[#1D7B3C] hover:bg-green-700 transition"
                            >
                                Bulk <img src={cartImg} alt="cart" className="w-3 h-3" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleRetailAddToCart}
                            disabled={adding || isOutOfStock}
                            className={`w-full flex items-center justify-center gap-1 px-2 py-2 rounded-md text-white text-xs transition ${adding || isOutOfStock
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#1D7B3C] hover:bg-green-700"
                                }`}
                        >
                            {isOutOfStock ? "Out of Stock" : adding ? "Added" : "Add to cart"}
                            {!isOutOfStock && <img src={cartImg} alt="cart" className="w-3 h-3" />}
                        </button>
                    )}
                </div>
            </div>

            {/* Bulk Buying Modal */}
            {showBulkModal && (
                <BulkBuying product={product} onClose={() => setShowBulkModal(false)} />
            )}
        </>
    );
};
