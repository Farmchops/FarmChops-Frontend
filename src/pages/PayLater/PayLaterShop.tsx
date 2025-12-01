// src/pages/PayLater/PayLaterShop.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, CreditCard, Plus, Check } from 'lucide-react';
import {
    useGetPayLaterProductsQuery,
    useGetPayLaterCartQuery,
    useAddToPayLaterCartMutation,
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

const PayLaterShop = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [addingToCart, setAddingToCart] = useState<string | null>(null);
    const [addedToCart, setAddedToCart] = useState<string | null>(null);

    const { data: statusData } = useGetPayLaterStatusQuery();
    const { data: productsData, isLoading } = useGetPayLaterProductsQuery({ search: searchQuery || undefined });
    const { data: cartData } = useGetPayLaterCartQuery();
    const [addToCart] = useAddToPayLaterCartMutation();

    const availableCredit = statusData?.data?.account?.availableCredit ?? 0;
    const cartTotal = cartData?.data?.cart?.totalAmount ?? 0;
    const cartItemCount = cartData?.data?.cart?.totalItems ?? 0;

    const handleAddToCart = async (productId: string) => {
        setAddingToCart(productId);
        try {
            await addToCart({ productId, quantity: 1 }).unwrap();
            setAddedToCart(productId);
            setTimeout(() => setAddedToCart(null), 2000);
        } catch (error) {
            console.error('Failed to add to cart:', error);
        } finally {
            setAddingToCart(null);
        }
    };

    const getCartQuantity = (productId: string) => {
        return cartData?.data?.cart?.items?.find(item => item.productId === productId)?.quantity ?? 0;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-[#1D7B3C] text-white">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <CreditCard className="w-5 h-5" />
                                <span className="text-sm font-medium opacity-90">PayLater Shop</span>
                            </div>
                            <h1 className="text-2xl font-bold">Shop Now, Pay Later</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white/10 rounded-lg px-4 py-2">
                                <p className="text-xs opacity-80">Available Credit</p>
                                <p className="text-lg font-bold">{formatCurrency(availableCredit)}</p>
                            </div>
                            <Link
                                to="/paylater/cart"
                                className="relative bg-white text-[#1D7B3C] px-4 py-3 rounded-lg font-medium hover:bg-gray-100 transition flex items-center gap-2"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                <span className="hidden sm:inline">Cart</span>
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                        {cartItemCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/20 focus:border-[#1D7B3C]"
                    />
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 pb-12">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : productsData?.data?.products?.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No products found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {productsData?.data?.products?.map((product) => {
                            const inCart = getCartQuantity(product._id);
                            const isAdding = addingToCart === product._id;
                            const justAdded = addedToCart === product._id;
                            const isOutOfStock = product.status === 'out_of_stock' || product.inventory.availableStock === 0;

                            return (
                                <div
                                    key={product._id}
                                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition group"
                                >
                                    {/* Image */}
                                    <div className="relative aspect-square bg-gray-100">
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                        {isOutOfStock && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                                                    Out of Stock
                                                </span>
                                            </div>
                                        )}
                                        {inCart > 0 && !isOutOfStock && (
                                            <div className="absolute top-2 right-2 bg-[#1D7B3C] text-white text-xs px-2 py-1 rounded-full">
                                                {inCart} in cart
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="p-3">
                                        <p className="text-xs text-gray-500 mb-1">{product.category?.name}</p>
                                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
                                            {product.name}
                                        </h3>

                                        {/* Pricing */}
                                        <div className="mb-3">
                                            <p className="text-lg font-bold text-[#1D7B3C]">
                                                {formatCurrency(product.pricing.paylaterPrice)}
                                            </p>
                                        </div>

                                        {/* Add to Cart Button */}
                                        <button
                                            onClick={() => handleAddToCart(product._id)}
                                            disabled={isOutOfStock || isAdding}
                                            className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                                                isOutOfStock
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : justAdded
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-[#1D7B3C] text-white hover:bg-green-700'
                                            }`}
                                        >
                                            {isAdding ? (
                                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                            ) : justAdded ? (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    Added
                                                </>
                                            ) : isOutOfStock ? (
                                                'Out of Stock'
                                            ) : (
                                                <>
                                                    <Plus className="w-4 h-4" />
                                                    Add to Cart
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Floating Cart Summary */}
            {cartItemCount > 0 && (
                <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-sm text-gray-600">{cartItemCount} items in cart</p>
                                <p className="text-lg font-bold text-gray-900">{formatCurrency(cartTotal)}</p>
                            </div>
                            <Link
                                to="/paylater/cart"
                                className="bg-[#1D7B3C] text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                            >
                                View Cart
                            </Link>
                        </div>
                        {cartTotal > availableCredit && (
                            <p className="text-xs text-red-600">
                                Cart exceeds available credit. Remove items to checkout.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayLaterShop;
