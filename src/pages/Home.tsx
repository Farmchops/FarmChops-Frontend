import React from 'react'
import Hero from '../components/Hero'
import Category from '../components/Category'
import Featured from '../components/Featured'
import HowItWork from '../components/HowItWork'
import Features from '../components/Features'
import WhyChooseUs from '../components/WhyChooseUs'
import Footer from '../components/Footer'
import ExploreStore from '../components/ExploreStore'
import { CategoryProductRail } from '../components/home/CategoryProductRail'
import { useGetCategoriesQuery } from '@/redux/api/categoryApi'

const Home: React.FC = () => {
    const { data: categoriesData } = useGetCategoriesQuery();
    const categories = categoriesData?.data?.categories ?? [];

    return (
        <div>
            <Hero />
            <Featured />
            <Category />

            {categories[0] && (
                <CategoryProductRail
                    categorySlug={categories[0].slug}
                    categoryName={categories[0].name}
                    subtitle={`Stock up on ${categories[0].name.toLowerCase()}.`}
                />
            )}

            {categories[1] && (
                <CategoryProductRail
                    categorySlug={categories[1].slug}
                    categoryName={categories[1].name}
                    subtitle={`Fresh ${categories[1].name.toLowerCase()} for your kitchen.`}
                />
            )}

            <HowItWork />
            <Features />
            <WhyChooseUs />
            <ExploreStore />
            <Footer />
        </div>
    )
}

export default Home
