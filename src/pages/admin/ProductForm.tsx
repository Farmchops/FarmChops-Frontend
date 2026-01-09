// src/pages/admin/ProductForm.tsx
import React, { useState, useEffect } from "react";
import { Upload, X } from "lucide-react";
import { useGetCategoriesQuery } from "@/redux/api/categoryApi";
import { useCreateProductMutation, useUpdateProductMutation } from "@/redux/api/productApi";
import type { BulkTier, ProductStatus } from "@/types/product";
import { alertService } from "@/lib/alertService";

interface ProductFormProps {
    product?: any;
    onCancel: () => void;
    onSuccess: () => void;
}

interface BulkTierForm {
    id: string; // for React key
    name: string;
    price: string;
    unit: string;
}

type FormState = {
    name: string;
    description: string;
    category: string;
    availableStock: string;
    lowStockThreshold: string;
    unit: string;
    retailPrice: string;
    retailUnit: string;
    retailMinQty: string;
    bulkPrice: string;
    bulkUnit: string;
    bulkMinQty: string;
    status: string;
    tags: string;
};

type UnitField = "unit" | "retailUnit";

const UNIT_OPTIONS = [
    { value: "kg", label: "Kilogram (kg)" },
    { value: "g", label: "Gram (g)" },
    { value: "ton", label: "Ton" },
    { value: "bag", label: "Bag" },
    { value: "box", label: "Box" },
    { value: "crate", label: "Crate" },
    { value: "bundle", label: "Bundle" },
    { value: "bunch", label: "Bunch" },
    { value: "pack", label: "Pack" },
    { value: "piece", label: "Piece" },
    { value: "dozen", label: "Dozen" },
    { value: "litre", label: "Litre (L)" },
    { value: "ml", label: "Millilitre (ml)" },
];

const ProductForm: React.FC<ProductFormProps> = ({ product, onCancel, onSuccess }) => {
    const { data: catData } = useGetCategoriesQuery();
    const categories = catData?.data?.categories || [];

    const [createProduct, { isLoading: creating }] = useCreateProductMutation();
    const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();

    const [bulkTiers, setBulkTiers] = useState<BulkTierForm[]>([
        { id: '', name: '', price: '', unit: '' }
    ]);

    const [form, setForm] = useState<FormState>({
        name: "",
        description: "",
        category: "",
        availableStock: "100",
        lowStockThreshold: "10",
        unit: "",
        retailPrice: "",
        retailUnit: "",
        retailMinQty: "1",
        bulkPrice: "",
        bulkUnit: "",
        bulkMinQty: "",
        status: "active",
        tags: "",
    });


    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [serverError, setServerError] = useState("");

    const getUnitSelectValue = (value: string) => {
        if (!value) return "";
        return UNIT_OPTIONS.some(option => option.value === value) ? value : "custom";
    };

    const shouldShowCustomUnitInput = (value: string) => {
        // Show custom input if value is not empty and not in predefined options
        return value && !UNIT_OPTIONS.some(option => option.value === value);
    };

    const handleUnitSelectChange = (field: UnitField) => (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        if (selectedValue === "custom") {
            // Set to a space to trigger custom input (not in UNIT_OPTIONS and not empty)
            setForm(prev => ({ ...prev, [field]: " " }));
            return;
        }
        setForm(prev => ({ ...prev, [field]: selectedValue }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    useEffect(() => {
        if (product?.pricing?.bulkTiers && product.pricing.bulkTiers.length > 0) {
            setBulkTiers(
                product.pricing.bulkTiers.map((tier: BulkTier, idx: number) => ({
                    id: String(idx + 1),
                    name: tier.name,
                    price: tier.price.toString(),
                    unit: tier.unit,
                }))
            );
        }
    }, [product]);

    // Load product data if editing
    useEffect(() => {
        if (product) {
            setForm({
                name: product.name || "",
                description: product.description || "",
                category: product.category?._id || "",
                availableStock: product.inventory?.availableStock?.toString() || "",
                lowStockThreshold: product.inventory?.lowStockThreshold?.toString() || "",
                unit: product.inventory?.unit || "",
                retailPrice: product.pricing?.retail?.price?.toString() || "",
                retailUnit: product.pricing?.retail?.unit || "",
                retailMinQty: product.pricing?.retail?.minQuantity?.toString() || "1",
                bulkPrice: product.pricing?.bulk?.price?.toString() || "",
                bulkUnit: product.pricing?.bulk?.unit || "",
                bulkMinQty: product.pricing?.bulk?.minQuantity?.toString() || "",
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

    const addBulkTier = () => {
        setBulkTiers(prev => [
            ...prev,
            {
                id: String(Date.now()),
                name: `Tier ${prev.length + 1}`,
                price: '',
                unit: 'kg'
            }
        ]);
    };

    const removeBulkTier = (id: string) => {
        if (bulkTiers.length > 1) {
            setBulkTiers(prev => prev.filter(tier => tier.id !== id));
        }
    };

    const updateBulkTier = (id: string, field: keyof BulkTierForm, value: string) => {
        setBulkTiers(prev =>
            prev.map(tier =>
                tier.id === id ? { ...tier, [field]: value } : tier
            )
        );
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!form.name.trim()) newErrors.name = "Product name is required";
        if (!form.description.trim()) newErrors.description = "Description is required";
        if (!form.category) newErrors.category = "Category is required";

        const retailPrice = parseFloat(form.retailPrice);

        if (!form.retailPrice || retailPrice <= 0) {
            newErrors.retailPrice = "Valid retail price is required";
        }

        // Only validate bulk tiers if ANY field in that tier has a value
        bulkTiers.forEach((tier, index) => {
            const hasAnyValue = tier.name.trim() || tier.price || tier.unit.trim();

            // Only validate if user started filling this tier
            if (hasAnyValue) {
                if (!tier.name.trim()) {
                    newErrors[`bulkTier_${tier.id}_name`] = `Tier ${index + 1} name is required`;
                }

                const tierPrice = parseFloat(tier.price);
                if (!tier.price || tierPrice <= 0) {
                    newErrors[`bulkTier_${tier.id}_price`] = `Tier ${index + 1} price must be greater than 0`;
                }
            }
        });

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
            // Filter out empty bulk tiers - must have price AND unit
            const validBulkTiers = bulkTiers.filter(tier => {
                const hasPrice = tier.price && parseFloat(tier.price) > 0;
                const hasUnit = tier.unit && tier.unit.trim().length > 0;
                return hasPrice && hasUnit;
            });

            const bulkTiersData = validBulkTiers.map(tier => ({
                name: tier.name.trim(),
                price: parseFloat(tier.price),
                unit: tier.unit.trim(),
            }));

            if (product) {
                // UPDATE
                const updatePayload = {
                    name: form.name.trim(),
                    description: form.description.trim(),
                    //Something fishy in category
                    category: form.category.trim(),
                    pricing: {
                        retail: {
                            price: parseFloat(form.retailPrice),
                            currency: "NGN",
                            unit: form.retailUnit,
                            minQuantity: parseInt(form.retailMinQty),
                        },
                        bulk: {
                            price: bulkTiersData.length > 0 ? bulkTiersData[0].price : 0,
                            currency: "NGN",
                            unit: bulkTiersData.length > 0 ? bulkTiersData[0].unit : "",
                            minQuantity: 1, // Backend default
                        },
                        bulkTiers: bulkTiersData.length > 0 ? bulkTiersData : undefined,
                    },
                    inventory: {
                        availableStock: parseInt(form.availableStock),
                        lowStockThreshold: parseInt(form.lowStockThreshold),
                        unit: form.unit,
                    },
                    status: form.status as ProductStatus,
                    tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
                };

                const result = await updateProduct({
                    id: product._id,
                    body: updatePayload,
                }).unwrap();

                if (result.success) {
                    // alert("Product updated successfully!");
                    alertService.show({
                        type: "success",
                        title: "Product Updated",
                        message: "Product saved successfully!"
                    });
                    onSuccess();
                }
            }
            else {
                // CREATE
                const formData = new FormData();

                images.forEach((image) => {
                    formData.append("images", image);
                });

                formData.append("name", form.name.trim());
                formData.append("description", form.description.trim());
                formData.append("category", form.category);
                formData.append("status", form.status);

                const pricing = {
                    retail: {
                        price: parseFloat(form.retailPrice),
                        currency: "NGN",
                        unit: form.retailUnit.trim() || "piece", // Default to "piece" if empty
                        minQuantity: parseInt(form.retailMinQty),
                    },
                    bulkTiers: bulkTiersData.length > 0 ? bulkTiersData : undefined,
                };

                console.log("📦 Product payload:", {
                    pricing,
                    inventory: {
                        availableStock: parseInt(form.availableStock),
                        lowStockThreshold: parseInt(form.lowStockThreshold),
                        unit: form.unit.trim() || "piece",
                    },
                    bulkTiersData
                });

                formData.append("pricing", JSON.stringify(pricing));

                const inventory = {
                    availableStock: parseInt(form.availableStock),
                    lowStockThreshold: parseInt(form.lowStockThreshold),
                    unit: form.unit.trim() || "piece", // Default to "piece" if empty
                };
                formData.append("inventory", JSON.stringify(inventory));

                const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
                formData.append("tags", JSON.stringify(tags));

                const result = await createProduct(formData).unwrap();

                if (result.success) {
                    // alert("Product created successfully!");
                    alertService.show({
                        type: "success",
                        title: "Product Created",
                        message: "Product saved successfully!"
                    });
                    onSuccess();
                }
            }
        } catch (error: any) {

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
                                    <div className="space-y-3">
                                        <select
                                            value={getUnitSelectValue(form.unit)}
                                            onChange={handleUnitSelectChange("unit")}
                                            disabled={isLoading}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] disabled:bg-gray-100"
                                        >
                                            <option value="">Select Stock Unit</option>
                                            {UNIT_OPTIONS.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                            <option value="custom">Custom...</option>
                                        </select>

                                        {shouldShowCustomUnitInput(form.unit) && (
                                            <input
                                                type="text"
                                                name="unit"
                                                value={form.unit}
                                                onChange={handleChange}
                                                disabled={isLoading}
                                                placeholder="Enter custom stock unit"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] disabled:bg-gray-100"
                                            />
                                        )}
                                    </div>
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
                                            <div className="space-y-3">
                                                <select
                                                    value={getUnitSelectValue(form.retailUnit)}
                                                    onChange={handleUnitSelectChange("retailUnit")}
                                                    disabled={isLoading}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]"
                                                >
                                                    <option value="">Select Unit</option>
                                                    {UNIT_OPTIONS.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                    <option value="custom">Custom...</option>
                                                </select>
                                                {shouldShowCustomUnitInput(form.retailUnit) && (
                                                    <input
                                                        type="text"
                                                        name="retailUnit"
                                                        value={form.retailUnit}
                                                        onChange={handleChange}
                                                        disabled={isLoading}
                                                        placeholder="Enter custom unit"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                {/* BULK PRICING SECTION - UPDATED */}
                                <div className="border p-2 border-gray-300 rounded-lg">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-base font-semibold text-gray-900">Bulk Pricing (Optional)</h3>
                                        <button
                                            type="button"
                                            onClick={addBulkTier}
                                            className="text-sm text-[#1D7B3C] hover:text-green-800 font-medium"
                                        >
                                            + Add Tier
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {bulkTiers.map((tier, index) => (
                                            <div key={tier.id} className="">
                                                <div className="flex items-center justify-between mb-3">
                                                    <label className="text-sm font-medium text-gray-700">
                                                        Tier {index + 1}
                                                    </label>
                                                    {bulkTiers.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeBulkTier(tier.id)}
                                                            className="text-sm text-red-600 hover:text-red-800"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="col-span-2">
                                                        <label className="block text-xs text-gray-600 mb-1">Tier Name</label>
                                                        <input
                                                            type="text"
                                                            value={tier.name}
                                                            onChange={(e) => updateBulkTier(tier.id, 'name', e.target.value)}
                                                            placeholder="e.g., Wholesale, Large Order"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]"
                                                        />
                                                        {errors[`bulkTier_${tier.id}_name`] && (
                                                            <p className="text-red-500 text-xs mt-1">{errors[`bulkTier_${tier.id}_name`]}</p>
                                                        )}
                                                    </div>

                                                    <div className="col-span-2">
                                                        <label className="block text-xs text-gray-600 mb-1">Price (₦)</label>
                                                        <input
                                                            type="number"
                                                            value={tier.price}
                                                            onChange={(e) => updateBulkTier(tier.id, 'price', e.target.value)}
                                                            placeholder="4500"
                                                            min="1"
                                                            step="0.01"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]"
                                                        />
                                                        {errors[`bulkTier_${tier.id}_price`] && (
                                                            <p className="text-red-500 text-xs mt-1">{errors[`bulkTier_${tier.id}_price`]}</p>
                                                        )}
                                                    </div>

                                                    <div className="col-span-2">
                                                        <label className="block text-xs text-gray-600 mb-1">Unit</label>
                                                        <input
                                                            type="text"
                                                            value={tier.unit}
                                                            onChange={(e) => updateBulkTier(tier.id, 'unit', e.target.value)}
                                                            placeholder="per kg"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {bulkTiers.length === 0 && (
                                        <p className="text-sm text-gray-500 text-center py-4">
                                            No bulk pricing tiers. Add one to enable bulk purchases.
                                        </p>
                                    )}
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