import appleImg from "../assets/productIcon/apple.png";
import type { Product } from "../types/product";

export const mockProducts: Product[] = [
    // Vegetables
    {
        _id: "prod_001",
        name: "Fresh Spinach",
        description: "Fresh organic spinach leaves, perfect for salads and cooking. Rich in iron and vitamins.",
        images: [appleImg],
        category: "Vegetables",
        pricing: {
            retail: {
                price: 500,
                unit: "per bundle",
                minQuantity: 1
            },
            bulk: {
                price: 4000,
                unit: "per 10 bundles",
                minQuantity: 10
            }
        },
        inventory: {
            availableStock: 50,
            lowStockThreshold: 10,
            unit: "bundles"
        },
        status: "active",
        tags: ["organic", "leafy", "vitamin-rich"],
        slug: "fresh-spinach",
        stats: {
            viewCount: 245,
            orderCount: 18,
            totalSold: 120
        },
        seller: "GreenFarm Co",
        shareable: true,
        createdAt: "2024-01-15T08:30:00Z",
        updatedAt: "2024-09-20T14:22:00Z"
    },
    {
        _id: "prod_002",
        name: "Premium Carrots",
        description: "Sweet, crunchy carrots perfect for cooking, juicing, or snacking.",
        images: [appleImg],
        category: "Vegetables",
        pricing: {
            retail: {
                price: 800,
                unit: "per kg",
                minQuantity: 1
            },
            bulk: {
                price: 15000,
                unit: "per 25kg bag",
                minQuantity: 25
            }
        },
        inventory: {
            availableStock: 200,
            lowStockThreshold: 25,
            unit: "kg"
        },
        status: "active",
        tags: ["sweet", "crunchy", "vitamin-a"],
        slug: "premium-carrots",
        stats: {
            viewCount: 189,
            orderCount: 24,
            totalSold: 85
        },
        seller: "FarmChop Ltd",
        shareable: true,
        createdAt: "2024-02-01T10:15:00Z",
        updatedAt: "2024-09-22T09:45:00Z"
    },

    // Grains
    {
        _id: "prod_003",
        name: "Brown Rice (Ofada)",
        description: "Premium quality Nigerian brown rice, rich in nutrients and perfect for healthy meals.",
        images: [appleImg],
        category: "Grains",
        pricing: {
            retail: {
                price: 1200,
                unit: "per kg",
                minQuantity: 1
            },
            bulk: {
                price: 28000,
                unit: "per 25kg bag",
                minQuantity: 25
            }
        },
        inventory: {
            availableStock: 500,
            lowStockThreshold: 50,
            unit: "kg"
        },
        status: "active",
        tags: ["organic", "nigerian", "whole-grain"],
        slug: "brown-rice-ofada",
        stats: {
            viewCount: 567,
            orderCount: 45,
            totalSold: 300
        },
        seller: "AgroWorld",
        shareable: true,
        createdAt: "2024-01-20T14:30:00Z",
        updatedAt: "2024-09-25T11:20:00Z"
    },
    {
        _id: "prod_004",
        name: "Premium Millet",
        description: "High-quality millet grains, excellent source of protein and minerals.",
        images: [appleImg],
        category: "Grains",
        pricing: {
            retail: {
                price: 1500,
                unit: "per kg",
                minQuantity: 1
            },
            bulk: {
                price: 35000,
                unit: "per 25kg bag",
                minQuantity: 25
            }
        },
        inventory: {
            availableStock: 8,
            lowStockThreshold: 10,
            unit: "kg"
        },
        status: "active",
        tags: ["protein-rich", "gluten-free", "ancient-grain"],
        slug: "premium-millet",
        stats: {
            viewCount: 156,
            orderCount: 12,
            totalSold: 45
        },
        seller: "Northern Grains Ltd",
        shareable: false, // Low stock
        createdAt: "2024-03-10T09:45:00Z",
        updatedAt: "2024-09-24T16:30:00Z"
    },

    // Herbs & Spices
    {
        _id: "prod_005",
        name: "Fresh Basil Leaves",
        description: "Aromatic fresh basil leaves perfect for cooking and garnishing.",
        images: [appleImg],
        category: "Herbs & Spices",
        pricing: {
            retail: {
                price: 300,
                unit: "per pack",
                minQuantity: 1
            },
            bulk: {
                price: 2500,
                unit: "per 10 packs",
                minQuantity: 10
            }
        },
        inventory: {
            availableStock: 25,
            lowStockThreshold: 5,
            unit: "packs"
        },
        status: "active",
        tags: ["aromatic", "fresh", "culinary"],
        slug: "fresh-basil-leaves",
        stats: {
            viewCount: 89,
            orderCount: 8,
            totalSold: 30
        },
        seller: "HerbalCo",
        shareable: true,
        createdAt: "2024-04-05T11:20:00Z",
        updatedAt: "2024-09-23T08:15:00Z"
    },

    // Proteins
    {
        _id: "prod_006",
        name: "Fresh Catfish",
        description: "Fresh catfish, cleaned and ready for cooking. High in protein and omega-3 fatty acids.",
        images: [appleImg],
        category: "Fish & Seafood",
        pricing: {
            retail: {
                price: 2500,
                unit: "per kg",
                minQuantity: 1
            },
            bulk: {
                price: 22000,
                unit: "per 10kg",
                minQuantity: 10
            }
        },
        inventory: {
            availableStock: 45,
            lowStockThreshold: 10,
            unit: "kg"
        },
        status: "active",
        tags: ["fresh", "protein", "omega-3"],
        slug: "fresh-catfish",
        stats: {
            viewCount: 234,
            orderCount: 19,
            totalSold: 67
        },
        seller: "BlueWater Fish",
        shareable: true,
        createdAt: "2024-02-15T07:45:00Z",
        updatedAt: "2024-09-25T13:30:00Z"
    },

    // Fruits
    {
        _id: "prod_007",
        name: "Sweet Mangoes",
        description: "Juicy, sweet mangoes perfect for eating fresh or making smoothies.",
        images: [appleImg],
        category: "Fruits",
        pricing: {
            retail: {
                price: 1200,
                unit: "per kg",
                minQuantity: 1
            },
            bulk: {
                price: 25000,
                unit: "per crate (25kg)",
                minQuantity: 25
            }
        },
        inventory: {
            availableStock: 150,
            lowStockThreshold: 20,
            unit: "kg"
        },
        status: "active",
        tags: ["sweet", "juicy", "vitamin-c"],
        slug: "sweet-mangoes",
        stats: {
            viewCount: 445,
            orderCount: 35,
            totalSold: 180
        },
        seller: "Tropical Fruits Ltd",
        shareable: true,
        createdAt: "2024-03-01T12:00:00Z",
        updatedAt: "2024-09-24T10:45:00Z"
    },

    // Oils
    {
        _id: "prod_008",
        name: "Pure Palm Oil",
        description: "100% pure palm oil, perfect for cooking traditional Nigerian dishes.",
        images: [appleImg],
        category: "Oils & Fats",
        pricing: {
            retail: {
                price: 3500,
                unit: "per 1L bottle",
                minQuantity: 1
            },
            bulk: {
                price: 65000,
                unit: "per 20L container",
                minQuantity: 20
            }
        },
        inventory: {
            availableStock: 80,
            lowStockThreshold: 15,
            unit: "liters"
        },
        status: "active",
        tags: ["pure", "traditional", "cooking"],
        slug: "pure-palm-oil",
        stats: {
            viewCount: 298,
            orderCount: 28,
            totalSold: 95
        },
        seller: "Golden Oil Mills",
        shareable: true,
        createdAt: "2024-01-25T15:30:00Z",
        updatedAt: "2024-09-22T17:20:00Z"
    },

    // Out of stock example
    {
        _id: "prod_009",
        name: "Organic Wheat Flour",
        description: "Premium organic wheat flour, perfect for baking bread and pastries.",
        images: [appleImg],
        category: "Flour & Grains",
        pricing: {
            retail: {
                price: 2000,
                unit: "per kg",
                minQuantity: 1
            },
            bulk: {
                price: 45000,
                unit: "per 25kg bag",
                minQuantity: 25
            }
        },
        inventory: {
            availableStock: 0,
            lowStockThreshold: 10,
            unit: "kg"
        },
        status: "out_of_stock",
        tags: ["organic", "premium", "baking"],
        slug: "organic-wheat-flour",
        stats: {
            viewCount: 178,
            orderCount: 15,
            totalSold: 120
        },
        seller: "Organic Mills Ltd",
        shareable: false,
        createdAt: "2024-02-20T09:15:00Z",
        updatedAt: "2024-09-25T14:00:00Z"
    },

    // On sale example
    {
        _id: "prod_010",
        name: "Yellow Plantains",
        description: "Sweet yellow plantains, perfect for frying or boiling.",
        images: [appleImg],
        category: "Fruits",
        pricing: {
            retail: {
                price: 800, // Discounted from 1000
                unit: "per kg",
                minQuantity: 1
            },
            bulk: {
                price: 18000, // Discounted from 22000
                unit: "per 25kg bunch",
                minQuantity: 25
            }
        },
        inventory: {
            availableStock: 120,
            lowStockThreshold: 20,
            unit: "kg"
        },
        status: "active",
        tags: ["sweet", "versatile", "on-sale"],
        slug: "yellow-plantains",
        stats: {
            viewCount: 356,
            orderCount: 42,
            totalSold: 200
        },
        seller: "Banana Republic Farm",
        shareable: true,
        createdAt: "2024-03-15T11:45:00Z",
        updatedAt: "2024-09-25T16:30:00Z"
    }
];

// Helper functions
export const getProductAvailability = (product: Product): ProductAvailability => {
    if (product.inventory.availableStock === 0) return 'in stock';
    if (product.inventory.availableStock <= product.inventory.lowStockThreshold) return 'low stock';
    if (product.tags.includes('on-sale')) return 'on sale';
    return 'in stock';
};

export const calculateBulkSavings = (product: Product) => {
    const retailPerUnit = product.pricing.retail.price / product.pricing.retail.minQuantity;
    const bulkPerUnit = product.pricing.bulk.price / product.pricing.bulk.minQuantity;

    const savings = retailPerUnit - bulkPerUnit;
    const savingsPercent = savings > 0 ? Math.round((savings / retailPerUnit) * 100) : 0;

    return {
        amount: Math.max(0, savings),
        percentage: savingsPercent
    };
};

export const canOrderBulk = (product: Product): boolean => {
    return product.inventory.availableStock >= product.pricing.bulk.minQuantity &&
        product.status === 'active';
};

export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0
    }).format(price);
};