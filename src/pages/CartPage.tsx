import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Minus, Plus,  } from "lucide-react";
import {
  removeItem,
  updateQuantity,
  // clearCart,
} from "../redux/features/cart/cartSlice";
import type { RootState } from "../redux/store";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import CartHero from "../components/Cart/CartHero";

const CartPage: React.FC = () => {
  const cart = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch(removeItem(id));
    } else {
      dispatch(updateQuantity({ id, quantity }));
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }
    alert(`Proceeding to checkout. Total: $${subtotal.toFixed(2)}`);
    // dispatch(clearCart());
    navigate("/checkout"); // ✅ navigate to checkout page
  };

  return (
    <div>
      <CartHero />
      <section className="max-w-6xl mx-auto py-10 px-4 my-10">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-[#121212] mb-2">Order summary</h2>
          <p className="text-[#737373]">You have items waiting on your list</p>
        </div>


        {cart.length === 0 ? (
          <p className="text-[#9FA5A3] my-10">Your cart is empty.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 ">
            {/* Left - Cart Table */}
            <div className="md:col-span-2 border border-[#9FA5A3] rounded-lg overflow-hidden">
              <table className="w-full text-left overflow-x">
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
                  {cart.map((item) => (
                    <tr key={item.id} className="">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <span>{item.name}</span>
                      </td>
                      <td className="p-4">${item.price.toFixed(2)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-1 border rounded hover:bg-gray-200"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-1 border rounded hover:bg-gray-200"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => dispatch(removeItem(item.id))}
                          className="text-red-600 hover:text-red-800"
                        >
                          {/* <Trash2 size={16} /> */}
                          X
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Actions below table */}
              <div className="flex justify-between items-center p-4">
                <button
                  onClick={() => (window.location.href = "/products")}
                  className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Return to Store
                </button>
                <button
                  onClick={() => alert("Cart updated")}
                  className="px-4 py-2 bg-[#1D7B3C] text-white rounded hover:bg-green-700"
                >
                  Update Cart
                </button>
              </div>
            </div>

            {/* Right - Summary */}
            <div className="border border-[#9FA5A3] rounded-lg p-6 h-fit">
              <h3 className="text-lg font-semibold mb-4">Cart Total</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-[#9FA5A3] pt-2">
                  <span>Total:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-[#1D7B3C] text-white py-3 rounded-lg hover:bg-green-700 transition "
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </section>

      <Footer />


    </div>

  );
};

export default CartPage;
