
import React, { useState } from 'react';
import { useGetVendorsQuery, useUpdateVendorStatusMutation, useDeleteVendorMutation } from '@/redux/api/vendorsApi';
import { Trash2 } from 'lucide-react';
import type { ApiResponse } from '@/types/api';
import AlertModal from '@/components/AlertModal';

type Vendor = { _id: string; id?: string; firstName?: string; lastName?: string; address?: string; phone?: string; email?: string; status?: string; contact?: { phone?: string; email?: string } };

const VendorsList: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, error, isLoading, isFetching } = useGetVendorsQuery({ page, perPage: 20 });
  const [updateStatus] = useUpdateVendorStatusMutation();
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [localStatuses, setLocalStatuses] = React.useState<Record<string, string>>({});
  const [deleteVendor] = useDeleteVendorMutation();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmTarget, setConfirmTarget] = React.useState<{ id?: string; name?: string } | null>(null);

  // Backend may return different shapes. Normalize safely using type guards.
  const raw = data as ApiResponse<unknown> | undefined;
  let vendors: Vendor[] = [];
  let meta: Record<string, unknown> | undefined = undefined;

  if (raw) {
    // Case: { success:true, data: { vendors: [...], meta: {...} } }
    if (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) {
      const dataObj = raw.data as Record<string, unknown>;
      if (Array.isArray(dataObj.vendors)) {
        vendors = dataObj.vendors as Vendor[];
      }
      if (dataObj.meta && typeof dataObj.meta === 'object') {
        meta = dataObj.meta as Record<string, unknown>;
      }
    }

    // Case: { success:true, vendors: [...] }
    if (vendors.length === 0) {
      const root = raw as unknown as Record<string, unknown>;
      if ('vendors' in root && Array.isArray(root['vendors'])) {
        vendors = root['vendors'] as Vendor[];
      }
    }

    // Case: { success:true, data: [...] }
    if (vendors.length === 0 && Array.isArray(raw.data)) {
      vendors = raw.data as Vendor[];
    }
  }

  // Debug: log API response to console to help diagnose mismatched shapes
  if (raw) console.debug('getVendors API response (normalized):', { raw, vendors, meta });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Vendors</h1>

      {isLoading ? (
        <p>Loading vendors...</p>
      ) : error ? (
        <p className="text-red-500">Failed to load vendors.</p>
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
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v, i) => {
                const vendorPhone = v.phone ?? v.contact?.phone ?? '—';
                const vendorEmail = v.email ?? v.contact?.email ?? '—';
                const vendorId = v._id ?? v.id;

                const onStatusChange = async (next: string) => {
                  if (!vendorId) return;
                  // Optimistically update UI
                  const prev = v.status ?? '';
                  setLocalStatuses((s) => ({ ...s, [vendorId]: next }));
                  setUpdatingId(vendorId);
                  try {
                    await updateStatus({ id: vendorId, status: next }).unwrap();
                  } catch (err) {
                    console.error('Failed to update vendor status', err);
                    // revert optimistic update
                    setLocalStatuses((s) => {
                      const copy = { ...s };
                      if (prev) copy[vendorId] = prev;
                      else delete copy[vendorId];
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
                    <td className="p-3 align-top">{vendorPhone}</td>
                    <td className="p-3 align-top">{vendorEmail}</td>
                    <td className="p-3 align-top">
                      <div className="flex items-center gap-2">
                        <select
                          value={localStatuses[vendorId] ?? (v.status ?? '')}
                          onChange={(e) => onStatusChange(e.target.value)}
                          disabled={updatingId === vendorId || deletingId === vendorId}
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
                            setConfirmTarget({ id: vendorId, name: `${v.firstName ?? ''} ${v.lastName ?? ''}`.trim() });
                            setConfirmOpen(true);
                          }}
                          disabled={deletingId === vendorId}
                          className="px-2 py-1 border rounded bg-red-50 text-red-700 text-sm flex items-center justify-center"
                          aria-label={`Delete ${v.firstName} ${v.lastName}`}
                          title={`Delete ${v.firstName} ${v.lastName}`}
                        >
                          {deletingId === vendorId ? 'Deleting…' : <Trash2 size={16} />}
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
        title="Delete vendor"
        message={`Delete ${confirmTarget?.name ?? 'this vendor'}? This action cannot be undone.`}
        onConfirm={async () => {
          if (!confirmTarget?.id) return;
          setDeletingId(confirmTarget.id);
          try {
            await deleteVendor(confirmTarget.id).unwrap();
          } catch (err) {
            console.error('Failed to delete vendor', err);
            alert('Failed to delete vendor');
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

export default VendorsList;
