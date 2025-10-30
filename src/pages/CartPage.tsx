// src/pages/CartPage.tsx
import React from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
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


  const cart = cartData?.cart?.items || [];
  const totalItems = cartData?.cart?.totalItems || 0;
  const totalAmount = cartData?.cart?.totalAmount || 0;

  // EXACT SAME LOGIC AS BULKBUYING
  const handleQuantityChange = async (
    item: any,
    type: "add" | "subtract"
  ) => {
    const currentQty = item.quantity;
    const minQuantity = item.minQuantity || 1; // Get from item or default to 1
    const changeBy = minQuantity;

    console.log(minQuantity)
    let newQty = type === "add" ? currentQty + changeBy : currentQty - changeBy;

    // Prevent going below minQuantity
    if (newQty < minQuantity) {
      newQty = minQuantity;
      // If we're trying to go below minimum, remove the item instead
      try {
        await removeFromCart({
          productId: item.productId,
          body: { priceType: item.priceType },
        }).unwrap();
      } catch (error) {
        console.error("Failed to remove item:", error);
      }
      return;
    }

    // Update the cart with new quantity
    try {
      await updateCartItem({
        productId: item.productId,
        quantity: newQty,
        priceType: item.priceType,
      }).unwrap();
    } catch (error) {
      console.error("Failed to update quantity:", error);
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
        <section className="max-w-6xl min-h-[80vh] mx-auto py-10 px-4 my-10">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#F9F9F9] min-h-screen">
      <CartHero />
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-medium text-[#1A1A1A]">My Cart</h2>
            <p className="text-sm text-[#666666] mt-1">
              {totalItems} {totalItems === 1 ? 'Item' : 'Items'} in your cart
            </p>
          </div>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={handleClearCart}
              className="text-sm text-[#E74C3C] hover:text-red-800"
            >
              Clear All
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
              type="button"
              onClick={() => navigate("/products")}
              className="mt-6 px-6 py-3 bg-[#1D7B3C] text-white rounded-lg hover:bg-green-700"
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Cart Items */}
            <div className="space-y-4 md:col-span-2">
              {cart.map((item) => {
                const multiplier = item.multiplier || 1;
                const itemSubtotal = item.price * multiplier * item.quantity;
                const minQuantity = item.minQuantity || 1;
                const displayQuantity = item.priceType === 'bulk' ? item.quantity / minQuantity : item.quantity;

                return (
                  <div key={`${item.productId}-${item.priceType}`} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium text-[#1A1A1A]">{item.name}</h3>
                          <button
                            onClick={() => handleRemoveItem(item.productId, item.priceType)}
                            className="text-[#999999] hover:text-red-600"
                            disabled={isRemoving}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-sm text-[#666666]">
                            {item.unit} • <span className="capitalize">{item.priceType}</span>
                          </div>
                          <div className="font-medium text-[#1A1A1A]">
                            ₦{item.price.toLocaleString()}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border border-[#E0E0E0] rounded-md overflow-hidden">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuantityChange(item, "subtract");
                              }}
                              disabled={isUpdating || isRemoving || item.quantity <= minQuantity}
                              className="px-3 py-1 text-[#666666] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center font-medium text-[#1A1A1A]">
                              {displayQuantity}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuantityChange(item, "add");
                              }}
                              disabled={isUpdating || isRemoving}
                              className="px-3 py-1 text-[#666666] hover:bg-gray-100"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <div className="font-semibold text-[#1A1A1A]">
                            ₦{itemSubtotal.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="mt-6">
                <button
                  onClick={() => navigate("/products")}
                  className="w-full md:w-auto px-6 py-3 border border-[#1D7B3C] text-[#1D7B3C] rounded-lg hover:bg-green-50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 h-fit sticky top-4">
              <h3 className="text-lg font-medium text-[#1A1A1A] mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[#666666]">
                  <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                  <span className="font-medium">₦{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#666666]">
                  <span>Delivery Fee</span>
                  <span className="text-[#1D7B3C] font-medium">Free</span>
                </div>
                <div className="h-px bg-[#E0E0E0] my-4"></div>
                <div className="flex justify-between text-base font-medium text-[#1A1A1A]">
                  <span>Total</span>
                  <span>₦{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-[#1D7B3C] text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Proceed to Checkout
              </button>

              <p className="text-xs text-center text-[#999999] mt-4">
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