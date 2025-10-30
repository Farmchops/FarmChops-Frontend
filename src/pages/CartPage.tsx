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

  const handleQuantityChange = async (
    item: any,
    type: "add" | "subtract"
  ) => {
    const currentQty = item.quantity;
    const minQuantity = item.minQuantity || 1;
    const changeBy = minQuantity;

    let newQty = type === "add" ? currentQty + changeBy : currentQty - changeBy;

    if (newQty < minQuantity) {
      newQty = minQuantity;
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
    <div className="bg-gray-50 min-h-screen">
      <CartHero />
      <section className="max-w-6xl mx-auto px-2 sm:px-4 py-4 md:py-8">
        <div className="mb-4 md:mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">My Cart</h2>
            <p className="text-sm text-gray-600 mt-1">
              {totalItems} {totalItems === 1 ? 'Item' : 'Items'} in your cart
            </p>
          </div>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={handleClearCart}
              className="text-sm font-medium text-red-600 hover:text-red-800"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {/* Left - Cart Items */}
            <div className="md:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200">
                <div className="col-span-5 font-medium text-gray-600">Product</div>
                <div className="col-span-2 font-medium text-gray-600 text-center">Price</div>
                <div className="col-span-3 font-medium text-gray-600 text-center">Quantity</div>
                <div className="col-span-2 font-medium text-gray-600 text-right">Subtotal</div>
              </div>
              
              {/* Cart Items */}
              <div>
                {cart.map((item) => {
                  const multiplier = item.multiplier || 1;
                  const itemSubtotal = item.price * multiplier * item.quantity;
                  const minQuantity = item.minQuantity || 1;
                  const displayQuantity = item.priceType === 'bulk' ? item.quantity / minQuantity : item.quantity;

                  return (
                    <div key={`${item.productId}-${item.priceType}`} className="border-b border-gray-100 last:border-0">
                      <div className="p-4">
                        <div className="flex w-full items-start md:items-center">
                          {/* Product Info - Takes remaining space */}
                          <div className="flex-1 flex items-center">
                            <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <h3 className="font-medium text-gray-900">{item.name}</h3>
                              <p className="text-sm text-gray-500">{item.unit} • <span className="capitalize">{item.priceType}</span></p>
                              <button
                                onClick={() => handleRemoveItem(item.productId, item.priceType)}
                                className="md:hidden mt-1 flex items-center text-red-600 text-sm font-medium"
                                disabled={isRemoving}
                              >
                                <Trash2 size={16} className="mr-1" /> Remove
                              </button>
                            </div>
                          </div>

                          {/* Price - Only on desktop */}
                          <div className="hidden md:block w-32 text-center">
                            <span className="font-medium">₦{item.price.toLocaleString()}</span>
                          </div>

                          {/* Quantity */}
                          <div className="hidden md:block w-40">
                            <div className="flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuantityChange(item, "subtract");
                                }}
                                disabled={isUpdating || isRemoving || item.quantity <= minQuantity}
                                className="px-3 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="w-8 text-center font-medium text-gray-900">
                                {displayQuantity}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuantityChange(item, "add");
                                }}
                                disabled={isUpdating || isRemoving}
                                className="px-3 py-2 text-gray-600 hover:bg-gray-50"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Subtotal */}
                          <div className="hidden md:flex items-center w-32 justify-end pr-4">
                            <div className="font-medium">₦{itemSubtotal.toLocaleString()}</div>
                          </div>

                          {/* Remove button - Desktop */}
                          <div className="ml-4">
                            <button
                              onClick={() => handleRemoveItem(item.productId, item.priceType)}
                              className="text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
                              disabled={isRemoving}
                              aria-label="Remove item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="p-4">
                <button
                  onClick={() => navigate("/products")}
                  className="w-full px-6 py-3 text-[#1D7B3C] font-medium border-2 border-[#1D7B3C] rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>

            {/* Order Summary - Sticky on mobile */}
            <div className="bg-white rounded-xl shadow-sm p-6 h-fit md:sticky md:top-4">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                  <span className="font-medium">₦{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="h-px bg-gray-200 my-3"></div>
                <div className="flex justify-between text-base font-semibold text-gray-900">
                  <span>Total</span>
                  <span>₦{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
              >
                Continue Shopping
              </button>

              <p className="text-xs text-center text-gray-500 mt-4">
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