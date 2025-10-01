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




// src/components/Product/ProductCard.tsx
import { useState, type FC } from "react";
import type { Product, ProductQuantityType } from "../../types/product";
import { Heart, Info } from "lucide-react";
import cartImg from "../../assets/cart.svg";
import { useDispatch } from "react-redux";
import { addItem } from "../../redux/features/cart/cartSlice";
import { formatPrice, calculateBulkSavings, canOrderBulk, getProductAvailability } from "../../data/realisticProductData";

interface ProductCardProps {
    product: Product;
}

export const ProductCard: FC<ProductCardProps> = ({ product }) => {
    const dispatch = useDispatch();
    const [adding, setAdding] = useState(false);
    const [selectedQuantityType, setSelectedQuantityType] = useState<ProductQuantityType>('retail');
    const [showQuantityOptions, setShowQuantityOptions] = useState(false);

    const availability = getProductAvailability(product);
    const bulkSavings = calculateBulkSavings(product);
    const canBulkOrder = canOrderBulk(product);
    const isOutOfStock = product.status === 'out_of_stock';
    const isLowStock = product.inventory.availableStock <= product.inventory.lowStockThreshold;

    const getCurrentPricing = () => {
        return selectedQuantityType === 'retail' ? product.pricing.retail : product.pricing.bulk;
    };

    const onAddToCart = () => {
        if (isOutOfStock) return;

        setAdding(true);
        const currentPricing = getCurrentPricing();

        dispatch(
            addItem({
                id: product._id,
                name: product.name,
                price: currentPricing.price,
                image: product.images[0],
                quantity: currentPricing.minQuantity,
                quantityType: selectedQuantityType,
                unit: currentPricing.unit
            })
        );

        setTimeout(() => setAdding(false), 700);
    };

    const getAvailabilityBadge = () => {
        if (isOutOfStock) {
            return <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md shadow">OUT OF STOCK</span>;
        }
        if (availability === 'on sale') {
            return <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-md shadow">ON SALE</span>;
        }
        if (isLowStock) {
            return <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-md shadow">LOW STOCK</span>;
        }
        if (canBulkOrder && bulkSavings.percentage > 0) {
            return <span className="absolute top-2 left-2 bg-[#1D7B3C] text-white text-xs px-2 py-1 rounded-md shadow">BULK SAVE {bulkSavings.percentage}%</span>;
        }
        return null;
    };

    return (
        <div className="max-w-72 bg-white rounded-xl shadow hover:-translate-y-2 hover:shadow-lg transition-transform duration-300 overflow-hidden relative p-1 md:p-3">
            {/* Availability Badge */}
            {getAvailabilityBadge()}

            {/* Action Icons */}
            <div className="absolute top-2 right-2 flex flex-col space-y-2">
                <button className="bg-white p-2 rounded-full shadow hover:bg-gray-100">
                    <Heart size={16} />
                </button>
                {/* Info button for product details */}
                <button
                    className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                    title="View details"
                >
                    <Info size={16} />
                </button>
            </div>

            {/* Product Image */}
            <img
                src={product.images[0]}
                alt={product.name}
                className={`w-full h-40 md:h-60 object-cover ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
            />

            {/* Info Section */}
            <div className="p-3 space-y-2 border-t border-[#E6E6E6]">
                <h3 className="text-base md:text-xl font-medium text-[#1A1A1A] line-clamp-2">
                    {product.name}
                </h3>

                {product.seller && (
                    <p className="text-sm md:text-base text-[#808080]">
                        by <span className="font-medium text-[#1D7B3C]">{product.seller}</span>
                    </p>
                )}

                {/* Stock Information */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{product.inventory.availableStock} {product.inventory.unit} available</span>
                    <span>{product.stats.orderCount} orders</span>
                </div>

                {/* Quantity Type Selector */}
                {canBulkOrder && (
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedQuantityType('retail')}
                                className={`px-3 py-1 text-xs rounded-full border transition-colors ${selectedQuantityType === 'retail'
                                        ? 'bg-[#1D7B3C] text-white border-[#1D7B3C]'
                                        : 'bg-white text-gray-600 border-gray-300 hover:border-[#1D7B3C]'
                                    }`}
                            >
                                Retail
                            </button>
                            <button
                                onClick={() => setSelectedQuantityType('bulk')}
                                className={`px-3 py-1 text-xs rounded-full border transition-colors ${selectedQuantityType === 'bulk'
                                        ? 'bg-[#1D7B3C] text-white border-[#1D7B3C]'
                                        : 'bg-white text-gray-600 border-gray-300 hover:border-[#1D7B3C]'
                                    }`}
                            >
                                Bulk {bulkSavings.percentage > 0 && `(-${bulkSavings.percentage}%)`}
                            </button>
                        </div>

                        {/* Quantity Type Info */}
                        <div className="text-xs text-gray-600">
                            {selectedQuantityType === 'retail'
                                ? `Min: ${product.pricing.retail.minQuantity} ${product.pricing.retail.unit}`
                                : `Min: ${product.pricing.bulk.minQuantity} ${product.pricing.bulk.unit}`
                            }
                        </div>
                    </div>
                )}
            </div>

            {/* Price & Add to Cart */}
            <div className="flex items-center justify-between px-1 md:px-3 pb-3">
                <div className="flex flex-col">
                    <p className="text-sm md:text-base font-semibold text-[#1A1A1A]">
                        {formatPrice(getCurrentPricing().price)}
                    </p>
                    <p className="text-xs text-gray-500">
                        {getCurrentPricing().unit}
                    </p>
                </div>

                <button
                    onClick={onAddToCart}
                    disabled={adding || isOutOfStock}
                    className={`flex items-center gap-1 px-2 py-1 md:px-3 md:py-2 rounded-md text-white text-xs md:text-sm transition ${adding
                            ? "bg-gray-400 cursor-not-allowed"
                            : isOutOfStock
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#1D7B3C] hover:bg-green-700"
                        }`}
                >
                    {adding ? "Added" : isOutOfStock ? "Out of Stock" : "Add to cart"}
                    {!isOutOfStock && (
                        <img src={cartImg} alt="cart" className="w-3 h-3 md:w-4 md:h-4" />
                    )}
                </button>
            </div>
        </div>
    );
};

