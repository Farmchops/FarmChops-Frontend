import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Minus, Plus, Trash2 } from "lucide-react";
import {
  removeItem,
  updateQuantity,
  clearCart,
} from "../redux/features/cartSlice";
import type { RootState } from "../redux/store";

const CartPage: React.FC = () => {
  const cart = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleUpdateQuantity = (id: number, quantity: number) => {
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
    dispatch(clearCart());
  };

  return (
    <section className="max-w-6xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-semibold mb-6">Shopping Cart</h2>

      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left - Cart Table */}
          <div className="md:col-span-2 border rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Subtotal</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id} className="border-t">
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
                        <Trash2 size={16} />
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
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Update Cart
              </button>
            </div>
          </div>

          {/* Right - Summary */}
          <div className="border rounded-lg p-6 h-fit">
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
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default CartPage;
