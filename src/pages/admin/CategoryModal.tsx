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
    removeImage?: boolean; // Flag to indicate image should be removed
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
  const [shouldRemoveImage, setShouldRemoveImage] = useState(false); // Track if user wants to remove image

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
      setShouldRemoveImage(false);
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
    setShouldRemoveImage(false); // If adding new file, cancel removal flag
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
        removeImage: shouldRemoveImage, // Pass the removal flag
      });
    } catch (err: any) {
      setError(err?.message ?? "Failed to save category.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRemoveImage() {
    setFile(null);
    setPreview(null);
    setShouldRemoveImage(true); // Mark for removal
    if (inputRef.current) {
      inputRef.current.value = ""; // Clear file input
    }
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
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="hover:text-gray-700 ml-4 text-xl"
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
        <label className="block text-sm font-medium mb-2">Category Image</label>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          className={`mb-3 rounded border-2 border-dashed p-4 text-center transition-colors ${dragActive ? "border-green-600 bg-green-50" : "border-gray-300 bg-white hover:border-gray-400"
            }`}
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
                className="w-28 h-28 object-cover rounded mb-2 border"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="px-3 py-1 text-sm border rounded text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-600">Drop image here or click to browse</p>
              <p className="text-xs text-gray-400">JPG, PNG, WEBP (Max 2MB)</p>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-[#1D7B3C] text-white rounded text-sm hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Category"}
          </button>
        </div>
      </form>
    </div>
  );
}