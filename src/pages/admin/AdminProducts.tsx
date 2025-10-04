// src/pages/admin/AdminProducts.tsx
import { useState, useMemo } from "react";
// import { useGetProductsQuery, useDeleteProductMutation } from "../../store/api/productApi";
import { Trash2, Pencil, Search, Package } from "lucide-react";
import ProductForm from "./ProductForm";
import { useDeleteProductMutation, useGetProductsQuery } from "@/redux/api/productApi";
//import type { Product } from "../../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const AdminProducts = () => {
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<"list" | "form">("list");
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "out_of_stock">("all");
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock">("name");

  const { data, isLoading, refetch } = useGetProductsQuery({ page, limit: 100 }); // Fetch more for client-side filtering
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

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
      filtered = filtered.filter((p) => p.status === statusFilter);
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

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const result = await deleteProduct(id).unwrap();
      if (result.success) {
        alert("Product deleted successfully!");
        refetch();
      }
    } catch (error: any) {
      alert(error?.data?.message || "Failed to delete product");
    }
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
    <div className="md:p-6 p-2 mt-4 space-y-6">
      {/* Header + Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Products</h1>
          <p className="text-sm text-gray-700 mt-1">
            Showing {filteredProducts.length} of {allProducts.length} products
          </p>
        </div>
        <button
          onClick={() => {
            setEditProduct(null);
            setMode("form");
          }}
          className="bg-[#1D7B3C] text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          + Add Product
        </button>
      </div>

      {/* Search + Filters */}
      <div>
        <div className="flex justify-between items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-1 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] focus:border-transparent placeholder:text-sm"
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


          <div className="flex items-center gap-2 ">
            {/* Status Filter */}
            <div className="relative ">
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as "all" | "active" | "inactive" | "out_of_stock")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "name" | "price" | "stock")}>
              <SelectTrigger className="">
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

      {/* Table */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4 flex items-center justify-center"><Package size={48} /></div>
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className="text-gray-700 mb-4">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by adding your first product"}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <button
              onClick={() => setMode("form")}
              className="bg-[#1D7B3C] text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Product
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
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
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((p, idx) => (
                <tr key={p._id} className="">
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images?.[0] || "/placeholder.png"}
                        alt={p.name}
                        className="w-10 h-10 rounded object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.png";
                        }}
                      />
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs line-clamp-1">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    ₦{p.pricing?.retail?.price?.toLocaleString() || "N/A"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center ${(p.inventory?.availableStock || 0) <= (p.inventory?.lowStockThreshold || 0)
                        ? "text-red-600"
                        : ""
                        }`}
                    >
                      {p.inventory?.availableStock ?? "N/A"} {p.inventory?.unit || ""}
                    </span>
                    {p.isLowStock && (
                      <span className="ml-2 text-xs text-red-600 font-medium">Low!</span>
                    )}
                  </td>
                  <td className="p-3">{p.category?.name || "N/A"}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${p.status === "active"
                        ? "bg-green-100 text-green-800"
                        : p.status === "out_of_stock"
                          ? "bg-red-100 text-black"
                          : "bg-gray-100 text-black"
                        }`}
                    >
                      {p.status === "out_of_stock" ? "Out of Stock" : p.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditProduct(p);
                          setMode("form");
                        }}
                        className="p-2  hover:text-[#1D7B3C] hover:bg-green-50 rounded transition-colors"
                        title="Edit product"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id, p.name)}
                        disabled={isDeleting}
                        className="p-2  hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Info */}
      {filteredProducts.length > 0 && (
        <div className="flex items-center justify-between text-[#1D7B3C]">
          <div className="flex gap-2 ">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-4 py-2 border  rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={!data?.data?.pagination?.hasPrevPage}
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 border  rounded-lg  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={!data?.data?.pagination?.hasNextPage}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;