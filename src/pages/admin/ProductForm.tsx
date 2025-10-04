// src/pages/admin/ProductForm.tsx
import React, { useState, useEffect } from "react";
import { Upload,  X } from "lucide-react";
import { useGetCategoriesQuery } from "@/redux/api/categoryApi";
import { useCreateProductMutation, useUpdateProductMutation } from "@/redux/api/productApi";

interface ProductFormProps {
    product?: any;
    onCancel: () => void;
    onSuccess: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onCancel, onSuccess }) => {
    const { data: catData } = useGetCategoriesQuery();
    const categories = catData?.data?.categories || [];

    const [createProduct, { isLoading: creating }] = useCreateProductMutation();
    const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();

    const [form, setForm] = useState({
        name: "",
        description: "",
        category: "",
        availableStock: "100",
        lowStockThreshold: "10",
        unit: "kg",
        retailPrice: "",
        retailUnit: "kg",
        retailMinQty: "1",
        bulkPrice: "",
        bulkUnit: "kg",
        bulkMinQty: "10",
        status: "active",
        tags: "",
    });

    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [serverError, setServerError] = useState("");

    // Load product data if editing
    useEffect(() => {
        if (product) {
            setForm({
                name: product.name || "",
                description: product.description || "",
                category: product.category?._id || "",
                availableStock: product.inventory?.availableStock?.toString() || "100",
                lowStockThreshold: product.inventory?.lowStockThreshold?.toString() || "10",
                unit: product.inventory?.unit || "kg",
                retailPrice: product.pricing?.retail?.price?.toString() || "",
                retailUnit: product.pricing?.retail?.unit || "kg",
                retailMinQty: product.pricing?.retail?.minQuantity?.toString() || "1",
                bulkPrice: product.pricing?.bulk?.price?.toString() || "",
                bulkUnit: product.pricing?.bulk?.unit || "kg",
                bulkMinQty: product.pricing?.bulk?.minQuantity?.toString() || "10",
                status: product.status || "active",
                tags: product.tags?.join(", ") || "",
            });
            if (product.images) {
                setImagePreviews(product.images);
            }
        }
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
        setServerError("");
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const totalImages = images.length + files.length;
            
            if (totalImages > 5) {
                setErrors(prev => ({ ...prev, images: "Maximum 5 images allowed" }));
                return;
            }

            setImages(prev => [...prev, ...files]);

            // Create previews
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
            
            if (errors.images) {
                setErrors(prev => ({ ...prev, images: "" }));
            }
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!form.name.trim()) newErrors.name = "Product name is required";
        if (!form.description.trim()) newErrors.description = "Description is required";
        if (!form.category) newErrors.category = "Category is required";
        
        const retailPrice = parseFloat(form.retailPrice);
        const bulkPrice = parseFloat(form.bulkPrice);
        
        if (!form.retailPrice || retailPrice <= 0) {
            newErrors.retailPrice = "Valid retail price is required";
        }
        if (!form.bulkPrice || bulkPrice <= 0) {
            newErrors.bulkPrice = "Valid bulk price is required";
        }
        
        // CRITICAL: Backend validates bulk price must be LESS than retail
        if (retailPrice && bulkPrice && bulkPrice >= retailPrice) {
            newErrors.bulkPrice = "Bulk price must be less than retail price";
        }
        
        if (!form.availableStock || parseInt(form.availableStock) < 0) {
            newErrors.availableStock = "Valid stock quantity is required";
        }
        
        if (!product && images.length === 0) {
            newErrors.images = "At least one image is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            if (product) {
                // UPDATE - Use JSON body
                const updatePayload = {
                    name: form.name.trim(),
                    description: form.description.trim(),
                    pricing: {
                        retail: {
                            price: parseFloat(form.retailPrice),
                            currency: "NGN",
                            unit: form.retailUnit,
                            minQuantity: parseInt(form.retailMinQty),
                        },
                        bulk: {
                            price: parseFloat(form.bulkPrice),
                            currency: "NGN",
                            unit: form.bulkUnit,
                            minQuantity: parseInt(form.bulkMinQty),
                        },
                    },
                    inventory: {
                        availableStock: parseInt(form.availableStock),
                        lowStockThreshold: parseInt(form.lowStockThreshold),
                        unit: form.unit,
                    },
                    status: form.status as "active" | "inactive" | "out_of_stock",
                    tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
                };

                // console.log("UPDATE Payload:", updatePayload);

                const result = await updateProduct({
                    id: product._id,
                    body: updatePayload,
                }).unwrap();

                if (result.success) {
                    alert("Product updated successfully!");
                    onSuccess();
                }
            } else {
                // CREATE - Use FormData (matches your backend exactly)
                const formData = new FormData();

                // Append images (multiple files)
                images.forEach((image) => {
                    formData.append("images", image);
                });

                // Basic fields
                formData.append("name", form.name.trim());
                formData.append("description", form.description.trim());
                formData.append("category", form.category);
                formData.append("status", form.status);

                // Pricing object as JSON string (your backend parses it)
                const pricing = {
                    retail: {
                        price: parseFloat(form.retailPrice),
                        currency: "NGN",
                        unit: form.retailUnit,
                        minQuantity: parseInt(form.retailMinQty),
                    },
                    bulk: {
                        price: parseFloat(form.bulkPrice),
                        currency: "NGN",
                        unit: form.bulkUnit,
                        minQuantity: parseInt(form.bulkMinQty),
                    },
                };
                formData.append("pricing", JSON.stringify(pricing));

                // Inventory object as JSON string (your backend parses it)
                const inventory = {
                    availableStock: parseInt(form.availableStock),
                    lowStockThreshold: parseInt(form.lowStockThreshold),
                    unit: form.unit,
                };
                formData.append("inventory", JSON.stringify(inventory));

                // Tags as JSON string (your backend parses it)
                const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
                formData.append("tags", JSON.stringify(tags));

                // Debug logging
                // console.log("=== CREATE PRODUCT REQUEST ===");
                // console.log("Images count:", images.length);
                // console.log("Name:", form.name.trim());
                // console.log("Category:", form.category);
                // console.log("Pricing:", pricing);
                // console.log("Inventory:", inventory);
                // console.log("Tags:", tags);
                // console.log("Status:", form.status);
                // console.log("=== END REQUEST ===");

                const result = await createProduct(formData).unwrap();

                if (result.success) {
                    alert("Product created successfully!");
                    onSuccess();
                }
            }
        } catch (error: any) {
            // console.error("=== ERROR RESPONSE ===");
            // console.error("Full error:", error);
            // console.error("Error data:", error?.data);
            // console.error("Error message:", error?.data?.message);
            // console.error("Validation errors:", error?.data?.errors);
            // console.error("=== END ERROR ===");
            
            const errorMessage = error?.data?.message || "Failed to save product. Please try again.";
            setServerError(errorMessage);
            
            // Handle specific validation errors
            if (error?.data?.errors) {
                const validationErrors: Record<string, string> = {};
                error.data.errors.forEach((err: any) => {
                    if (err.path) {
                        validationErrors[err.path] = err.msg;
                    }
                });
                setErrors(validationErrors);
            }
        }
    };

    const isLoading = creating || updating;

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-semibold mb-2">
                    {product ? "Edit Product" : "Add New Product"}
                </h1>
                <p className="text-sm text-gray-500 mb-6">
                    {product ? "Update product information" : "Add a new product to your store"}
                </p>

                {/* Debug Info - Remove in production */}
                {/* {!product && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="text-blue-600 mt-0.5" size={18} />
                            <div className="text-sm">
                                <p className="font-medium text-blue-900 mb-1">Backend Requirements:</p>
                                <ul className="text-blue-700 space-y-1 text-xs">
                                    <li>✓ Bulk price must be LESS than retail price</li>
                                    <li>✓ At least 1 image required (max 5)</li>
                                    <li>✓ Category ID must be valid</li>
                                    <li>✓ Product name must be unique</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )} */}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* LEFT COLUMN - Name & Description */}
                    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 mb-4">Name & Description</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Product Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        placeholder="e.g., Fresh Tomatoes"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] disabled:bg-gray-100"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Product Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        rows={4}
                                        placeholder="Organic farm-fresh tomatoes locally sourced"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] disabled:bg-gray-100 resize-none"
                                    />
                                    {errors.description && (
                                        <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Product Category *
                                    </label>
                                    <select
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] disabled:bg-gray-100"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((c: any) => (
                                            <option key={c._id} value={c._id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category && (
                                        <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Manage Stock Section */}
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 mb-4">Manage Stock</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Stock Unit
                                    </label>
                                    <input
                                        type="text"
                                        name="unit"
                                        value={form.unit}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        placeholder="kg, pieces, bags, etc."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] disabled:bg-gray-100"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Available Stock *
                                        </label>
                                        <input
                                            type="number"
                                            name="availableStock"
                                            value={form.availableStock}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                            placeholder="100"
                                            min="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] disabled:bg-gray-100"
                                        />
                                        {errors.availableStock && (
                                            <p className="text-red-500 text-xs mt-1">{errors.availableStock}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Low Stock Alert
                                        </label>
                                        <input
                                            type="number"
                                            name="lowStockThreshold"
                                            value={form.lowStockThreshold}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                            placeholder="10"
                                            min="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] disabled:bg-gray-100"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Pricing & Image */}
                    <div className="space-y-6">
                        {/* Pricing Section */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4">Pricing</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        RETAIL PRICING
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Price (₦) *</label>
                                            <input
                                                type="number"
                                                name="retailPrice"
                                                value={form.retailPrice}
                                                onChange={handleChange}
                                                disabled={isLoading}
                                                placeholder="5000"
                                                min="1"
                                                step="0.01"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]"
                                            />
                                            {errors.retailPrice && (
                                                <p className="text-red-500 text-xs mt-1">{errors.retailPrice}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Unit</label>
                                            <input
                                                type="text"
                                                name="retailUnit"
                                                value={form.retailUnit}
                                                onChange={handleChange}
                                                disabled={isLoading}
                                                placeholder="per kg"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        BULK PRICING
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Price (₦) *</label>
                                            <input
                                                type="number"
                                                name="bulkPrice"
                                                value={form.bulkPrice}
                                                onChange={handleChange}
                                                disabled={isLoading}
                                                placeholder="4500"
                                                min="1"
                                                step="0.01"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]"
                                            />
                                            {errors.bulkPrice && (
                                                <p className="text-red-500 text-xs mt-1">{errors.bulkPrice}</p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">Must be less than retail</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Min Qty</label>
                                            <input
                                                type="number"
                                                name="bulkMinQty"
                                                value={form.bulkMinQty}
                                                onChange={handleChange}
                                                disabled={isLoading}
                                                placeholder="10"
                                                min="1"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tags (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={form.tags}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        placeholder="organic, fresh, local"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Category Image Section */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4">Product Images *</h3>
                            
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                <div className="text-center">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                    <label className="cursor-pointer">
                                        <span className="text-sm text-[#1D7B3C] font-medium">Drop images here</span>
                                        <span className="text-sm text-gray-500"> or click to browse</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageChange}
                                            disabled={isLoading}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-xs text-gray-500 mt-2">JPG, PNG (Max 5 images, 2MB each)</p>
                                </div>
                            </div>
                            {errors.images && <p className="text-red-500 text-xs mt-2">{errors.images}</p>}

                            {/* Image Previews */}
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-3 gap-3 mt-4">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-md border"
                                            />
                                            {!product && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </form>

                {/* Server Error */}
                {serverError && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm font-medium">{serverError}</p>
                        <p className="text-red-500 text-xs mt-1">Check the browser console for detailed error information</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-[#1D7B3C] text-white py-2 px-4 rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Saving..." : product ? "Update Product" : "Add Product"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductForm;