import productImg from "../assets/product.jpg"

import type {Product} from "../pages/Products";

export const mockProducts: Product[] = [
    // Vegetables
    {
        id: 1,
        name: "Fresh Spinach",
        price: 2500,
        image: productImg,
        category: ["vegetable", "leaves"],
        quantity: "retail",
        availability: "in stock",
    },
    {
        id: 2,
        name: "Carrots",
        price: 3.0,
        image: productImg,
        category: ["vegetable", "root vegetable"],
        quantity: "bulk",
        availability: "on sale",
    },

    // Grains
    {
        id: 3,
        name: "Brown Rice",
        price: 1500,
        image: productImg,
        category: ["grains"],
        quantity: "bulk",
        availability: "in stock",
    },
    {
        id: 4,
        name: "Millet",
        price: 8000,
        image: productImg,
        category: ["grains", "seeds"],
        quantity: "retail",
        availability: "sharable product",
    },

    // Herbs
    {
        id: 5,
        name: "Fresh Basil",
        price: 200,
        image: productImg,
        category: ["herbs", "leaves"],
        quantity: "retail",
        availability: "in stock",
    },
    {
        id: 6,
        name: "Rosemary",
        price: 2005,
        image: productImg,
        category: ["herbs"],
        quantity: "bulk",
        availability: "on sale",
    },

    // Seeds
    {
        id: 7,
        name: "Sunflower Seeds",
        price: 5000,
        image: productImg,
        category: ["seeds", "oils"],
        quantity: "bulk",
        availability: "in stock",
    },
    {
        id: 8,
        name: "Pumpkin Seeds",
        price: 6000,
        image: productImg,
        category: ["seeds"],
        quantity: "retail",
        availability: "sharable product",
    },

    // Leaves
    {
        id: 9,
        name: "Cabbage",
        price: 4000,
        image: productImg,
        category: ["leaves", "vegetable"],
        quantity: "bulk",
        availability: "in stock",
    },
    {
        id: 10,
        name: "Lettuce",
        price: 30000,
        image: productImg,
        category: ["leaves", "vegetable"],
        quantity: "retail",
        availability: "on sale",
    },

    // Root Vegetables
    {
        id: 11,
        name: "Potatoes",
        price: 4005,
        image: productImg,
        category: ["root vegetable", "vegetable"],
        quantity: "bulk",
        availability: "in stock",
    },
    {
        id: 12,
        name: "Ginger Root",
        price: 700,
        image: productImg,
        category: ["root vegetable", "herbs"],
        quantity: "retail",
        availability: "sharable product",
    },

    // Fish
    {
        id: 13,
        name: "Tilapia",
        price: 1200,
        image: productImg,
        category: ["fish"],
        quantity: "bulk",
        availability: "on sale",
    },
    {
        id: 14,
        name: "Catfish",
        price: 1400,
        image: productImg,
        category: ["fish"],
        quantity: "retail",
        availability: "in stock",
    },

    // Flour
    {
        id: 15,
        name: "Wheat Flour",
        price: 10000,
        image: productImg,
        category: ["flour", "grains"],
        quantity: "bulk",
        availability: "in stock",
    },
    {
        id: 16,
        name: "Cassava Flour",
        price: 90000,
        image: productImg,
        category: ["flour", "root vegetable"],
        quantity: "retail",
        availability: "on sale",
    },

    // Meat
    {
        id: 17,
        name: "Beef",
        price: 2000,
        image: productImg,
        category: ["meat"],
        quantity: "bulk",
        availability: "in stock",
    },
    {
        id: 18,
        name: "Chicken Breast",
        price: 15000,
        image: productImg,
        category: ["meat"],
        quantity: "retail",
        availability: "on sale",
    },

    // Fruits
    {
        id: 19,
        name: "Mangoes",
        price: 6000,
        image: productImg,
        category: ["fuits"],
        quantity: "retail",
        availability: "in stock",
    },
    {
        id: 20,
        name: "Bananas",
        price: 5000,
        image: productImg,
        category: ["fuits"],
        quantity: "bulk",
        availability: "sharable product",
    },

    // Oils
    {
        id: 21,
        name: "Palm Oil",
        price: 7000,
        image: productImg,
        category: ["oils"],
        quantity: "bulk",
        availability: "in stock",
    },
    {
        id: 22,
        name: "Coconut Oil",
        price: 12000,
        image: productImg,
        category: ["oils"],
        quantity: "retail",
        availability: "on sale",
    },


    //More data


    // Vegetables
    {
        id: 51,
        name: "Organic Baby Carrots",
        price: 1300,
        image: "https://via.placeholder.com/150x150?text=Baby+Carrots",
        category: ["vegetable", "root vegetable"],
        quantity: "retail",
        availability: "in stock",
    },
    {
        id: 52,
        name: "Spinach Leaves",
        price: 900,
        image: "https://via.placeholder.com/150x150?text=Spinach",
        category: ["vegetable", "leaves"],
        quantity: "bulk",
        availability: "on sale",
    },

    // Grains
    {
        id: 53,
        name: "Pearl Millet",
        price: 2700,
        image: "https://via.placeholder.com/150x150?text=Pearl+Millet",
        category: ["grains"],
        quantity: "bulk",
        availability: "in stock",
    },
    {
        id: 54,
        name: "Polished Rice",
        price: 2500,
        image: "https://via.placeholder.com/150x150?text=Polished+Rice",
        category: ["grains"],
        quantity: "retail",
        availability: "sharable product",
    },

    // Herbs
    {
        id: 55,
        name: "Fresh Basil",
        price: 1500,
        image: "https://via.placeholder.com/150x150?text=Basil",
        category: ["herbs", "leaves"],
        quantity: "retail",
        availability: "in stock",
    },
    {
        id: 56,
        name: "Mint Bunch",
        price: 1200,
        image: "https://via.placeholder.com/150x150?text=Mint",
        category: ["herbs"],
        quantity: "bulk",
        availability: "on sale",
    },

    // Seeds
    {
        id: 57,
        name: "Pumpkin Seeds",
        price: 3000,
        image: "https://via.placeholder.com/150x150?text=Pumpkin+Seeds",
        category: ["seeds"],
        quantity: "retail",
        availability: "in stock",
    },
    {
        id: 58,
        name: "Chia Seeds",
        price: 3500,
        image: "https://via.placeholder.com/150x150?text=Chia+Seeds",
        category: ["seeds"],
        quantity: "bulk",
        availability: "sharable product",
    },

    // Leaves
    {
        id: 59,
        name: "Cabbage Leaves",
        price: 1100,
        image: "https://via.placeholder.com/150x150?text=Cabbage+Leaves",
        category: ["leaves", "vegetable"],
        quantity: "retail",
        availability: "on sale",
    },
    {
        id: 60,
        name: "Lettuce",
        price: 1250,
        image: "https://via.placeholder.com/150x150?text=Lettuce",
        category: ["leaves"],
        quantity: "bulk",
        availability: "in stock",
    },

    // Root Vegetables
    {
        id: 61,
        name: "Sweet Potatoes",
        price: 2100,
        image: "https://via.placeholder.com/150x150?text=Sweet+Potatoes",
        category: ["root vegetable"],
        quantity: "bulk",
        availability: "on sale",
    },
    {
        id: 62,
        name: "Radish",
        price: 1400,
        image: "https://via.placeholder.com/150x150?text=Radish",
        category: ["root vegetable", "vegetable"],
        quantity: "retail",
        availability: "in stock",
    },

    // Fish
    {
        id: 63,
        name: "Catfish Fillet",
        price: 7000,
        image: "https://via.placeholder.com/150x150?text=Catfish",
        category: ["fish"],
        quantity: "bulk",
        availability: "sharable product",
    },
    {
        id: 64,
        name: "Mackerel",
        price: 6500,
        image: "https://via.placeholder.com/150x150?text=Mackerel",
        category: ["fish"],
        quantity: "retail",
        availability: "in stock",
    },

    // Flour
    {
        id: 65,
        name: "Sorghum Flour",
        price: 2900,
        image: "https://via.placeholder.com/150x150?text=Sorghum+Flour",
        category: ["flour", "grains"],
        quantity: "bulk",
        availability: "on sale",
    },
    {
        id: 66,
        name: "Almond Flour",
        price: 4200,
        image: "https://via.placeholder.com/150x150?text=Almond+Flour",
        category: ["flour"],
        quantity: "retail",
        availability: "in stock",
    },

    // Meat
    {
        id: 67,
        name: "Lamb Chops",
        price: 10500,
        image: "https://via.placeholder.com/150x150?text=Lamb+Chops",
        category: ["meat"],
        quantity: "bulk",
        availability: "sharable product",
    },
    {
        id: 68,
        name: "Turkey Breast",
        price: 9500,
        image: "https://via.placeholder.com/150x150?text=Turkey+Breast",
        category: ["meat"],
        quantity: "retail",
        availability: "in stock",
    },

    // Fruits
    {
        id: 69,
        name: "Mango",
        price: 1800,
        image: "https://via.placeholder.com/150x150?text=Mango",
        category: ["fruits"],
        quantity: "retail",
        availability: "on sale",
    },
    {
        id: 70,
        name: "Pineapple",
        price: 2000,
        image: "https://via.placeholder.com/150x150?text=Pineapple",
        category: ["fruits"],
        quantity: "bulk",
        availability: "in stock",
    },

    // Oils
    {
        id: 71,
        name: "Groundnut Oil",
        price: 4500,
        image: "https://via.placeholder.com/150x150?text=Groundnut+Oil",
        category: ["oils"],
        quantity: "retail",
        availability: "sharable product",
    },
    {
        id: 72,
        name: "Coconut Oil",
        price: 5000,
        image: "https://via.placeholder.com/150x150?text=Coconut+Oil",
        category: ["oils"],
        quantity: "bulk",
        availability: "in stock",
    },
];