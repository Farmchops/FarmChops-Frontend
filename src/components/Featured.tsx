import React from 'react'
import { Link } from 'react-router-dom'
import { useGetProductsQuery } from '@/redux/api/productApi'
import cartImg from "../assets/cart.svg"
import featuredImg from "../assets/product.jpg"

const Featured: React.FC = () => {
    const { data: productsData, isLoading } = useGetProductsQuery({ page: 1, limit: 8 });

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
                        <Link
                            to={`/product/${product.slug}`}
                            key={product._id}
                            className="w-fit m-auto overflow-hidden rounded-[5px] hover:-translate-y-2 hover:shadow-lg transition-all duration-300"
                        > the backend enginee
                            <img
                                src={productImage}
                                alt={product.name}
                                className="w-50 h-40 md:w-80 md:h-60 object-cover"
                            />
                            <div className="p-4 text-[#1A1A1A] bg-white">
                                <h3 className="text-sm line-clamp-1">{product.name}</h3>
                                <p className='font-medium'>₦{formatPrice(price)}</p>
                                <button type="button" className="px-2 py-2 mt-2 rounded-md bg-[#20571E] text-white text-sm font-light hover:bg-[#1a4a18] transition flex gap-2">
                                    View Product <img src={cartImg} alt="cart icon" />
                                </button>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    )
}

export default Featured
