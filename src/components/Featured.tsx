import React from 'react'
import { useGetProductsQuery } from '@/redux/api/productApi'
import { ProductRail } from './home/ProductRail'

const Featured: React.FC = () => {
    // Over-fetch so that, after dropping out-of-stock items, we can still fill the rail.
    const { data: productsData, isLoading } = useGetProductsQuery({ page: 1, limit: 20 });

    const featuredProducts = (productsData?.data?.products ?? [])
        .filter((p) => p.status !== 'out_of_stock')
        .slice(0, 10);

    return (
        <ProductRail
            title="Fresh picks"
            subtitle="New in the market this week."
            viewAllHref="/products"
            products={featuredProducts}
            isLoading={isLoading}
        />
    )
}

export default Featured
