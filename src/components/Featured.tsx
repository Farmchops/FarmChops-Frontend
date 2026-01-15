import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetProductsQuery } from '@/redux/api/productApi'
import { BulkBuying } from './Product/BulkBuying'
import { ShoppingCart, Eye } from 'lucide-react'
import featuredImg from "../assets/product.jpg"
import type { Product } from '@/types/product'

const Featured: React.FC = () => {
    const { data: productsData, isLoading } = useGetProductsQuery({ page: 1, limit: 8 });
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Get first 4 products to display as featured
    const featuredProducts = productsData?.data?.products?.slice(0, 4) ?? [];

    // Format currency
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NG', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    // Loading skeleton
    if (isLoading) {
        return (
            <section className="mx-auto px-4 py-12 md:py-24 bg-green-100 text-[#1A1A1A]">
                <p className="text-xs text-[#00B207] font-semibold mb-2 uppercase text-center">Category</p>
                <h1 className="text-3xl font-medium mb-8 text-center">Featured Product</h1>
                <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-4 justify-center">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-fit m-auto overflow-hidden rounded-[5px] animate-pulse">
                            <div className="w-50 h-40 md:w-80 md:h-60 bg-gray-300" />
                            <div className="p-4 bg-white">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                <div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />
                                <div className="h-8 bg-gray-200 rounded w-24 mt-2" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    // No products
    if (featuredProducts.length === 0) {
        return (
            <section className="mx-auto px-4 py-12 md:py-24 bg-green-100 text-[#1A1A1A]">
                <p className="text-xs text-[#00B207] font-semibold mb-2 uppercase text-center">Category</p>
                <h1 className="text-3xl font-medium mb-8 text-center">Featured Product</h1>
                <p className="text-center text-gray-500">No featured products available</p>
            </section>
        );
    }

    return (
        <section className="mx-auto px-4 py-12 md:py-24 bg-green-100 text-[#1A1A1A]">
            <p className="text-xs text-[#00B207] font-semibold mb-2 uppercase text-center">Category</p>
            <h1 className="text-3xl font-medium mb-8 text-center">Featured Product</h1>

            <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-4 justify-center">
                {featuredProducts.map((product) => {
                    // Get the product image or use fallback
                    const productImage = product.images?.[0] || featuredImg;
                    // Get the retail price from nested pricing object
                    const price = product.pricing?.retail?.price ?? 0;

                    return (
                        <div
                            key={product._id}
                            className="w-fit m-auto overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 bg-white"
                        >
                            <Link to={`/products/${product.slug}`}>
                                <img
                                    src={productImage}
                                    alt={product.name}
                                    className="w-50 h-40 md:w-80 md:h-60 object-cover hover:scale-105 transition-transform duration-300"
                                />
                            </Link>
                            <div className="p-5 text-[#1A1A1A] bg-white">
                                <h3 className="text-base font-medium line-clamp-1 mb-2">{product.name}</h3>
                                <p className='text-lg font-semibold text-[#20571E] mb-3'>₦{formatPrice(price)}</p>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    {/* Add to Cart Button */}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedProduct(product)}
                                        className="flex-1 px-3 py-2.5 rounded-lg bg-[#20571E] text-white text-sm font-medium hover:bg-[#1a4a18] transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
                                        title="Add to cart"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        <span className="hidden sm:inline">Add</span>
                                    </button>

                                    {/* View Product Button */}
                                    <Link
                                        to={`/products/${product.slug}`}
                                        className="flex-1 px-3 py-2.5 rounded-lg bg-white border-2 border-[#20571E] text-[#20571E] text-sm font-medium hover:bg-green-50 transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
                                        title="View product details"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span className="hidden sm:inline">View</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* BulkBuying Modal */}
            {selectedProduct && (
                <BulkBuying
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </section>
    )
}

export default Featured
