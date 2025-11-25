// src/pages/PayLater/PayLaterCart.tsx
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, CreditCard } from 'lucide-react';
import {
    useGetPayLaterCartQuery,
    useUpdatePayLaterCartItemMutation,
    useRemoveFromPayLaterCartMutation,
    useClearPayLaterCartMutation,
    useGetPayLaterStatusQuery
} from '@/redux/api/paylaterApi';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
    }).format(amount);
};

const PayLaterCart = () => {
    const navigate = useNavigate();

    const { data: statusData } = useGetPayLaterStatusQuery();
    const { data: cartData, isLoading } = useGetPayLaterCartQuery();
    const [updateCartItem, { isLoading: isUpdating }] = useUpdatePayLaterCartItemMutation();
    const [removeFromCart, { isLoading: isRemoving }] = useRemoveFromPayLaterCartMutation();
    const [clearCart, { isLoading: isClearing }] = useClearPayLaterCartMutation();

    const cart = cartData?.data?.cart;
    const availableCredit = statusData?.data?.account?.availableCredit ?? 0;

    const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        try {
            await updateCartItem({ productId, quantity: newQuantity }).unwrap();
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
    };

    const handleRemoveItem = async (productId: string) => {
        try {
            await removeFromCart(productId).unwrap();
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    };

    const handleClearCart = async () => {
        if (!confirm('Are you sure you want to clear your cart?')) return;
        try {
            await clearCart().unwrap();
        } catch (error) {
            console.error('Failed to clear cart:', error);
        }
    };

    const canCheckout = cart && cart.items.length > 0 && (cart.totalAmount <= availableCredit);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/paylater/shop')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">PayLater Cart</h1>
                                <p className="text-sm text-gray-600">{cart?.totalItems ?? 0} items</p>
                            </div>
                        </div>
                        {cart && cart.items.length > 0 && (
                            <button
                                onClick={handleClearCart}
                                disabled={isClearing}
                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                                {isClearing ? 'Clearing...' : 'Clear Cart'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                {!cart || cart.items.length === 0 ? (
                    /* Empty Cart */
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="w-8 h-8 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-600 mb-6">Browse products and add items to your PayLater cart</p>
                        <Link
                            to="/paylater/shop"
                            className="inline-flex items-center gap-2 bg-[#1D7B3C] text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cart.items.map((item) => (
                                <div
                                    key={item.productId}
                                    className="bg-white rounded-xl border border-gray-200 p-4"
                                >
                                    <div className="flex gap-4">
                                        {/* Image */}
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 line-clamp-2">{item.name}</h3>
                                            <div className="mt-1 flex items-baseline gap-2">
                                                <span className="text-[#1D7B3C] font-bold">
                                                    {formatCurrency(item.paylaterPrice)}
                                                </span>
                                                <span className="text-xs text-gray-500 line-through">
                                                    {formatCurrency(item.regularPrice)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">per {item.unit}</p>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => handleRemoveItem(item.productId)}
                                            disabled={isRemoving}
                                            className="p-2 text-gray-400 hover:text-red-500 transition self-start"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Quantity & Subtotal */}
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                                disabled={isUpdating || item.quantity <= 1}
                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-10 text-center font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                                disabled={isUpdating}
                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">Subtotal</p>
                                            <p className="font-bold text-gray-900">
                                                {formatCurrency(item.paylaterPrice * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
                                <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">{formatCurrency(cart.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Delivery Fee</span>
                                        <span className="font-medium">{formatCurrency(cart.estimatedDelivery)}</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-3 flex justify-between">
                                        <span className="font-bold text-gray-900">Total</span>
                                        <span className="font-bold text-[#1D7B3C] text-lg">{formatCurrency(cart.totalAmount)}</span>
                                    </div>
                                </div>

                                {/* Credit Info */}
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CreditCard className="w-4 h-4 text-[#1D7B3C]" />
                                        <span className="text-sm font-medium text-gray-900">PayLater Credit</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Available</span>
                                        <span className="font-medium">{formatCurrency(availableCredit)}</span>
                                    </div>
                                    {cart.totalAmount > availableCredit && (
                                        <p className="text-xs text-red-600 mt-2">
                                            Cart total exceeds your available credit
                                        </p>
                                    )}
                                </div>

                                {/* Checkout Button */}
                                <button
                                    onClick={() => navigate('/paylater/checkout')}
                                    disabled={!canCheckout}
                                    className={`w-full mt-4 py-3 rounded-lg font-semibold transition ${
                                        canCheckout
                                            ? 'bg-[#1D7B3C] text-white hover:bg-green-700'
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    Proceed to Checkout
                                </button>

                                <p className="text-xs text-gray-500 text-center mt-3">
                                    Payment due within 30 days via IPPIS
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PayLaterCart;
