// import React from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { Minus, Plus } from "lucide-react";
// import {
//   removeItem,
//   updateQuantity,
//   // clearCart,
// } from "../redux/features/cart/cartSlice";
// import type { RootState } from "../redux/store";
// import { useNavigate } from "react-router-dom";
// import Footer from "../components/Footer";
// import CartHero from "../components/Cart/CartHero";

// const CartPage: React.FC = () => {
//   const cart = useSelector((state: RootState) => state.cart.items);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const subtotal = cart.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0
//   );

//   const handleUpdateQuantity = (id: string, quantity: number) => {
//     // Find the cart item so we can get its purchase type (bulk vs retail)
//     const item = cart.find((i) => i.id === id);
//     // Defensive: accept either `quantityType` or `type` (legacy mismatch)
//     const quantityType = (item as any)?.quantityType ?? (item as any)?.type ?? "retail";

//     if (quantity <= 0) {
//       // If you later change removeItem to accept type too, pass it here
//       dispatch(removeItem(id));
//     } else {
//       // Now include quantityType as required by your slice
//       dispatch(updateQuantity({ id, quantityType, quantity }));
//     }
//   };

//   const handleCheckout = () => {
//     if (cart.length === 0) {
//       alert("Your cart is empty");
//       return;
//     }
//     alert(`Proceeding to checkout. Total: $${subtotal.toFixed(2)}`);
//     // dispatch(clearCart());
//     navigate("/checkout");
//   };

//   return (
//     <div>
//       <CartHero />
//       <section className="max-w-6xl mx-auto py-10 px-4 my-10">
//         <div className="mb-6">
//           <h2 className="text-3xl font-bold text-[#121212] mb-2">Order summary</h2>
//           <p className="text-[#737373]">You have items waiting on your list</p>
//         </div>

//         {cart.length === 0 ? (
//           <p className="text-[#9FA5A3] my-10">Your cart is empty.</p>
//         ) : (
//           <div className="grid md:grid-cols-3 gap-8 ">
//             {/* Left - Cart Table */}
//             <div className="md:col-span-2 border border-[#9FA5A3] rounded-lg overflow-hidden">
//               <table className="w-full text-left overflow-x">
//                 <thead className="border-b border-[#9FA5A3] text-[#808080] uppercase ">
//                   <tr className="text-xs md:text-sm font-light">
//                     <th className="p-4">Product</th>
//                     <th className="p-4">Price</th>
//                     <th className="p-4">Quantity</th>
//                     <th className="p-4">Subtotal</th>
//                     <th className="p-4"></th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {cart.map((item) => {
//                     const quantityType = (item as any).quantityType ?? (item as any).type ?? "retail";
//                     return (
//                       <tr key={`${item.id}-${quantityType}`} className="">
//                         <td className="p-4 flex items-center gap-3">
//                           <img
//                             src={item.image}
//                             alt={item.name}
//                             className="w-16 h-16 object-cover rounded"
//                           />
//                           <div>
//                             <div>{item.name}</div>
//                             <div className="text-xs text-gray-500">
//                               {quantityType === "bulk" ? "Bulk" : "Retail"}
//                             </div>
//                           </div>
//                         </td>

//                         <td className="p-4">₦{item.price.toLocaleString()}</td>

//                         <td className="p-4">
//                           <div className="flex items-center gap-2">
//                             <button
//                               onClick={() =>
//                                 handleUpdateQuantity(item.id, item.quantity - 1)
//                               }
//                               className="p-1 border rounded hover:bg-gray-200"
//                             >
//                               <Minus size={14} />
//                             </button>
//                             <span className="w-8 text-center">{item.quantity}</span>
//                             <button
//                               onClick={() =>
//                                 handleUpdateQuantity(item.id, item.quantity + 1)
//                               }
//                               className="p-1 border rounded hover:bg-gray-200"
//                             >
//                               <Plus size={14} />
//                             </button>
//                           </div>
//                         </td>

//                         <td className="p-4">
//                           ₦{(item.price * item.quantity).toLocaleString()}
//                         </td>

//                         <td className="p-4">
//                           <button
//                             onClick={() => dispatch(removeItem(item.id))}
//                             className="text-red-600 hover:text-red-800"
//                           >
//                             X
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>

//               {/* Actions below table */}
//               <div className="flex justify-between items-center p-4">
//                 <button
//                   onClick={() => (window.location.href = "/products")}
//                   className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
//                 >
//                   Return to Store
//                 </button>
//                 <button
//                   onClick={() => alert("Cart updated")}
//                   className="px-4 py-2 bg-[#1D7B3C] text-white rounded hover:bg-green-700"
//                 >
//                   Update Cart
//                 </button>
//               </div>
//             </div>

//             {/* Right - Summary */}
//             <div className="border border-[#9FA5A3] rounded-lg p-6 h-fit">
//               <h3 className="text-lg font-semibold mb-4">Cart Total</h3>
//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span>Subtotal:</span>
//                   <span>₦{subtotal.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Shipping:</span>
//                   <span>Free</span>
//                 </div>
//                 <div className="flex justify-between font-bold text-lg border-t border-[#9FA5A3] pt-2">
//                   <span>Total:</span>
//                   <span>₦{subtotal.toLocaleString()}</span>
//                 </div>
//               </div>

//               <button
//                 onClick={handleCheckout}
//                 className="w-full mt-6 bg-[#1D7B3C] text-white py-3 rounded-lg hover:bg-green-700 transition "
//               >
//                 Checkout
//               </button>
//             </div>
//           </div>
//         )}
//       </section>

//       <Footer />
//     </div>
//   );
// };

// export default CartPage;













// src/pages/CartPage.tsx
import React from "react";
import { Minus, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import CartHero from "../components/Cart/CartHero";
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} from "@/redux/api/cartApi";

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: cartData, isLoading } = useGetCartQuery();
  const [updateCartItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();
  const [removeFromCart, { isLoading: isRemoving }] = useRemoveFromCartMutation();
  const [clearCart] = useClearCartMutation();

  console.log(cartData)

  const cart = cartData?.cart?.items || [];
  const totalItems = cartData?.cart?.totalItems || 0;
  const totalAmount = cartData?.cart?.totalAmount || 0;
  console.log(totalItems)

  const handleUpdateQuantity = async (
    productId: string,
    priceType: "retail" | "bulk",
    newQuantity: number
  ) => {
    if (newQuantity <= 0) {
      // Remove item if quantity is 0
      try {
        await removeFromCart({
          productId,
          body: { priceType },
        }).unwrap();
      } catch (error) {
        console.error("Failed to remove item:", error);
      }
    } else {
      // Update quantity
      try {
        await updateCartItem({
          productId,
          quantity: newQuantity,
          priceType,
        }).unwrap();
      } catch (error) {
        console.error("Failed to update quantity:", error);
      }
    }
  };

  const handleRemoveItem = async (productId: string, priceType: "retail" | "bulk") => {
    try {
      await removeFromCart({
        productId,
        body: { priceType },
      }).unwrap();
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      try {
        await clearCart().unwrap();
      } catch (error) {
        console.error("Failed to clear cart:", error);
      }
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }
    navigate("/checkout");
  };

  if (isLoading) {
    return (
      <div>
        <CartHero />
        <section className="max-w-6xl mx-auto py-10 px-4 my-10">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <CartHero />
      <section className="max-w-6xl mx-auto py-10 px-4 my-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#121212] mb-2">Order summary</h2>
            <p className="text-[#737373]">
              You have {totalItems} {totalItems === 1 ? "item" : "items"} waiting on your list
            </p>
          </div>
          {cart.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Clear Cart
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-900">Your cart is empty</h3>
            <p className="mt-2 text-gray-500">Start shopping to add items to your cart</p>
            <button
              onClick={() => navigate("/products")}
              className="mt-6 px-6 py-3 bg-[#1D7B3C] text-white rounded-lg hover:bg-green-700"
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left - Cart Table */}
            <div className="md:col-span-2 border border-[#9FA5A3] rounded-lg overflow-hidden bg-green-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-[#9FA5A3] text-[#808080] uppercase ">
                    <tr className="text-xs md:text-sm font-light">
                      <th className="p-4">Product</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Quantity</th>
                      <th className="p-4">Subtotal</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => {
                      const itemSubtotal = item.price * item.quantity;
                      return (
                        <tr
                          key={`${item.productId}-${item.priceType}`}
                          className="border-b border-gray-100"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div>
                                <div className="font-medium text-gray-900">{item.name}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {item.unit} •{" "}
                                  <span className="capitalize">{item.priceType}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-4 text-gray-900">
                            ₦{item.price.toLocaleString()}
                          </td>

                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.productId,
                                    item.priceType,
                                    item.quantity - 1
                                  )
                                }
                                disabled={isUpdating || isRemoving}
                                className="p-1 border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-10 text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.productId,
                                    item.priceType,
                                    item.quantity + 1
                                  )
                                }
                                disabled={isUpdating || isRemoving}
                                className="p-1 border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </td>

                          <td className="p-4 font-medium text-gray-900">
                            ₦{itemSubtotal.toLocaleString()}
                          </td>

                          <td className="p-4">
                            <button
                              onClick={() => handleRemoveItem(item.productId, item.priceType)}
                              disabled={isRemoving}
                              className="text-red-600 hover:text-red-800 disabled:opacity-50"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Actions below table */}
              <div className="flex justify-between items-center p-4 bg-gray-50">
                <button
                  onClick={() => navigate("/products")}
                  className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-100 transition"
                >
                  Continue Shopping
                </button>
              </div>
            </div>

            {/* Right - Summary */}
            <div className="border border-[#9FA5A3] rounded-lg p-6 h-fit sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Cart Total</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Items ({totalItems}):</span>
                  <span className="font-medium">₦{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping:</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-[#9FA5A3] pt-3 mt-3">
                  <span>Total:</span>
                  <span className="text-[#1D7B3C]">₦{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-[#1D7B3C] text-white py-3 rounded-lg hover:bg-green-700 transition font-medium"
              >
                Proceed to Checkout
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Tax included and shipping calculated at checkout
              </p>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default CartPage;