import React, { useEffect, useRef, useState } from "react";

type CategoryType = {
  _id?: string;
  name?: string;
  description?: string;
  image?: string; // existing image URL
  isActive?: boolean;
};

type Props = {
  open: boolean;
  initial?: CategoryType | null;
  onClose: () => void;
  onSave: (payload: {
    id?: string;
    name: string;
    description: string;
    isActive?: boolean;
    imageFile?: File | null;
  }) => Promise<void>;
};

export default function CategoryModal({ open, initial, onClose, onSave }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initial?.image ?? null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Reset when modal opens / initial changes
  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setDescription(initial?.description ?? "");
      setIsActive(initial?.isActive ?? true);
      setPreview(initial?.image ?? null);
      setFile(null);
      setError(null);
    }
  }, [initial, open]);

  // Create/revoke preview for selected file
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const MAX_BYTES = 2 * 1024 * 1024; // 2MB
  const acceptTypes = ["image/jpeg", "image/png", "image/webp"];

  function validateAndSetFile(candidate?: File | null) {
    setError(null);
    if (!candidate) {
      setFile(null);
      return;
    }
    if (!acceptTypes.includes(candidate.type)) {
      setError("Only JPG, PNG or WEBP allowed.");
      return;
    }
    if (candidate.size > MAX_BYTES) {
      setError("Image too large — max 2MB.");
      return;
    }
    setFile(candidate);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) validateAndSetFile(f);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    validateAndSetFile(f);
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({
        id: initial?._id,
        name: name.trim(),
        description: description.trim(),
        isActive,
        imageFile: file ?? null,
      });
      // parent expected to close modal on success; if not, close here:
      // onClose();
    } catch (err: any) {
      setError(err?.message ?? "Failed to save category.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRemoveImage() {
    setFile(null);
    setPreview(null);
    // Note: parent will receive imageFile === null on save — if your API needs an explicit flag to delete existing image,
    // adjust the parent onSave implementation accordingly.
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      aria-modal="true"
      role="dialog"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-md shadow-xl w-full max-w-md p-6 relative"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-semibold">
              {initial ? "Edit Category" : "Add New Category"}
            </h3>
            {/* <p className="text-sm text-gray-500">Add a new product category to your store</p> */}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="hover:text-gray-700 ml-4"
          >
            ✕
          </button>
        </div>

        {/* Name */}
        <label className="block text-sm font-medium">Category Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 mb-3 w-full rounded border px-3 py-2 text-sm"
          placeholder="Vegetables"
        />

        {/* Description */}
        <label className="block text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 mb-3 w-full rounded border px-3 py-2 text-sm min-h-[72px]"
          placeholder="Fresh farm vegetables"
        />

        {/* Image dropzone */}
        <label className="block text-sm font-medium  mb-2">Category Image</label>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          className={`mb-3 rounded border-2 border-dashed p-4 text-center ${dragActive ? "border-green-600 bg-green-50" : "border-gray-800 bg-white"
            } `}
          style={{ cursor: "pointer" }}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={acceptTypes.join(",")}
            className="hidden"
            onChange={onFileChange}
          />

          {preview ? (
            <div className="flex items-center justify-center flex-col">
              <img
                src={preview}
                alt="preview"
                className="w-28 h-28 object-cover rounded-full mb-2 border"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="px-3 py-1 text-sm border rounded"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-3 py-1 text-sm border rounded text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-2 text-sm text-gray-600">Drop image here or</p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="underline text-sm"
              >
                Browse Files
              </button>
              <p className="mt-2 text-xs text-gray-400">JPG, PNG (Max 2MB)</p>
            </div>
          )}
        </div>

        {/* Active toggle and error */}
        {/* <div className="flex items-center justify-between mb-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <span className="text-sm">Active</span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div> */}

        {/* Actions */}
        <div className="flex justify-between items-center gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded text-sm"
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-[#1D7B3C] text-white rounded text-sm disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Category"}
          </button>
        </div>
      </form>
    </div>
  );
}

