// import React from "react";
// import categoryImg from "../assets/fruit.png" 


// const categories = [
//     {
//         id: 1,
//         name: "Fresh Fruits",
//         image: categoryImg
//     },
//     {
//         id: 2,
//         name: "Vegetables",
//         image: categoryImg,
//     },
//     {
//         id: 3,
//         name: "Dairy Products",
//         image: categoryImg,
//     },
//     {
//         id: 4,
//         name: "Vegetables",
//         image: categoryImg,
//     },
//     {
//         id: 5,
//         name: "Dairy Products",
//         image: categoryImg,
//     },
// ];

// const Category: React.FC = () => {
//     return (
//         <section className="mx-auto px-4 py-12 md:py-24 bg-green-100 text-[#1A1A1A]">
//             {/* Section Heading */}
//             <p className="text-xs text-[#00B207] font-semibold mb-2 uppercase text-center">Category</p>
//             <h1 className="text-3xl font-medium mb-8 text-center">Shop by Category</h1>

//             {/* Category Grid */}
//             <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-5 justify-center md:mx-16 lg:mx-32">
//                 {categories.map((categ) => (
//                     <div
//                         key={categ.id}
//                         className="w-fit m-auto overflow-hidden border border-[#1D7B3C] rounded-[5px] hover:-translate-y-2 hover:shadow-lg transition-shadow duration-300"
//                     >
//                         <img
//                             src={categ.image}
//                             alt={categ.name}
//                             className="w-40 h-30 md:w-50 md:h-40 object-cover"
//                         />
//                         <div className="p-4 text-center text-[#1A1A1A] bg-white font-medium ">
//                             <h3 className="text-lg font-semibold">{categ.name}</h3>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </section>
//     );
// };

// export default Category;









import React from "react";
import { useNavigate } from "react-router-dom";
import categoryImg from "../assets/fruit.png";
import { useGetCategoriesQuery } from "@/redux/api/categoryApi";


const Category: React.FC = () => {
    const navigate = useNavigate();
    const { data: categoriesData, isLoading } = useGetCategoriesQuery();
    const categories = categoriesData?.data?.categories || [];

    const handleCategoryClick = (categoryId: string) => {
        navigate(`/products?category=${categoryId}`);
    };

    if (isLoading) {
        return (
            <section className="mx-auto px-4 py-12 md:py-24 bg-green-100 text-[#1A1A1A]">
                <p className="text-xs text-[#00B207] font-semibold mb-2 uppercase text-center">Category</p>
                <h1 className="text-3xl font-medium mb-8 text-center">Shop by Category</h1>
                <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-5 justify-center md:mx-16 lg:mx-32">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex flex-col animate-pulse">
                            <div className="w-full aspect-square bg-gray-300 rounded-t-[5px]"></div>
                            <div className="p-4 bg-white rounded-b-[5px]">
                                <div className="h-6 bg-gray-300 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="mx-auto px-4 py-12 md:py-24 bg-green-100 text-[#1A1A1A]">
            {/* Section Heading */}
            <p className="text-xs text-[#00B207] font-semibold mb-2 uppercase text-center">Category</p>
            <h1 className="text-3xl font-medium mb-8 text-center">Shop by Category</h1>

            {/* Category Grid */}
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-5 justify-center md:mx-16 lg:mx-32">
                {categories.slice(0, 5).map((categ) => (
                    <div
                        key={categ._id}
                        onClick={() => handleCategoryClick(categ._id)}
                        className="flex flex-col overflow-hidden border border-[#1D7B3C] rounded-[5px] hover:-translate-y-2 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    >
                        <div className="w-full aspect-square">
                            <img
                                src={categ.image || categoryImg}
                                alt={categ.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-4 text-center text-[#1A1A1A] bg-white font-medium flex-grow flex flex-col justify-center">
                            <h3 className="text-lg font-semibold">{categ.name}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Category;