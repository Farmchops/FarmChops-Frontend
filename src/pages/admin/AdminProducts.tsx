// src/pages/admin/AdminProducts.tsx
import { useState, useMemo } from "react";
// import { useGetProductsQuery, useDeleteProductMutation } from "../../store/api/productApi";
import { Trash2, Pencil, Search, Package, Users, X, AlertTriangle } from "lucide-react";
import ProductForm from "./ProductForm";
import { useDeleteProductMutation, useGetAdminProductsQuery, useConfigureGroupBuyingMutation, useUpdateProductMutation } from "@/redux/api/productApi";
//import type { Product } from "../../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { alertService } from "@/lib/alertService";
import { resolveErrorMessage } from "@/lib/utils";
import type { GroupConfig, Product } from "@/types/product";


const AdminProducts = () => {
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<"list" | "form">("list");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "in_stock" | "out_of_stock">("all");
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock">("name");

  // Group Buying Modal State
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [groupConfig, setGroupConfig] = useState<GroupConfig>({
    enabled: false,
    minParticipants: 5,
    maxParticipants: 10,
    quantityPerPerson: {
      min: 5,
      max: 15,
    },
    targetQuantity: 100,
    bulkPricePerUnit: 0,
    deadlineHours: 48,
    maxActiveGroups: 5,
    checkoutWindowHours: 48,
  });

  const { data, isLoading, refetch, error: productsError } = useGetAdminProductsQuery({ page, limit: 15 }); // 15 products per page
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [configureGroupBuying, { isLoading: isConfiguringGroup }] = useConfigureGroupBuyingMutation();
  const [updateProduct] = useUpdateProductMutation();

  // Log errors for debugging
  if (productsError) console.error('Products API Error:', productsError);

  const allProducts = useMemo(() => data?.data?.products || [], [data?.data?.products]);

  // Client-side filtering and sorting
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.category?.name.toLowerCase().includes(search) ||
          p.tags.some((tag) => tag.toLowerCase().includes(search))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => {
        const mappedStatus =
          p.status === "active" ? "in_stock" :
            p.status === "inactive" ? "out_of_stock" :
              p.status; // keep as-is if already in_stock/out_of_stock
        return mappedStatus === statusFilter;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return (a.pricing?.retail?.price || 0) - (b.pricing?.retail?.price || 0);
        case "stock":
          return (b.inventory?.availableStock || 0) - (a.inventory?.availableStock || 0);
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [allProducts, searchTerm, statusFilter, sortBy]);

  // const handleDelete = async (id: string, name: string) => {
  //   if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
  //     return;
  //   }
  //   try {
  //     const result = await deleteProduct(id).unwrap();
  //     if (result.success) {
  //       alertService.show({
  //         type: "success",
  //         title: "Product Deletion",
  //         message: "Product deleted successfully!"
  //       });
  //       // alert("Product deleted successfully!");
  //       refetch();
  //     }
  //   } catch (error: any) {
  //     alertService.show({
  //       type: "error",
  //       title: "Product Deletion",
  //       message: "Failed to delete product"
  //     });
  //     console.log(error)
  //     // alert(error?.data?.message || "Failed to delete product");
  //   }
  // };
  const handleDelete = async (id: string, name: string) => {
    alertService.show({
      type: "confirm",
      title: "Confirm Deletion",
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const result = await deleteProduct(id).unwrap();
          if (result.success) {
            alertService.show({
              type: "success",
              title: "Product Deleted",
              message: "Product deleted successfully!",
            });
            refetch();
          }
        } catch (error: unknown) {
          alertService.show({
            type: "error",
            title: "Product Deletion Failed",
            message: resolveErrorMessage(error) || "Failed to delete product",
          });
        }
      },
    });
  };

  const handleOpenGroupModal = (product: Product) => {
    setSelectedProduct(product);
    setGroupConfig({
      // support legacy boolean `groupBuyingEnabled` if `groupConfig` is not present
      enabled: product.groupConfig?.enabled ?? ((product as unknown as { groupBuyingEnabled?: boolean }).groupBuyingEnabled ?? false),
      minParticipants: product.groupConfig?.minParticipants || 5,
      maxParticipants: product.groupConfig?.maxParticipants || 10,
      quantityPerPerson: product.groupConfig?.quantityPerPerson || { min: 5, max: 15 },
      targetQuantity: product.groupConfig?.targetQuantity || 100,
      bulkPricePerUnit: product.groupConfig?.bulkPricePerUnit || (product.pricing?.retail?.price ? product.pricing.retail.price * 100 : 0),
      deadlineHours: product.groupConfig?.deadlineHours || 48,
      maxActiveGroups: product.groupConfig?.maxActiveGroups || 5,
      checkoutWindowHours: product.groupConfig?.checkoutWindowHours || 48,
    });
    setShowGroupModal(true);
  };

  const handleSaveGroupConfig = async () => {
    if (!selectedProduct) return;

    try {
      const result = await configureGroupBuying({
        productId: selectedProduct._id,
        config: groupConfig,
      }).unwrap();

      if (result.success) {
        alertService.show({
          type: "success",
          title: "Group Buying Configured",
          message: groupConfig.enabled
            ? `Group buying enabled for ${selectedProduct.name}`
            : `Group buying disabled for ${selectedProduct.name}`,
        });
        setShowGroupModal(false);
        setSelectedProduct(null);
        // Refetch to update the UI with new groupConfig data
        await refetch();
      }
    } catch (error: unknown) {
      alertService.show({
        type: "error",
        title: "Configuration Failed",
        message: resolveErrorMessage(error) || "Failed to configure group buying",
      });
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === 'out_of_stock' ? 'active' : 'out_of_stock';
    const actionText = newStatus === 'out_of_stock' ? 'mark as out of stock' : 'mark as in stock';

    alertService.show({
      type: "confirm",
      title: `${newStatus === 'out_of_stock' ? 'Mark Out of Stock' : 'Mark In Stock'}`,
      message: `Are you sure you want to ${actionText} "${product.name}"?`,
      onConfirm: async () => {
        try {
          const result = await updateProduct({
            id: product._id,
            body: { status: newStatus },
          }).unwrap();

          if (result.success) {
            alertService.show({
              type: "success",
              title: "Status Updated",
              message: `${product.name} is now ${newStatus === 'out_of_stock' ? 'out of stock' : 'in stock'}`,
            });
            // Ensure the product remains visible in the admin list even if the current
            // status filter would hide it (e.g., user had 'In Stock' selected and just
            // marked the item 'Out of Stock'). Reset filter to 'all' so the updated
            // product remains visible immediately after the change.
            await refetch();
            setStatusFilter("all");
          }
        } catch (error: unknown) {
          alertService.show({
            type: "error",
            title: "Update Failed",
            message: resolveErrorMessage(error) || "Failed to update product status",
          });
        }
      },
    });
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1D7B3C] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  // Show error state if API failed
  if (productsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load products</h3>
          <p className="text-gray-600 mb-4">Please check your connection and try again.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="bg-[#1D7B3C] text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show Form
  if (mode === "form") {
    return (
      <ProductForm
        product={editProduct}
        onCancel={() => {
          setEditProduct(null);
          setMode("list");
        }}
        onSuccess={() => {
          setEditProduct(null);
          setMode("list");
          refetch();
        }}
      />
    );
  }

  // Show List
  return (
    <div className="py-6 mt-4 space-y-6 w-full min-w-0">
      {/* Header + Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">Products</h1>
          <p className="text-sm text-gray-700 mt-1">
            Showing {filteredProducts.length} of {allProducts.length} products
          </p>
        </div>
        <button
          onClick={() => {
            setEditProduct(null);
            setMode("form");
          }}
          className="bg-[#1D7B3C] text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
        >
          + Add Product
        </button>
      </div>

      {/* Search + Filters */}
      <div>
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
          {/* Search */}
          <div className="relative w-full sm:w-auto sm:min-w-[200px]">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] focus:border-transparent placeholder:text-sm"
            />
          </div>

          {/* <div className="flex items-center gap-2"> */}

          {/* Status Filter */}
          {/* <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div> */}

          {/* Sort */}
          {/* <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] focus:border-transparent appearance-none bg-white"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="stock">Sort by Stock</option>
            </select>
          </div>  */}


          <div className="flex flex-row gap-2 w-full sm:w-auto">
            {/* Status Filter */}
            <div className="flex-1 sm:flex-initial">
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as "all" | "in_stock" | "out_of_stock")}
              >
                <SelectTrigger className="w-full sm:w-[130px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  {/* <SelectItem value="inactive">Inactive Only</SelectItem> */}
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="flex-1 sm:flex-initial">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as "name" | "price" | "stock")}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="price">Sort by Price</SelectItem>
                  <SelectItem value="stock">Sort by Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>


        {/* Active Filters Display */}
        {/* {(searchTerm || statusFilter !== "all") && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#1D7B3C] bg-opacity-10 text-[#1D7B3C] rounded-full text-sm">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm("")} className="hover:text-green-800">
                  ×
                </button>
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#1D7B3C] bg-opacity-10 text-[#1D7B3C] rounded-full text-sm">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter("all")} className="hover:text-green-800">
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          </div>
        )} */}
      </div>

      {/* Table View */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-[#687182] text-sm">
              <th className="p-3 text-left font-medium">#</th>
              <th className="p-3 text-left font-medium">Product Name</th>
              <th className="p-3 text-left font-medium">Price (Retail)</th>
              <th className="p-3 text-left font-medium">Stock</th>
              <th className="p-3 text-left font-medium">Category</th>
              <th className="p-3 text-left font-medium">Status</th>
              <th className="p-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Package size={48} className="text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No products found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm || statusFilter !== "all"
                        ? "Try adjusting your search or filters"
                        : "Get started by adding your first product"}
                    </p>
                    {!searchTerm && statusFilter === "all" && (
                      <button
                        type="button"
                        onClick={() => setMode("form")}
                        className="bg-[#1D7B3C] text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Add Product
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((p, idx) => (
                <tr key={p._id} className={`border-b hover:bg-gray-50 ${p.isLowStock ? "bg-orange-50" : ""}`}>
                  <td className="p-3">{(page - 1) * 15 + idx + 1}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.png";
                            }}
                          />
                        ) : (
                          <span className="flex items-center justify-center w-full h-full text-sm text-gray-500">
                            {p.name?.[0] ?? "?"}
                          </span>
                        )}
                        {p.isLowStock && (
                          <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full p-0.5">
                            <AlertTriangle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    ₦{p.pricing?.retail?.price?.toLocaleString() || "N/A"}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`whitespace-nowrap ${(p.inventory?.availableStock || 0) <= (p.inventory?.lowStockThreshold || 0)
                          ? "text-red-600 font-semibold"
                          : ""
                          }`}
                      >
                        {p.inventory?.availableStock ?? "N/A"} {p.inventory?.unit || ""}
                      </span>
                      {p.isLowStock && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs font-medium whitespace-nowrap">
                          <AlertTriangle className="w-3 h-3" />
                          Low
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">{p.category?.name || "N/A"}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(p)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all cursor-pointer hover:ring-2 whitespace-nowrap ${p.status === "active"
                        ? "bg-green-100 text-green-800 hover:bg-green-200 hover:ring-green-300"
                        : p.status === "out_of_stock" || p.status === "inactive"
                          ? "bg-red-100 text-red-800 hover:bg-red-200 hover:ring-red-300"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:ring-gray-300"
                        }`}
                      title="Click to toggle status"
                    >
                      {p.status === "active"
                        ? "In Stock"
                        : p.status === "out_of_stock" || p.status === "inactive"
                          ? "Out of Stock"
                          : "Unknown"}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenGroupModal(p)}
                        className={`p-2 rounded transition-colors ${p.groupConfig?.enabled || ((p as unknown as { groupBuyingEnabled?: boolean }).groupBuyingEnabled)
                          ? "text-[#1D7B3C] bg-green-50"
                          : "hover:text-[#1D7B3C] hover:bg-green-50"
                          }`}
                        title={p.groupConfig?.enabled || ((p as unknown as { groupBuyingEnabled?: boolean }).groupBuyingEnabled) ? "Group buying enabled" : "Configure group buying"}
                      >
                        <Users className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditProduct(p);
                          setMode("form");
                        }}
                        className="p-2 hover:text-[#1D7B3C] hover:bg-green-50 rounded transition-colors"
                        title="Edit product"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p._id, p.name)}
                        disabled={isDeleting}
                        className="p-2 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Info */}
      {filteredProducts.length > 0 && (
        <div className="flex items-center justify-between text-[#1D7B3C]">
          <div className="flex gap-2 ">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-4 py-2 border  rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={!data?.data?.pagination?.hasPrevPage}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 border  rounded-lg  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={!data?.data?.pagination?.hasNextPage}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Group Buying Configuration Modal */}
      {showGroupModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Group Buying Configuration</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedProduct.name}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowGroupModal(false);
                  setSelectedProduct(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-900">Enable Group Buying</label>
                  <p className="text-xs text-gray-600 mt-1">Allow customers to join group orders for this product</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={groupConfig.enabled}
                    onChange={(e) => setGroupConfig({ ...groupConfig, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1D7B3C]"></div>
                </label>
              </div>

              {/* Configuration Fields (only show if enabled) */}
              {groupConfig.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Min Participants *
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="100"
                        value={groupConfig.minParticipants}
                        onInput={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.value = target.value.replace(/^0+/, '') || '0';
                        }}
                        onChange={(e) => setGroupConfig({ ...groupConfig, minParticipants: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]"
                        placeholder="5"
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum members to start checkout</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Participants *
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="100"
                        value={groupConfig.maxParticipants}
                        onInput={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.value = target.value.replace(/^0+/, '') || '0';
                        }}
                        onChange={(e) => setGroupConfig({ ...groupConfig, maxParticipants: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]"
                        placeholder="10"
                      />
                      <p className="text-xs text-gray-500 mt-1">Maximum members allowed</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity per Person (Fixed) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={groupConfig.quantityPerPerson.min}
                      onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        target.value = target.value.replace(/^0+/, '') || '0';
                      }}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        setGroupConfig({
                          ...groupConfig,
                          quantityPerPerson: { min: value, max: value }
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]"
                      placeholder="5"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      All participants will receive exactly this amount ({selectedProduct?.inventory?.unit || 'units'})
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Quantity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={groupConfig.targetQuantity}
                      onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        target.value = target.value.replace(/^0+/, '') || '0';
                      }}
                      onChange={(e) => setGroupConfig({ ...groupConfig, targetQuantity: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]"
                      placeholder="100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Total quantity target for group (e.g., 100{selectedProduct?.inventory?.unit || 'kg'})
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bulk Price per Unit (in ₦) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={groupConfig.bulkPricePerUnit / 100}
                      onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        // For decimal numbers, only strip leading zeros before the decimal point
                        if (target.value.includes('.')) {
                          const parts = target.value.split('.');
                          parts[0] = parts[0].replace(/^0+/, '') || '0';
                          target.value = parts.join('.');
                        } else {
                          target.value = target.value.replace(/^0+/, '') || '0';
                        }
                      }}
                      onChange={(e) => setGroupConfig({ ...groupConfig, bulkPricePerUnit: Math.round((parseFloat(e.target.value) || 0) * 100) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]"
                      placeholder="450"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Price per {selectedProduct?.inventory?.unit || 'unit'} (₦{(groupConfig.bulkPricePerUnit / 100).toLocaleString()})
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deadline Hours *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={groupConfig.deadlineHours}
                        onInput={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.value = target.value.replace(/^0+/, '') || '0';
                        }}
                        onChange={(e) => setGroupConfig({ ...groupConfig, deadlineHours: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]"
                        placeholder="48"
                      />
                      <p className="text-xs text-gray-500 mt-1">Hours before group expires</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Checkout Window Hours *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={groupConfig.checkoutWindowHours}
                        onInput={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.value = target.value.replace(/^0+/, '') || '0';
                        }}
                        onChange={(e) => setGroupConfig({ ...groupConfig, checkoutWindowHours: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]"
                        placeholder="48"
                      />
                      <p className="text-xs text-gray-500 mt-1">Hours to complete checkout</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Active Groups *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={groupConfig.maxActiveGroups}
                      onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        target.value = target.value.replace(/^0+/, '') || '0';
                      }}
                      onChange={(e) => setGroupConfig({ ...groupConfig, maxActiveGroups: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]"
                      placeholder="5"
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum number of concurrent active groups allowed</p>
                  </div>

                  {/* Summary */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Group Summary</h4>
                    <ul className="text-xs text-gray-700 space-y-1">
                      <li>• Each group needs {groupConfig.minParticipants}-{groupConfig.maxParticipants} participants</li>
                      <li>• Each member can order {groupConfig.quantityPerPerson.min}-{groupConfig.quantityPerPerson.max}{selectedProduct?.inventory?.unit || 'kg'}</li>
                      <li>• Bulk price: ₦{(groupConfig.bulkPricePerUnit / 100).toLocaleString()} per {selectedProduct?.inventory?.unit || 'unit'}</li>
                      <li>• Target quantity: {groupConfig.targetQuantity}{selectedProduct?.inventory?.unit || 'kg'}</li>
                      <li>• Checkout window: {groupConfig.checkoutWindowHours} hours</li>
                      <li>• Up to {groupConfig.maxActiveGroups} active groups can run simultaneously</li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <div>
                {selectedProduct?.groupConfig?.enabled && (
                  <button
                    type="button"
                    onClick={() => {
                      // Navigate to create group page
                      setShowGroupModal(false);
                      window.location.href = `/admin/group-orders/create?productId=${selectedProduct._id}`;
                    }}
                    className="text-sm text-[#1D7B3C] hover:text-[#166430] font-medium underline"
                  >
                    + Create New Group
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowGroupModal(false);
                    setSelectedProduct(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isConfiguringGroup}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveGroupConfig}
                  disabled={isConfiguringGroup || (groupConfig.enabled && (
                    groupConfig.minParticipants < 2 ||
                    groupConfig.maxParticipants < 2 ||
                    groupConfig.minParticipants > groupConfig.maxParticipants ||
                    groupConfig.quantityPerPerson.min < 1 ||
                    groupConfig.quantityPerPerson.max < 1 ||
                    groupConfig.quantityPerPerson.min > groupConfig.quantityPerPerson.max ||
                    groupConfig.targetQuantity < 1 ||
                    groupConfig.bulkPricePerUnit <= 0 ||
                    groupConfig.deadlineHours < 1 ||
                    groupConfig.checkoutWindowHours < 1 ||
                    groupConfig.maxActiveGroups < 1
                  ))}
                  className="bg-[#1D7B3C] text-white px-6 py-2 rounded-lg hover:bg-[#166430] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConfiguringGroup ? "Saving..." : "Save Configuration"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;