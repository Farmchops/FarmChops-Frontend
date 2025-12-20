
import React, { useState } from 'react';
import { useGetFarmersQuery, useUpdateFarmerStatusMutation, useDeleteFarmerMutation } from '@/redux/api/vendorsApi';
import { Trash2 } from 'lucide-react';
import type { ApiResponse } from '@/types/api';
import AlertModal from '@/components/AlertModal';

type FarmerItem = { name?: string; description?: string; unit?: string };
type Farmer = { _id: string; id?: string; firstName?: string; lastName?: string; address?: string; phone?: string; email?: string; status?: string; contact?: { phone?: string; email?: string }; items?: FarmerItem[] };

const FarmersList: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, error, isLoading, isFetching } = useGetFarmersQuery({ page, perPage: 20 });
  const [updateStatus] = useUpdateFarmerStatusMutation();
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [localStatuses, setLocalStatuses] = React.useState<Record<string, string>>({});
  const [deleteFarmer] = useDeleteFarmerMutation();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmTarget, setConfirmTarget] = React.useState<{ id?: string; name?: string } | null>(null);

  // Backend may return different shapes. Normalize safely using type guards.
  const raw = data as ApiResponse<unknown> | undefined;
  let farmers: Farmer[] = [];
  let meta: Record<string, unknown> | undefined = undefined;

  if (raw) {
    // Case: { success:true, data: { vendors: [...], meta: {...} } } (backend returns 'vendors')
    if (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) {
      const dataObj = raw.data as Record<string, unknown>;
      if (Array.isArray(dataObj.vendors)) {
        farmers = dataObj.vendors as Farmer[];
      }
      if (dataObj.meta && typeof dataObj.meta === 'object') {
        meta = dataObj.meta as Record<string, unknown>;
      }
    }

    // Case: { success:true, vendors: [...] }
    if (farmers.length === 0) {
      const root = raw as unknown as Record<string, unknown>;
      if ('vendors' in root && Array.isArray(root['vendors'])) {
        farmers = root['vendors'] as Farmer[];
      }
    }

    // Case: { success:true, data: [...] }
    if (farmers.length === 0 && Array.isArray(raw.data)) {
      farmers = raw.data as Farmer[];
    }
  }

  // Debug: log API response to console to help diagnose mismatched shapes
  if (raw) console.debug('getFarmers API response (normalized):', { raw, farmers, meta });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Farmers</h1>

      {isLoading ? (
        <p>Loading farmers...</p>
      ) : error ? (
        <p className="text-red-500">Failed to load farmers.</p>
      ) : (
        <div>
          <table className="w-full table-auto border-collapse bg-white shadow-sm rounded">
            <thead>
              <tr className="text-left bg-gray-50">
                <th className="p-3 w-12">#</th>
                <th className="p-3">Name</th>
                <th className="p-3">Address</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Email</th>
                <th className="p-3">Products</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {farmers.map((v, i) => {
                const farmerPhone = v.phone ?? v.contact?.phone ?? '—';
                const farmerEmail = v.email ?? v.contact?.email ?? '—';
                const farmerId = v._id ?? v.id;

                const onStatusChange = async (next: string) => {
                  if (!farmerId) return;
                  // Optimistically update UI
                  const prev = v.status ?? '';
                  setLocalStatuses((s) => ({ ...s, [farmerId]: next }));
                  setUpdatingId(farmerId);
                  try {
                    await updateStatus({ id: farmerId, status: next }).unwrap();
                  } catch (err) {
                    console.error('Failed to update farmer status', err);
                    // revert optimistic update
                    setLocalStatuses((s) => {
                      const copy = { ...s };
                      if (prev) copy[farmerId] = prev;
                      else delete copy[farmerId];
                      return copy;
                    });
                  } finally {
                    setUpdatingId(null);
                  }
                };

                return (
                  <tr key={v._id} className="border-t">
                    <td className="p-3 align-top">{(i + 1) + (page - 1) * 20}</td>
                    <td className="p-3 align-top">
                      <div className="font-medium">{v.firstName} {v.lastName}</div>
                    </td>
                    <td className="p-3 align-top">{v.address ?? '—'}</td>
                    <td className="p-3 align-top">{farmerPhone}</td>
                    <td className="p-3 align-top">{farmerEmail}</td>
                    <td className="p-3 align-top">
                      {Array.isArray(v.items) && v.items.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {v.items.map((item, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded"
                              title={item.description || item.name}
                            >
                              {item.name || 'Unnamed'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No products</span>
                      )}
                    </td>
                    <td className="p-3 align-top">
                      <div className="flex items-center gap-2">
                        <select
                          value={localStatuses[farmerId] ?? (v.status ?? '')}
                          onChange={(e) => onStatusChange(e.target.value)}
                          disabled={updatingId === farmerId || deletingId === farmerId}
                          className="border rounded px-2 py-1 text-sm"
                          aria-label={`Change status for ${v.firstName} ${v.lastName}`}
                        >
                          <option value="pending">pending</option>
                          <option value="needs_info">needs_info</option>
                          <option value="contacted">contacted</option>
                          <option value="partnered">partnered</option>
                          <option value="declined">declined</option>
                        </select>
                        <button
                          onClick={() => {
                            setConfirmTarget({ id: farmerId, name: `${v.firstName ?? ''} ${v.lastName ?? ''}`.trim() });
                            setConfirmOpen(true);
                          }}
                          disabled={deletingId === farmerId}
                          className="px-2 py-1 border rounded bg-red-50 text-red-700 text-sm flex items-center justify-center"
                          aria-label={`Delete ${v.firstName} ${v.lastName}`}
                          title={`Delete ${v.firstName} ${v.lastName}`}
                        >
                          {deletingId === farmerId ? 'Deleting…' : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-4 flex items-center justify-end">
            <div className="flex gap-2">
              <button
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
      <AlertModal
        isOpen={Boolean(confirmOpen && confirmTarget)}
        onClose={() => {
          setConfirmOpen(false);
          setConfirmTarget(null);
        }}
        type="confirm"
        title="Delete farmer"
        message={`Delete ${confirmTarget?.name ?? 'this farmer'}? This action cannot be undone.`}
        onConfirm={async () => {
          if (!confirmTarget?.id) return;
          setDeletingId(confirmTarget.id);
          try {
            await deleteFarmer(confirmTarget.id).unwrap();
          } catch (err) {
            console.error('Failed to delete farmer', err);
            alert('Failed to delete farmer');
          } finally {
            setDeletingId(null);
            setConfirmOpen(false);
            setConfirmTarget(null);
          }
        }}
      />
    </div>
  );
};

export default FarmersList;
