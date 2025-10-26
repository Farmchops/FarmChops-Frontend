// // src/components/Product/ProductCard.tsx
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import type { Product } from "../../types/product";
// import cartImg from "../../assets/cart.svg";
// import { useDispatch } from "react-redux";
// import { addItem } from "../../redux/features/cart/cartSlice";
// import { BulkBuying } from "./BulkBuying";

// /* shadcn dropdown imports - adjust path if your project uses a different alias */
// import {
//     DropdownMenu,
//     DropdownMenuTrigger,
//     DropdownMenuContent,
//     DropdownMenuLabel,
//     DropdownMenuItem,
//     DropdownMenuSeparator,
// } from "@/components/ui/dropdown-menu";

// interface ProductCardProps {
//     product: Product;
// }

// export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
//     const navigate = useNavigate();
//     const dispatch = useDispatch();
//     const [adding, setAdding] = useState(false);
//     const [showBulkModal, setShowBulkModal] = useState(false);
//     const [dropdownOpen, setDropdownOpen] = useState(false);

//     const isOutOfStock =
//         product.status === "out_of_stock" || product.inventory.availableStock === 0;

//     const hasBulkTiers =
//         product.pricing.bulkTiers && product.pricing.bulkTiers.length > 0;

//     const canBuyBulk =
//         hasBulkTiers &&
//         product.pricing.bulkTiers?.some(
//             (tier) => product.inventory.availableStock >= tier.minQuantity
//         ) &&
//         !isOutOfStock;

//     const bulkSavings = product.bulkSavings?.percentage || 0;

//     const handleRetailAddToCart = () => {
//         if (isOutOfStock) return;

//         setAdding(true);
//         dispatch(
//             addItem({
//                 id: product._id,
//                 name: product.name,
//                 price: product.pricing.retail.price,
//                 image: product.images[0],
//                 quantity: product.pricing.retail.minQuantity,
//                 quantityType: "retail",
//                 unit: product.pricing.retail.unit,
//             })
//         );
//         setTimeout(() => setAdding(false), 700);
//     };

//     const handleSelectTier = (tier: string) => {
//         // close dropdown then open full bulk drawer
//         setDropdownOpen(false);
//         setShowBulkModal(true);
//         // Optionally: pass initial selected tier to BulkBuying in future
//         // E.g. setInitialTier(tierName) and pass to BulkBuying
//         console.log(tier)
//     };

//     const handleProductClick = () => {
//         navigate(`/products/${product.slug}`);
//     };

//     return (
//         <>
//             <div className="max-w-72 bg-white rounded-xl shadow hover:-translate-y-2 hover:shadow-lg transition-transform duration-300 overflow-hidden relative p-1 md:p-3">
//                 {/* Badges */}
//                 <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
//                     {canBuyBulk && bulkSavings > 0 && (
//                         <span className="bg-[#1D7B3C] text-white text-xs px-2 py-1 rounded-md shadow font-medium">
//                             SAVE {bulkSavings}%
//                         </span>
//                     )}
//                     {isOutOfStock && (
//                         <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-md shadow">
//                             OUT OF STOCK
//                         </span>
//                     )}
//                     {product.isLowStock && !isOutOfStock && (
//                         <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-md shadow">
//                             LOW STOCK
//                         </span>
//                     )}
//                 </div>

//                 {/* Product Image */}
//                 <div onClick={handleProductClick} className="cursor-pointer">
//                     <img
//                         src={product.images[0]}
//                         alt={product.name}
//                         className={`w-full h-40 md:h-60 object-cover ${isOutOfStock ? "opacity-50 grayscale" : ""
//                             }`}
//                     />
//                 </div>

//                 {/* Info Section */}
//                 <div className="p-3 space-y-1 border-t border-[#E6E6E6]">
//                     <h3
//                         onClick={handleProductClick}
//                         className="text-base md:text-xl font-medium text-[#1A1A1A] line-clamp-2 cursor-pointer hover:text-[#1D7B3C]"
//                     >
//                         {product.name}
//                     </h3>
//                     <p className="text-sm text-[#808080]"></p>
//                 </div>

//                 {/* Price & Buttons */}
//                 <div className="px-3 pb-3 space-y-2">
//                     {/* Price Display */}
//                     <div className="flex items-baseline gap-2">
//                         <p className="text-sm md:text-base font-semibold text-[#1A1A1A]">
//                             ₦{product.pricing.retail.price.toLocaleString()}
//                         </p>
//                         <span className="text-xs text-gray-500">
//                             {" "}
//                             {product.pricing.retail.unit}{" "}
//                         </span>
//                     </div>

//                     {/* Buttons */}
//                     {canBuyBulk ? (
//                         <div className="relative inline-block">
//                             <div className="grid md:grid-cols-2 w-fit gap-2">
//                                 <button
//                                     onClick={handleRetailAddToCart}
//                                     disabled={adding || isOutOfStock}
//                                     className="flex items-center justify-center gap-1 px-2 py-2 rounded-md text-white text-xs bg-[#1D7B3C] hover:bg-green-700 transition disabled:opacity-50"
//                                 >
//                                     {adding ? "Added" : "Add to cart"}{" "}
//                                     <img src={cartImg} alt="cart" className="w-3 h-3" />
//                                 </button>

//                                 {/* shadcn DropdownMenu - Trigger must use asChild to attach to our button */}
//                                 <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
//                                     <DropdownMenuTrigger asChild>
//                                         <button
//                                             onClick={() => { }}
//                                             className="flex items-center justify-center gap-1 px-2 py-2 rounded-md text-white text-xs bg-[#1D7B3C] hover:bg-green-700 transition"
//                                             aria-expanded={dropdownOpen}
//                                         >
//                                             Bulk <img src={cartImg} alt="cart" className="w-3 h-3" />
//                                         </button>
//                                     </DropdownMenuTrigger>

//                                     {/* Content renders in a portal (shadcn default). Styling keeps it from being clipped. */}
//                                     <DropdownMenuContent
//                                         align="end"
//                                         sideOffset={6}
//                                         className="w-80 sm:w-96 p-0 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden"
//                                     >
//                                         <div className="p-3 border-b border-gray-100">
//                                             <div className="flex items-center justify-between">
//                                                 <DropdownMenuLabel className="text-sm font-semibold">
//                                                     Bulk tiers
//                                                 </DropdownMenuLabel>
//                                                 <button
//                                                     onClick={() => setDropdownOpen(false)}
//                                                     className="text-xs text-gray-500 px-2 py-1"
//                                                 >
//                                                     Close
//                                                 </button>
//                                             </div>
//                                         </div>

//                                         <div className="max-h-64 overflow-auto">
//                                             {product.pricing.bulkTiers?.map((tier) => (
//                                                 <DropdownMenuItem
//                                                     key={tier.name}
//                                                     onSelect={(e) => {
//                                                         e.preventDefault();
//                                                         // open the full BulkBuying modal & close dropdown
//                                                         handleSelectTier(tier.name);
//                                                     }}
//                                                     className="flex items-center justify-between gap-2 p-3 hover:bg-gray-50"
//                                                 >
//                                                     <div className="flex items-start gap-3">
//                                                         <img
//                                                             src={product.images[0]}
//                                                             alt={tier.name}
//                                                             className="w-10 h-10 object-cover rounded"
//                                                         />
//                                                         <div>
//                                                             <p className="text-sm font-medium">{tier.name}</p>
//                                                             <p className="text-xs text-gray-500 mt-0.5">
//                                                                 ₦{tier.price.toLocaleString()} • min {tier.minQuantity}{" "}
//                                                                 {product.inventory.unit}
//                                                             </p>
//                                                         </div>
//                                                     </div>

//                                                     <div className="flex flex-col items-end gap-2">
//                                                         {/* <button
//                                                             onClick={(e) => {
//                                                                 e.stopPropagation();
//                                                                 handleSelectTier(tier.name);
//                                                             }}
//                                                             className="px-3 py-1 rounded-full text-xs font-medium bg-[#1D7B3C] text-white hover:bg-green-700"
//                                                         >
//                                                             Select
//                                                         </button> */}
//                                                         {/* <span className="text-xs text-gray-500">{tier.unit}</span> */}
//                                                     </div>
//                                                 </DropdownMenuItem>
//                                             ))}
//                                         </div>

//                                         <DropdownMenuSeparator />

//                                     </DropdownMenuContent>
//                                 </DropdownMenu>
//                             </div>
//                         </div>
//                     ) : (
//                         <button
//                             onClick={handleRetailAddToCart}
//                             disabled={adding || isOutOfStock}
//                             className={`flex items-center justify-center gap-1 px-2 py-2 rounded-md text-white text-xs transition ${adding || isOutOfStock
//                                 ? "bg-gray-400 cursor-not-allowed"
//                                 : "bg-[#1D7B3C] hover:bg-green-700"
//                                 }`}
//                         >
//                             {isOutOfStock ? "Out of Stock" : adding ? "Added" : "Add to cart"}
//                             {!isOutOfStock && <img src={cartImg} alt="cart" className="w-3 h-3" />}
//                         </button>
//                     )}
//                 </div>
//             </div>

//             {/* Bulk Buying Drawer */}
//             {showBulkModal && (
//                 <BulkBuying product={product} onClose={() => setShowBulkModal(false)} />
//             )}
//         </>
//     );
// };







// src/components/Product/ProductCard.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../../types/product";
import cartImg from "../../assets/cart.svg";
import { BulkBuying } from "./BulkBuying";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAddToCartMutation } from "@/redux/api/cartApi";

interface ProductCardProps {
    product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const navigate = useNavigate();
    const [addToCart, { isLoading: adding }] = useAddToCartMutation();


    const [showBulkModal, setShowBulkModal] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const isOutOfStock =
        product.status === "out_of_stock" || product.inventory.availableStock === 0;

    const hasBulkTiers =
        product.pricing.bulkTiers && product.pricing.bulkTiers.length > 0;

    const canBuyBulk =
        hasBulkTiers &&
        product.pricing.bulkTiers?.some(
            (tier) => product.inventory.availableStock >= tier.minQuantity
        ) &&
        !isOutOfStock;

    const bulkSavings = product.bulkSavings?.percentage || 0;

    const handleRetailAddToCart = async () => {
        if (isOutOfStock) return;

        try {
            const addingcart = await addToCart({
                productId: product._id,
                name: product.name,
                image: product.images[0],
                price: product.pricing.retail.price,
                quantity: product.pricing.retail.minQuantity,
                unit: product.pricing.retail.unit,
                priceType: "retail",
            }).unwrap();

            console.log(addingcart)
        } catch (error) {
            console.error("Failed to add to cart:", error);
        }
    };

    const handleSelectTier = (tier: string) => {
        setDropdownOpen(false);
        setShowBulkModal(true);
        console.log(tier);
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

                {/* Product Image */}
                <div onClick={handleProductClick} className="cursor-pointer">
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className={`w-full h-40 md:h-60 object-cover ${isOutOfStock ? "opacity-50 grayscale" : ""
                            }`}
                    />
                </div>

                {/* Info Section */}
                <div className="p-2 space-y-1 border-t border-[#E6E6E6]">
                    <h3
                        onClick={handleProductClick}
                        className="text-base md:text-xl font-medium text-[#1A1A1A] line-clamp-2 cursor-pointer hover:text-[#1D7B3C]"
                    >
                        {product.name}
                    </h3>
                </div>

                {/* Price & Buttons */}
                <div className="px-3 pb-2 space-y-2">
                    {/* Price Display */}
                    <div className="flex items-baseline gap-2">
                        <p className="text-sm md:text-base font-semibold text-[#1A1A1A]">
                            ₦{product.pricing.retail.price.toLocaleString()}
                        </p>
                        <span className="text-xs text-gray-500">
                            {product.pricing.retail.unit}
                        </span>
                    </div>

                    {/* Buttons */}
                    {canBuyBulk ? (
                        <div>
                            <button
                                onClick={handleRetailAddToCart}
                                disabled={adding || isOutOfStock}
                                className="flex items-center justify-center gap-1 px-2 py-2 rounded-md text-white text-xs bg-[#1D7B3C] hover:bg-green-700 transition disabled:opacity-50"
                            >
                                {adding ? "Added" : "Add to cart"}{" "}
                                <img src={cartImg} alt="cart" className="w-3 h-3" />
                            </button>
                            <div className="relative inline-block">
                                <div className="w-fit gap-2">


                                    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                className="flex items-center justify-center gap-1 px-2 py-2  transition"
                                                aria-expanded={dropdownOpen}
                                            >
                                                Option
                                            </button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent
                                            align="end"
                                            sideOffset={6}
                                            className="w-70 sm:w-76 p-0 bg-white rounded-lg- shadow-lg- overflow-hidden "
                                        >
                                            <div className="p-3- border-none border-b- border-gray-100-">
                                                <div className="flex items-center justify-between">
                                                    <DropdownMenuLabel className="text-sm font-semibold">
                                                        Bulk
                                                    </DropdownMenuLabel>
                                                    <button
                                                        onClick={() => setDropdownOpen(false)}
                                                        className="text-xs text-gray-500 px-2 py-1"
                                                    >
                                                        Close
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="max-h-64 overflow-auto">
                                                {product.pricing.bulkTiers?.map((tier) => (
                                                    <DropdownMenuItem
                                                        key={tier.name}
                                                        onSelect={(e) => {
                                                            e.preventDefault();
                                                            handleSelectTier(tier.name);
                                                        }}
                                                        className="flex items-center justify-between gap-2 p-3 hover:bg-gray-50"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <img
                                                                src={product.images[0]}
                                                                alt={tier.name}
                                                                className="w-10 h-10 object-cover rounded"
                                                            />
                                                            <div>
                                                                <p className="text-sm font-medium">{tier.name}</p>
                                                                <p className="text-xs text-gray-500 mt-0.5">
                                                                    ₦{tier.price.toLocaleString()} • min{" "}
                                                                    {tier.minQuantity} {product.inventory.unit}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </DropdownMenuItem>
                                                ))}
                                            </div>

                                            <DropdownMenuSeparator />
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>

                    ) : (
                        <button
                            onClick={handleRetailAddToCart}
                            disabled={adding || isOutOfStock}
                            className={`flex items-center justify-center gap-1 px-2 py-2 rounded-md text-white text-xs transition ${adding || isOutOfStock
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

            {/* Bulk Buying Drawer */}
            {showBulkModal && (
                <BulkBuying product={product} onClose={() => setShowBulkModal(false)} />
            )}
        </>
    );
};