import React, { useMemo, useState } from "react";
import { useAddToCartMutation } from "@/redux/api/cartApi";
import { useGetProductsQuery } from "@/redux/api/productApi";
import { CartSidebar } from "@/components/Cart/CartSidebar";

// Minimal types to satisfy linting and help with clarity
interface BulkTier {
  _id: string;
  name: string;
  price: number;
  minQuantity?: number;
  unit?: string;
}

interface BulkProduct {
  _id: string;
  name: string;
  images: string[];
  pricing?: { bulkTiers?: BulkTier[] };
}

const BulkBuyingPage: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const { data, isLoading, error } = useGetProductsQuery({});
  const [addToCart, { error: addError }] = useAddToCartMutation();
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  // selectedProductId not used; removed
  const [selectedTier, setSelectedTier] = useState<{ [productId: string]: string }>({});
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  // Filter products with bulk tiers
  const bulkProducts = useMemo(() => {
    if (!data?.data?.products) return [] as BulkProduct[];
    return (data.data.products as BulkProduct[]).filter(
      (product) => Array.isArray(product.pricing?.bulkTiers) && (product.pricing!.bulkTiers!.length > 0)
    );
  }, [data]);

  const handleTierSelect = (productId: string, tierId: string) => {
    setSelectedTier((prev) => ({ ...prev, [productId]: tierId }));
    setQuantities((prev) => ({ ...prev, [`${productId}-${tierId}`]: 1 }));
  };

  const handleQuantityChange = (productId: string, tierId: string, value: number) => {
    if (value < 1) return;
    setQuantities((prev) => ({ ...prev, [`${productId}-${tierId}`]: value }));
  };

  const handleIncrement = (productId: string, tierId: string) => {
    const key = `${productId}-${tierId}`;
    setQuantities((prev) => ({ ...prev, [key]: (prev[key] || 1) + 1 }));
  };

  const handleDecrement = (productId: string, tierId: string) => {
    const key = `${productId}-${tierId}`;
    setQuantities((prev) => {
      const current = prev[key] || 1;
      if (current <= 1) return prev;
      return { ...prev, [key]: current - 1 };
    });
  };

  const handleAddBulkToCart = async (product: BulkProduct, tier: BulkTier, quantity: number) => {
    try {
      const result = await addToCart({
        productId: product._id,
        name: product.name,
        image: product.images[0],
        price: tier.price,
        quantity,
  unit: tier.unit ?? "",
        priceType: "bulk",
        minQuantity: tier.minQuantity,
        tierName: tier.name,
        multiplier: quantity,
      }).unwrap();
      console.log('Add to cart result:', result);
      // If the mutation succeeded (no thrown error), open sidebar and show toast
      setShowCartSidebar(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error('Add to cart error:', err);
      alert("Unable to add bulk item to cart.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showToast && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
          Product added to cart successfully
        </div>
      )}
      {addError && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 text-red-700 px-4 py-2 rounded shadow">Error adding to cart</div>
      )}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Bulk Buying</h1>
        <p className="text-gray-600 mb-8">Save more when you buy in bulk! Select your preferred bulk tier and quantity below.</p>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-20">Failed to load products.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bulkProducts.map((product: BulkProduct) => (
              <div key={product._id} className="max-w-80 bg-white rounded-xl shadow-lg hover:-translate-y-2 hover:shadow-xl transition-transform duration-300 overflow-hidden relative p-4 flex flex-col h-full">
                <img src={product.images[0]} alt={product.name} className="w-full h-44 object-cover rounded-lg mb-4" />
                <div className="flex-grow">
                  <h2 className="text-lg font-bold text-[#1A1A1A] mb-4 line-clamp-2">{product.name}</h2>
                  <div className="flex flex-col gap-4">
                    {(product.pricing!.bulkTiers || []).map((tier: BulkTier) => {
                      const selected = selectedTier[product._id] === tier._id;
                      return (
                        <>
                          <label key={tier._id} className={`flex flex-col md:flex-row md:items-center justify-between gap-2 px-4 py-4 rounded-lg cursor-pointer border ${selected ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white'} transition`}>
                            <div className="flex items-center gap-3 mb-2 md:mb-0">
                              <input
                                type="radio"
                                name={`tier-${product._id}`}
                                checked={selected}
                                onChange={() => handleTierSelect(product._id, tier._id)}
                                className="accent-green-600 scale-110"
                              />
                              <span className="font-semibold text-gray-900 text-base">{tier.name}</span>
                              <span className="text-sm text-gray-500">({tier.minQuantity} {tier.unit})</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-green-700 font-bold text-lg">₦{tier.price}</span>
                            </div>
                          </label>
                          {selected && (
                            <div className="w-full mt-3 mb-6">
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-sm text-gray-700">Quantity:</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    aria-label="Decrease quantity"
                                    onClick={() => handleDecrement(product._id, tier._id)}
                                    className="h-8 w-8 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                    disabled={(quantities[`${product._id}-${tier._id}`] || 1) <= 1}
                                  >
                                    −
                                  </button>
                                  <input
                                    type="number"
                                    min={1}
                                    value={quantities[`${product._id}-${tier._id}`] || 1}
                                    onChange={e => handleQuantityChange(product._id, tier._id, Number(e.target.value))}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-green-500"
                                    aria-label={`Quantity for ${product.name} ${tier.name}`}
                                  />
                                  <button
                                    type="button"
                                    aria-label="Increase quantity"
                                    onClick={() => handleIncrement(product._id, tier._id)}
                                    className="h-8 w-8 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })}
                  </div>
                </div>
                {/* Only show quantity input inside selected tier block above. */}
                <button
                  className="w-full bg-[#1D7B3C] text-white py-2 rounded-lg font-medium hover:bg-green-800 transition-colors mt-auto"
                  disabled={!selectedTier[product._id]}
                  onClick={() => {
                    const tier = (product.pricing!.bulkTiers || []).find((t: BulkTier) => t._id === selectedTier[product._id]);
                    const qty = quantities[`${product._id}-${selectedTier[product._id]}`] || 1;
                    if (tier) handleAddBulkToCart(product, tier, qty);
                  }}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
  <CartSidebar isOpen={showCartSidebar} onClose={() => setShowCartSidebar(false)} showQuantityControls={false} />
    </div>
  );
};

export default BulkBuyingPage;
