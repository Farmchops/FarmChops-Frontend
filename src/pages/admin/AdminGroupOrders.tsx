// src/pages/admin/AdminGroupOrders.tsx
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Users, Package, Clock, CheckCircle, XCircle, Search, Eye } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAdminGroupOrdersQuery } from "@/redux/api/groupOrdersApi";
import type { GroupOrder } from "@/types/groupOrder";

const AdminGroupOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch admin group orders
  const { data, isLoading } = useGetAdminGroupOrdersQuery(
    statusFilter === 'all' ? { search: searchTerm || undefined } : { status: statusFilter, search: searchTerm || undefined }
  );

  const groups: GroupOrder[] = useMemo(() => data?.groups || [], [data?.groups]);

  const stats = useMemo(() => {
    return {
      total: groups.length,
      active: groups.filter(g => g.status === 'active').length,
      confirmed: groups.filter(g => g.status === 'confirmed').length,
      cancelled: groups.filter(g => g.status === 'cancelled').length,
      totalRevenue: groups
        .filter(g => g.status !== 'cancelled')
        .reduce((sum, g) => sum + (g.filledSlots * g.pricePerSlot), 0),
    };
  }, [groups]);

  const filteredGroups = useMemo(() => {
    let filtered = [...groups];

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.groupId.toLowerCase().includes(search) ||
          g.product.name.toLowerCase().includes(search) ||
          g.participants?.some(p =>
            p.user.firstName?.toLowerCase().includes(search) ||
            p.user.lastName?.toLowerCase().includes(search) ||
            p.user.email?.toLowerCase().includes(search)
          )
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((g) => g.status === statusFilter);
    }

    return filtered;
  }, [groups, searchTerm, statusFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
            <Clock className="h-3.5 w-3.5" />
            Active
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
            <CheckCircle className="h-3.5 w-3.5" />
            Confirmed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
            <XCircle className="h-3.5 w-3.5" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="py-6 mt-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Group Orders</h1>
          <p className="text-sm text-gray-700 mt-1">
            Manage all group buying orders
          </p>
        </div>
        <Link
          to="/admin/group-orders/create"
          className="bg-[#1D7B3C] text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Create New Group
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Groups</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <Users className="h-10 w-10 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.confirmed}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.cancelled}</p>
            </div>
            <XCircle className="h-10 w-10 text-red-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-[#1D7B3C]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <Package className="h-10 w-10 text-[#1D7B3C] opacity-20" />
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by group ID, product, or participant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="confirmed">Confirmed Only</SelectItem>
                <SelectItem value="cancelled">Cancelled Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Groups Table */}
      {filteredGroups.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Groups Found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "No group orders have been created yet"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-sm text-gray-600">
                  <th className="p-4 font-medium">Group ID</th>
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Progress</th>
                  <th className="p-4 font-medium">Price/Slot</th>
                  <th className="p-4 font-medium">Revenue</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Created</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredGroups.map((group) => {
                  const progress = (group.filledSlots / group.totalSlots) * 100;
                  const revenue = group.filledSlots * group.pricePerSlot;

                  return (
                    <tr key={group._id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <span className="font-mono text-sm text-gray-900">
                          {group.groupId}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {group.product.images?.[0] ? (
                            <img
                              src={group.product.images[0]}
                              alt={group.product.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                              <Package className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                          <span className="font-medium text-sm">{group.product.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{group.filledSlots}/{group.totalSlots}</span>
                          </div>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-[#1D7B3C] h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium">
                          {formatCurrency(group.pricePerSlot)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-bold text-[#1D7B3C]">
                          {formatCurrency(revenue)}
                        </span>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(group.status)}
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-600">
                          {formatDate(group.createdAt)}
                        </span>
                      </td>
                      <td className="p-4">
                        <Link
                          to={`/admin/group-orders/${group.groupId}`}
                          className="inline-flex items-center gap-1 text-sm text-[#1D7B3C] hover:text-[#166430] font-medium"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGroupOrders;
