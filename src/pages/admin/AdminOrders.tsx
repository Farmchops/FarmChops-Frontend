/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { MoreHorizontal, X } from "lucide-react";
import { useGetOrdersQuery, useGetOrderByIdQuery, useUpdateOrderStatusMutation } from "@/redux/api/adminOrdersApi";


const currency = (amount: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "NGN" }).format(amount);

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";

const StatusSelect = ({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}) => {
  const options = ["pending", "processing", "shipped", "delivered", "cancelled"];
  const current = (value || "").toLowerCase();

    const dotClass = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500"; // success
      case "processing":
        return "bg-amber-500"; // warm/orange to distinguish from shipped
      case "pending":
        return "bg-yellow-500";
      case "shipped":
        return "bg-purple-500"; // distinct from processing
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };


  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${dotClass(current)}`} />
      <select
        className="min-w-36 border border-gray-300 rounded-md px-2 py-1 text-sm bg-white text-gray-800 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200"
        value={current}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};




const DetailsModal = ({ orderId, onClose }: { orderId: string; onClose: () => void }) => {
  const { data, isLoading, isError } = useGetOrderByIdQuery(orderId);
  const order = (data as any)?.data?.order;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white w-full max-w-md rounded-md shadow-xl p-6 text-center">Loading...</div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white w-full max-w-md rounded-md shadow-xl p-6 text-center">Failed to load order details.</div>
      </div>
    );
  }

  const totalNaira =
    typeof order.summary?.totalAmountInNaira === "number"
      ? order.summary.totalAmountInNaira
      : typeof order.totalAmount === "number"
      ? order.totalAmount / 100
      : 0;

  const name = (order.user?.firstName || order.user?.lastName)
    ? `${order.user?.firstName ?? ""} ${order.user?.lastName ?? ""}`.trim()
    : order.user?.email || "-";

    const buyerNote = order.notes ?? order.note ?? order.orderNote ?? order.customerNote ?? order.deliveryInfo?.note ?? "-";


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-3xl rounded-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h3 className="text-xl font-semibold">Order {order.orderNumber}</h3>
            <p className="text-sm text-gray-500">Created: {formatDate(order.createdAt)}</p>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Item Summary */}
          <section>
            <h4 className="font-semibold mb-2">Item Summary</h4>
            <div className="border rounded">
              {order.items?.length ? (
                order.items.map((it: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 border-b last:border-0">
                    <div>
                      <div className="font-medium">{it.productName || it.product}</div>
                      <div className="text-xs text-gray-500">Qty: {it.quantity}</div>
                    </div>
                    <div className="text-right text-sm">
                      <div>{currency((it.totalPrice ?? 0) / 100)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-sm text-gray-500">No items</div>
              )}
            </div>
          </section>

          {/* Payment Details */}
          <section>
            <h4 className="font-semibold mb-2">Payment Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Method</span><span>{order.paymentMethod || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Payment Status</span><span>{order.paymentStatus || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Reference</span><span className="truncate max-w-[160px]" title={order.paymentReference}>{order.paymentReference || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>{currency((order.subtotal ?? 0) / 100)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Delivery Fee</span><span>{currency((order.deliveryFee ?? 0) / 100)}</span></div>
              <div className="flex justify-between font-medium"><span>Total</span><span>{currency(totalNaira)}</span></div>
            </div>
          </section>

          {/* Buyer Note */}
          <section className="md:col-span-2">
            <h4 className="font-semibold mb-2">Buyer Note</h4>
            <div className="border rounded p-3 text-sm bg-gray-50">
              {buyerNote || "-"}
            </div>
            {order.statusHistory?.length ? (
              <div className="mt-3">
                <h5 className="font-semibold mb-1 text-sm">Status History</h5>
                <div className="border rounded divide-y">
                  {order.statusHistory.map((h: any, i: number) => (
                    <div key={i} className="p-2 text-xs flex items-center justify-between">
                      <span className="capitalize">{h.status}</span>
                      <span className="text-gray-500">{formatDate(h.timestamp)}</span>
                      <span className="text-gray-600 truncate max-w-[50%]" title={h.note}>{h.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          {/* Customer & Shipping */}
          <section className="md:col-span-2">
            <h4 className="font-semibold mb-2">Customer & Shipping</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="border rounded p-3">
                <div className="text-gray-600">Customer</div>
                <div className="font-medium">{name}</div>
                <div className="text-xs text-gray-500">{order.user?.email || '-'}</div>
              </div>
              <div className="border rounded p-3">
                <div className="text-gray-600">Contact</div>
                <div className="font-medium">{order.deliveryInfo?.phoneNumber || '-'}</div>
              </div>
              <div className="border rounded p-3 md:col-span-2">
                <div className="text-gray-600">Shipping Address</div>
                <div className="font-medium">{order.deliveryInfo?.address || '-'}</div>
                <div className="text-xs text-gray-500">{order.deliveryInfo?.city || '-'}</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};


const AdminOrders = () => {
  const { data, isLoading, isError } = useGetOrdersQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const orders = useMemo(() => (data as any)?.data?.orders ?? (data as any)?.data ?? [], [data]);


  
      const handleStatusChange = async (order: any, next: string) => {
    if (!order?._id) return;
    try {
      const res = await updateStatus({ id: order._id, status: next }).unwrap();
      if (!(res as any)?.success) {
        throw new Error((res as any)?.message || 'Unknown error');
      }
    } catch (e: any) {
      const msg = e?.data?.message || e?.message || 'Failed to update order status.';
      console.error('Failed to update status', e);
      alert(msg);
    }
  };




  return (
    <div className="p-2 md:p-6 mt-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Orders</h1>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-[#687182] text-sm">
              <th className="p-3 text-left font-medium">#</th>
              <th className="p-3 text-left font-medium">Order Number</th>
              <th className="p-3 text-left font-medium">Customer</th>
              <th className="p-3 text-left font-medium">Total</th>
              <th className="p-3 text-left font-medium">Status</th>
              <th className="p-3 text-left font-medium">Date</th>
              <th className="p-3 text-left font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  Loading orders...
                </td>
              </tr>
            )}

            {isError && !isLoading && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-red-600">
                  Failed to load orders. Please try again.
                </td>
              </tr>
            )}

            {!isLoading && !isError && orders.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}

            {!isLoading && !isError && orders.map((o: any, idx: number) => {
              const name = (o.user?.firstName || o.user?.lastName)
                ? `${o.user?.firstName ?? ''} ${o.user?.lastName ?? ''}`.trim()
                : (o.user?.email || '-');

              const totalNaira =
                typeof o.summary?.totalAmountInNaira === 'number'
                  ? o.summary.totalAmountInNaira
                  : typeof o.totalAmount === 'number'
                    ? o.totalAmount / 100
                    : 0;

              return (
                <tr key={o._id ?? o.id ?? idx} className="border-b hover:bg-gray-50">
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3 font-medium">{o.orderNumber ?? '-'}</td>
                  <td className="p-3">{name || '-'}</td>
                  <td className="p-3">{currency(totalNaira)}</td>
                  <td className="p-3">
                                        <StatusSelect
                      value={o.orderStatus ?? ''}
                      onChange={(next) => handleStatusChange(o, next)}
                      disabled={isUpdating}
                    />

                  </td>
                  <td className="p-3">{formatDate(o.createdAt)}</td>
                  <td className="p-3">
                                        <button
                      className="p-2 hover:text-[#1D7B3C] hover:bg-green-50 rounded transition-colors"
                      title="More actions"
                      onClick={() => setSelectedOrderId(o._id)}
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>

                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

            {selectedOrderId && (
        <DetailsModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />)
      }

    </div>
  );
};

export default AdminOrders;