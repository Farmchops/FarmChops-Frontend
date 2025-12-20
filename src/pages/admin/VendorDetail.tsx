import React from 'react';
import { Trash2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetFarmerQuery,
  useUpdateFarmerStatusMutation,
  useCreateFarmerContactMutation,
  useCreateFarmerRequestInfoMutation,
  useCreateFarmerNoteMutation,
  useDeleteFarmerMutation,
} from '@/redux/api/vendorsApi';
import AlertModal from '@/components/AlertModal';

type Item = {
  name?: string;
  description?: string;
  unit?: string;
  available?: boolean;
};

type Farmer = {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  address?: string;
  createdAt?: string;
  items?: Item[];
  [k: string]: unknown;
};

const FarmerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetFarmerQuery(id || '');

  // Normalize possible response shapes from backend
  // Backend may return either:
  // - { success: true, data: { farmer: {...} } }
  // - { success: true, data: { _id: '...', ... } } (data is farmer)
  // - { success: true, farmer: { ... } }
  let farmer: Farmer | undefined;

  if (data) {
    const root = data as unknown as Record<string, unknown>;
    console.debug('FarmerDetail raw response:', root);
    if (root.data && typeof root.data === 'object') {
      const d = root.data as Record<string, unknown>;
      if (d.farmer && typeof d.farmer === 'object') farmer = d.farmer as Farmer;
      else if ((d as Farmer)._id) farmer = d as Farmer;
    }

    if (!farmer && 'farmer' in root && typeof (root as Record<string, unknown>)['farmer'] === 'object') {
      farmer = (root as Record<string, unknown>)['farmer'] as Farmer;
    }
  }

  const [updateStatus] = useUpdateFarmerStatusMutation();
  const [createContact] = useCreateFarmerContactMutation();
  const [createRequest] = useCreateFarmerRequestInfoMutation();
  const [createNote] = useCreateFarmerNoteMutation();
  const [deleteFarmer, { isLoading: isDeleting }] = useDeleteFarmerMutation();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmLoading, setConfirmLoading] = React.useState(false);

  if (isLoading) return <div className="p-6">Loading farmer...</div>;
  if (error) return <div className="p-6 text-red-500">Failed to load farmer.</div>;
  if (!farmer) return <div className="p-6">Farmer not found.</div>;

  const farmerId = (farmer._id ?? farmer.id) as string;

  const statusClass = (() => {
    switch (farmer.status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-800';
      case 'needs_info':
        return 'bg-orange-50 text-orange-800';
      case 'contacted':
        return 'bg-blue-50 text-blue-800';
      case 'partnered':
        return 'bg-green-50 text-green-800';
      case 'declined':
        return 'bg-red-50 text-red-800';
      default:
        return 'bg-gray-50 text-gray-800';
    }
  })();

  const handleChangeStatus = async () => {
    const next = window.prompt('Enter status (pending, needs_info, contacted, partnered, declined):', (farmer?.status as string) || 'pending');
    if (!next) return;
    if (!['pending','needs_info','contacted','partnered','declined'].includes(next)) {
      alert('Invalid status');
      return;
    }

    try {
  await updateStatus({ id: farmerId, status: next }).unwrap();
      alert('Status updated');
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const handleAddContact = async () => {
    const note = window.prompt('Contact note:');
    if (!note) return;
    try {
  await createContact({ id: farmerId, note }).unwrap();
      alert('Contact recorded');
    } catch (err) {
      console.error(err);
      alert('Failed to add contact');
    }
  };

  const handleRequestInfo = async () => {
    const message = window.prompt('Message to farmer:');
    if (!message) return;
    try {
  await createRequest({ id: farmerId, message, notify: true }).unwrap();
      alert('Request created');
    } catch (err) {
      console.error(err);
      alert('Failed to create request');
    }
  };

  const handleAddNote = async () => {
    const text = window.prompt('Internal note text:');
    if (!text) return;
    try {
  await createNote({ id: farmerId, text }).unwrap();
      alert('Note created');
    } catch (err) {
      console.error(err);
      alert('Failed to create note');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Farmer: {farmer.firstName} {farmer.lastName}</h1>
      <p className="mb-2">Address: {farmer.address as string}</p>
      <p className="mb-4">Status: {farmer.status}</p>

      <div className="flex gap-2 mb-4">
        <button onClick={handleChangeStatus} className="px-3 py-1 border rounded">Change Status</button>
        <button onClick={handleAddContact} className="px-3 py-1 border rounded">Add Contact</button>
        <button onClick={handleRequestInfo} className="px-3 py-1 border rounded">Request Info</button>
        <button onClick={handleAddNote} className="px-3 py-1 border rounded">Add Note</button>
      </div>

      <section>
        <h2 className="text-lg font-medium mb-2">Details</h2>

        <div className="bg-white border rounded p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Created</div>
              <div className="text-sm text-gray-800">{farmer.createdAt ? new Date(farmer.createdAt).toLocaleString() : '—'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <div className="mt-1 flex items-center gap-3">
                <div className={`inline-block px-2 py-1 rounded text-sm font-medium ${statusClass}`}>
                  {farmer.status}
                </div>
                <button
                  onClick={() => setConfirmOpen(true)}
                  disabled={isDeleting || confirmLoading}
                  className="px-2 py-1 border rounded bg-red-50 text-red-700 text-sm flex items-center justify-center"
                  aria-label="Delete farmer"
                  title="Delete farmer"
                >
                  {isDeleting || confirmLoading ? 'Deleting…' : <Trash2 size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-medium mb-2">Items</h3>
            {Array.isArray(farmer.items) && farmer.items.length > 0 ? (
              <ul className="divide-y">
                {farmer.items.map((it: Item, idx: number) => (
                  <li key={idx} className="py-2 flex justify-between">
                    <div>
                      <div className="font-medium">{it.name}</div>
                      {it.description ? <div className="text-sm text-gray-600">{it.description}</div> : null}
                    </div>
                    <div className="text-sm text-gray-600 text-right">
                      <div>{it.unit ?? 'unit'}</div>
                      <div>{it.available ? 'Available' : 'Unavailable'}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-600">No items listed.</div>
            )}
          </div>
        </div>

      </section>

      <AlertModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        type="confirm"
        title="Delete farmer"
        message="Delete this farmer? This action cannot be undone."
        onConfirm={async () => {
          setConfirmLoading(true);
          try {
            await deleteFarmer(farmerId).unwrap();
            setConfirmLoading(false);
            setConfirmOpen(false);
            navigate('/admin/farmers');
          } catch (err) {
            console.error('Failed to delete farmer', err);
            setConfirmLoading(false);
            setConfirmOpen(false);
            alert('Failed to delete farmer');
          }
        }}
      />
    </div>
  );
};

export default FarmerDetail;
