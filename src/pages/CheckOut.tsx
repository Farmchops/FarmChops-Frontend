import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { Copy } from "lucide-react";
import CartHero from "../components/Cart/CartHero";

const CheckOut: React.FC = () => {
  const cart = useSelector((state: RootState) => state.cart.items);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );


  return (
    <div>
      <CartHero />

      <div className="min-h-screen bg-white flex flex-col md:flex-row justify-between gap-8 p-6 md:p-12">
        {/* LEFT: Order Summary */}
        <div className="flex-1 max-w-lg">
          <h2 className="text-2xl font-semibold mb-6">Checkout</h2>

          {cart.length === 0 ? (
            <p className="text-gray-500">Your cart is empty.</p>
          ) : (
            <>
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border-b pb-4 mb-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-600">
                      ₦{item.price.toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}

              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>

        {/* RIGHT: Payment Section */}
        <div className="w-full md:w-80 bg-green-50 border rounded-lg p-6 self-start">
          <h3 className="font-medium text-gray-800 mb-4">Payment Method</h3>
          <div className="flex flex-col gap-2 text-sm mb-6">
            <label className="flex items-center gap-2">
              <input type="radio" name="payment" /> Online Payment
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="payment" /> Virtual Wallet
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="payment" /> Payforme
            </label>
          </div>

          <button className="w-full bg-green-700 text-white py-2 rounded-md hover:bg-green-800">
            Proceed to Payment
          </button>
        </div>
      </div>






      <div className="min-h-screen bg-white flex flex-col md:flex-row justify-between gap-8 p-6 md:p-12">
        {/* LEFT: Sharing Breakdown */}
        <div className="flex-1 max-w-lg">
          {/* Product Info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded"></div>
            <div>
              <h2 className="font-semibold text-lg">50kg bag of Rice</h2>
              <p className="text-gray-600">₦80,000</p>
            </div>
          </div>

          {/* Sharing Breakdown */}
          <h3 className="font-medium text-gray-800 mb-4">Sharing breakdown</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Person 1</span>
              <span>₦20,000</span>
            </div>
            <div className="flex justify-between">
              <span>Person 1</span>
              <span>₦20,000</span>
            </div>
            <div className="flex justify-between">
              <span>Person 1</span>
              <span>₦20,000</span>
            </div>
            <div className="flex justify-between">
              <span>Person 1</span>
              <span>₦20,000</span>
            </div>
          </div>
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>Total:</span>
            <span>₦75,000</span>
          </div>

          {/* Payment link */}
          <h3 className="font-medium text-gray-800 mt-6 mb-2">Payment link</h3>
          <p className="text-sm text-gray-500 mb-2">Share this link:</p>
          <div className="flex items-center border rounded-md overflow-hidden">
            <input
              type="text"
              value="https://agrimarket.com/pay/menmpjg"
              readOnly
              className="flex-1 px-3 py-2 text-sm outline-none"
            />
            <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200">
              <Copy className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            This link will expire in 7 days. The person paying will see the same
            breakdown above.
          </p>

          <button className="mt-4 w-full bg-green-700 text-white py-2 rounded-md hover:bg-green-800">
            Share with your friends
          </button>
        </div>

        {/* RIGHT: Cart Total */}
        <div className="w-full md:w-80 bg-green-50 border rounded-lg p-6 self-start">
          <h3 className="font-medium text-gray-800 mb-4">Cart Total</h3>

          {/* Cart Items */}
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                Green Capsicum x5
              </span>
              <span>$70.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                Green Capsicum x5
              </span>
              <span>$70.00</span>
            </div>
          </div>

          {/* Subtotal + Shipping */}
          <div className="flex justify-between text-sm mb-1">
            <span>Subtotal:</span>
            <span>$84.00</span>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <span>Shipping:</span>
            <span>Free</span>
          </div>

          {/* Total */}
          <div className="flex justify-between font-semibold text-lg mb-6">
            <span>Total:</span>
            <span>$84.00</span>
          </div>

          {/* Payment Method */}
          <h3 className="font-medium text-gray-800 mb-2">Payment Method</h3>
          <div className="flex flex-col gap-2 text-sm mb-6">
            <label className="flex items-center gap-2">
              <input type="radio" name="payment" /> Online Payment
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="payment" /> Virtual Wallet
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="payment" /> Payforme
            </label>
          </div>

          <button className="w-full bg-green-700 text-white py-2 rounded-md hover:bg-green-800">
            Proceed to checkout
          </button>
        </div>
      </div>
    </div>

  );
};

export default CheckOut;



