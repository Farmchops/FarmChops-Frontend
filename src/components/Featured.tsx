import React from 'react'
import featuredImg from "../assets/product.jpg"
import cartImg from "../assets/cart.svg"

const featured = [
    {
        id: 1,
        name: "Fresh Fruits",
        image: featuredImg,
        price: 200
    },
    {
        id: 2,
        name: "Vegetables",
        image: featuredImg,
        price: 200

    },
    {
        id: 3,
        name: "Dairy Products",
        image: featuredImg,
        price: 200

    },
    {
        id: 4,
        name: "Vegetables",
        image: featuredImg,
        price: 200

    },
    // {
    //     id: 5,
    //     name: "Dairy Products",
    //     image: featuredImg,
    // },
];



const Featured: React.FC = () => {
    return (
        <section className=" mx-auto px-4 py-12 md:py-24 bg-green-100 text-[#1A1A1A]">
            {/* Section Heading */}
            <p className="text-xs text-[#00B207] font-semibold mb-2 uppercase text-center">Category</p>
            <h1 className="text-3xl font-medium mb-8 text-center">Featured Product</h1>

            {/* Category Grid */}
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-4 justify-center ">
                {featured.map((feat) => (
                    <div
                        key={feat.id}
                        className="w-fit m-auto overflow-hidden   rounded-[5px] hover:-translate-y-2 hover:shadow-lg transition-shadow duration-300"
                    >
                        <img
                            src={feat.image}
                            alt={feat.name}
                            className="w-50 h-40 md:w-80 md:h-60 object-cover"
                        />
                        <div className="p-4 text-[#1A1A1A] bg-white">
                            <h3 className="text-sm">{feat.name}</h3>
                            <p className='font-medium'>₦{feat.price}</p>
                            <button className="px-2 py-2 mt-2 rounded-md bg-[#20571E] text-white text-sm font-light hover:bg-[#20571E]  transition flex gap-2 ">
                                Add to cart <img src={cartImg} alt="small cart img" />
                            </button>
                        </div>

                    </div>
                ))}
            </div>
        </section>
    )
}

export default Featured
