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
    <div>
      <CartHero />
      <section className="max-w-6xl min-h-[60vh] mx-auto py-10 px-4 my-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#121212] mb-2">Order summary</h2>
            <p className="text-[#737373]">
              You have {totalItems} {totalItems === 1 ? "item" : "items"} waiting on your list
            </p>
          </div>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={handleClearCart}
              className="text-sm text-red-600 hover:text-red-800"
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
              type="button"
              onClick={() => navigate("/products")}
              className="mt-6 px-6 py-3 bg-[#1D7B3C] text-white rounded-lg hover:bg-green-700"
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left - Cart Table */}
            <div className="md:col-span-2 border border-[#9FA5A3]/30 rounded-lg overflow-hidden bg-green-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-[#9FA5A3]/20 text-[#808080]">
                    <tr className="text-xs md:text-sm font-light">
                      <th className="p-4">Product</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Quantity</th>
                      <th className="p-4">Subtotal</th>
                      <th className="p-4">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => {
                      const itemSubtotal = item.price * item.quantity;
                      const minQuantity = item.minQuantity || 1;

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
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuantityChange(item, "subtract");
                                }}
                                disabled={isUpdating || isRemoving || item.quantity <= minQuantity}
                                title="Decrease quantity"
                                aria-label="Decrease quantity"
                                className="p-1 border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-10 text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuantityChange(item, "add");
                                }}
                                disabled={isUpdating || isRemoving}
                                title="Increase quantity"
                                aria-label="Increase quantity"
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
                              type="button"
                              onClick={() => handleRemoveItem(item.productId, item.priceType)}
                              disabled={isRemoving}
                              title="Remove item from cart"
                              aria-label="Remove item from cart"
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Actions below table */}
              <div className="flex justify-between items-center p-4">
                <button
                  type="button"
                  onClick={() => navigate("/products")}
                  className="px-4 py-2 hover:bg-gray-100 transition"
                >
                  Continue Shopping
                </button>
              </div>
            </div>

            {/* Right - Summary */}
            <div className="border border-[#9FA5A3]/30 bg-green-100 rounded-lg p-6 h-fit sticky top-4">
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
                <div className="flex justify-between font-bold text-lg border-t border-[#9FA5A3]/30 pt-3 mt-3">
                  <span>Total:</span>
                  <span className="text-[#1D7B3C]">₦{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                className="w-full text-sm mt-6 bg-[#1D7B3C] text-white py-3 rounded-lg hover:bg-green-700 transition font-medium"
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