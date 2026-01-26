// src/pages/admin/CreateGroupOrder.tsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Package, Users, AlertCircle } from "lucide-react";
import { alertService } from "@/lib/alertService";
import { resolveErrorMessage } from "@/lib/utils";
import { useGetProductsQuery } from "@/redux/api/productApi";
import { useCreateGroupMutation } from "@/redux/api/adminGroupOrdersApi";

const CreateGroupOrder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedProductId = searchParams.get("productId");

  const [selectedProductId, setSelectedProductId] = useState(preselectedProductId || "");
  const [isCreating, setIsCreating] = useState(false);

  const { data: productsData, isLoading: loadingProducts } = useGetProductsQuery({ page: 1, limit: 100 });
  const products = productsData?.data?.products || [];

  // Filter products that have group buying enabled
  const groupEnabledProducts = products.filter(p =>
    p.groupConfig?.enabled || ((p as unknown as { groupBuyingEnabled?: boolean }).groupBuyingEnabled)
  );

  const selectedProduct = products.find(p => p._id === selectedProductId);

  useEffect(() => {
    if (preselectedProductId) {
      setSelectedProductId(preselectedProductId);
    }
  }, [preselectedProductId]);

  const [createGroup] = useCreateGroupMutation();

  const handleCreateGroup = async () => {
    if (!selectedProduct) {
      alertService.show({
        type: "error",
        title: "Validation Error",
        message: "Please select a product",
      });
      return;
    }

    if (!selectedProduct.groupConfig?.enabled && !((selectedProduct as unknown as { groupBuyingEnabled?: boolean }).groupBuyingEnabled)) {
      alertService.show({
        type: "error",
        title: "Invalid Product",
        message: "This product does not have group buying enabled",
      });
      return;
    }

    alertService.show({
      type: "confirm",
      title: "Create New Group",
      message: `Create a new group order for ${selectedProduct.name}?`,
      onConfirm: async () => {
        setIsCreating(true);
        try {
          const result = await createGroup(selectedProduct._id).unwrap();
          if (result?.success) {
            alertService.show({
              type: "success",
              title: "Group Created",
              message: "New group order has been created successfully",
            });
            navigate("/admin/group-orders");
          } else {
            throw new Error('Create group failed');
          }
        } catch (error: unknown) {
          alertService.show({
            type: "error",
            title: "Creation Failed",
            message: resolveErrorMessage(error) || 'Failed to create group order',
          });
        } finally {
          setIsCreating(false);
        }
      },
    });
  };

  return (
    <div className="py-6 mt-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/admin/group-orders")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-semibold">Create New Group Order</h1>
          <p className="text-sm text-gray-700 mt-1">
            Start a new group buying session for customers
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Product *
            </label>

            {loadingProducts ? (
              <div className="text-sm text-gray-600">Loading products...</div>
            ) : groupEnabledProducts.length === 0 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">No Products Available</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      No products have group buying enabled. Please enable group buying for at least one product first.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate("/admin/products")}
                      className="mt-3 text-sm text-yellow-800 hover:text-yellow-900 font-medium underline"
                    >
                      Go to Products
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]"
              >
                <option value="">-- Select a product --</option>
                {groupEnabledProducts.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} - ₦{(product.groupConfig?.bulkPricePerUnit || 0) / 100} per {product.inventory?.unit || 'unit'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Product Details Preview */}
          {selectedProduct && selectedProduct.groupConfig && (
            <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Group Configuration</h3>

              <div className="flex items-start gap-4 mb-4">
                {selectedProduct.images?.[0] && (
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{selectedProduct.name}</h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{selectedProduct.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600">Max Participants</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedProduct.groupConfig.maxParticipants} members
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600">Quantity per Person</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedProduct.groupConfig.quantityPerPerson?.min || 0} {selectedProduct.inventory?.unit || 'units'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Fixed for all participants</p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-xs font-medium text-gray-600 block mb-1">Bulk Price per Unit</span>
                  <p className="text-lg font-bold text-[#1D7B3C]">
                    ₦{((selectedProduct.groupConfig.bulkPricePerUnit || 0) / 100).toLocaleString()}
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-xs font-medium text-gray-600 block mb-1">Target Quantity</span>
                  <p className="text-lg font-bold text-[#1D7B3C]">
                    {selectedProduct.groupConfig.targetQuantity || 0}{selectedProduct.inventory?.unit || 'kg'}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> This group will appear on the customer-facing Group Sharing page immediately after creation.
                  It will remain active until all {selectedProduct.groupConfig.maxParticipants} participants join.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/admin/group-orders")}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateGroup}
              disabled={!selectedProduct || isCreating}
              className="bg-[#1D7B3C] text-white px-6 py-2 rounded-lg hover:bg-[#166430] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              {isCreating ? "Creating..." : "Create Group Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupOrder;
