import { useState } from "react";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/redux/api/categoryApi";
import CategoryModal from "./CategoryModal"; // ✅ import modal
import { Pencil, Trash2 } from "lucide-react";

type Category = {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  image?: string;
  productCount?: number;
  isActive?: boolean;
};

export default function Categories() {
  const { data, isLoading } = useGetCategoriesQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const categories: Category[] = (data?.data?.categories ?? []).map((c: any) => ({
    id: c.id ?? c._id,
    _id: c._id,
    name: c.name,
    description: c.description,
    image: c.image,
    productCount: c.productCount,
    isActive: c.isActive,
  }));

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(c: Category) {
    setEditing(c);
    setModalOpen(true);
  }

  async function handleSave(payload: {
    id?: string;
    name: string;
    description: string;
    isActive?: boolean;
    imageFile?: File | null;
  }) {
    if (payload.id) {
      await updateCategory({
        id: payload.id,
        body: {
          name: payload.name,
          description: payload.description,
          isActive: payload.isActive,
        },
      });
    } else {
      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("description", payload.description);
      if (payload.imageFile) formData.append("image", payload.imageFile);
      await createCategory(formData);
    }
    setModalOpen(false);
  }

  async function handleDelete(id?: string) {
    if (!id) return;
    if (confirm("Delete this category?")) {
      await deleteCategory(id);
    }
  }

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="p-6 mt-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Categories</h1>
        <button
          onClick={openCreate}
          className="bg-[#1D7B3C] text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Add Category
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow">
        <table className="w-full text-sm">

          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-[#687182] text-sm">
              <th className="p-3 text-left font-medium">#</th>
              <th className="p-3 text-left font-medium">Category Name</th>
              <th className="p-3 text-left font-medium">Description</th>
              <th className="p-3 text-left font-medium">Products</th>
              <th className="p-3 text-left font-medium">Status</th>
              <th className="p-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c, idx) => (
              <tr key={c.id ?? idx} className="border-b hover:bg-gray-50">
                <td className="p-3">{idx + 1}</td>
                <td className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden flex items-center justify-center">
                    {c.image ? (
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-gray-500">
                        {c.name?.[0] ?? "?"}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{c.name}</div>
                  </div>
                </td>
                <td className="p-3">{c.description ?? "-"}</td>
                <td className="p-3">{c.productCount ?? 0}</td>
                <td className="p-3">
                  <span
                    className={`px - 2 py - 1 rounded text - xs ${c.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                      } `}
                  >
                    {c.isActive ? "active" : "inactive"}
                  </span>
                </td>
                {/* <td className="p-3 flex gap-2">
                  <button
                    className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Edit
                  </button>
                  <button

                    className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>
                </td> */}
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(c)}

                      className="p-2  hover:text-[#1D7B3C] hover:bg-green-50 rounded transition-colors"
                      title="Edit product"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id ?? c._id)} 
                      className="p-2  hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Delete product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Modal uses CategoryModal component */}
      <CategoryModal
        open={modalOpen}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
