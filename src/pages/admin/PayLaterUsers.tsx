// src/pages/admin/PayLaterUsers.tsx
import { useState } from 'react';
import { Search, Filter, ChevronDown, CreditCard, AlertTriangle, CheckCircle, X, DollarSign } from 'lucide-react';
import {
    useGetAdminPayLaterUsersQuery,
    useUpdateUserCreditLimitMutation,
    useMarkLoanRepaidMutation,
    type AdminPayLaterUser
} from '@/redux/api/paylaterApi';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const PayLaterUsers = () => {
    const [loanFilter, setLoanFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<AdminPayLaterUser | null>(null);
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showRepaidModal, setShowRepaidModal] = useState(false);
    const [newCreditLimit, setNewCreditLimit] = useState('');
    const [repaidAmount, setRepaidAmount] = useState('');
    const [repaidNotes, setRepaidNotes] = useState('');

    const { data, isLoading, refetch } = useGetAdminPayLaterUsersQuery({
        hasActiveLoan: loanFilter || undefined,
    });
    const [updateCreditLimit, { isLoading: isUpdatingCredit }] = useUpdateUserCreditLimitMutation();
    const [markLoanRepaid, { isLoading: isMarkingRepaid }] = useMarkLoanRepaidMutation();

    const users = data?.data?.users ?? [];
    const stats = data?.data?.stats;

    const filteredUsers = users.filter(user => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            user.user.firstName.toLowerCase().includes(query) ||
            user.user.lastName.toLowerCase().includes(query) ||
            user.user.email.toLowerCase().includes(query)
        );
    });

    const handleOpenCreditModal = (user: AdminPayLaterUser) => {
        setSelectedUser(user);
        setNewCreditLimit(user.creditLimit.toString());
        setShowCreditModal(true);
    };

    const handleUpdateCredit = async () => {
        if (!selectedUser || !newCreditLimit) return;

        try {
            await updateCreditLimit({
                userId: selectedUser.user._id,
                creditLimit: Number(newCreditLimit),
            }).unwrap();

            setShowCreditModal(false);
            setSelectedUser(null);
            refetch();
        } catch (error) {
            console.error('Failed to update credit limit:', error);
        }
    };

    const handleOpenRepaidModal = (user: AdminPayLaterUser) => {
        setSelectedUser(user);
        setRepaidAmount(user.activeLoan?.amount.toString() ?? '');
        setRepaidNotes('');
        setShowRepaidModal(true);
    };

    const handleMarkRepaid = async () => {
        if (!selectedUser || !selectedUser.activeLoan || !repaidAmount) return;

        try {
            await markLoanRepaid({
                orderId: selectedUser.activeLoan.orderId,
                repaidAmount: Number(repaidAmount),
                notes: repaidNotes || undefined,
            }).unwrap();

            setShowRepaidModal(false);
            setSelectedUser(null);
            refetch();
        } catch (error) {
            console.error('Failed to mark loan as repaid:', error);
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">PayLater Users</h1>
                <p className="text-gray-600">Manage users with active PayLater accounts</p>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                                <p className="text-sm text-gray-600">Total Users</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.usersWithActiveLoan}</p>
                                <p className="text-sm text-gray-600">Active Loans</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalOutstanding)}</p>
                                <p className="text-sm text-gray-600">Outstanding</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.overdueLoans}</p>
                                <p className="text-sm text-gray-600">Overdue</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/20 focus:border-[#1D7B3C]"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={loanFilter}
                            onChange={(e) => setLoanFilter(e.target.value)}
                            className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/20 focus:border-[#1D7B3C] appearance-none"
                        >
                            <option value="">All Users</option>
                            <option value="true">With Active Loan</option>
                            <option value="false">No Active Loan</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Credit Limit
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Available
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Active Loan
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Due Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {user.user.firstName} {user.user.lastName}
                                                </p>
                                                <p className="text-sm text-gray-500">{user.user.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="font-medium text-gray-900">{formatCurrency(user.creditLimit)}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className={`font-medium ${user.availableCredit > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                                {formatCurrency(user.availableCredit)}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            {user.hasActiveLoan && user.activeLoan ? (
                                                <p className="font-bold text-amber-600">{formatCurrency(user.activeLoan.amount)}</p>
                                            ) : (
                                                <p className="text-gray-500">-</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            {user.activeLoan?.dueDate ? (
                                                <p className={`text-sm ${user.activeLoan.isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                                                    {formatDate(user.activeLoan.dueDate)}
                                                </p>
                                            ) : (
                                                <p className="text-gray-500">-</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            {user.hasActiveLoan ? (
                                                user.activeLoan?.isOverdue ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        Overdue
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                        Active Loan
                                                    </span>
                                                )
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Available
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenCreditModal(user)}
                                                    className="px-3 py-1.5 text-xs font-medium text-[#1D7B3C] border border-[#1D7B3C] rounded-lg hover:bg-green-50 transition"
                                                >
                                                    Edit Limit
                                                </button>
                                                {user.hasActiveLoan && user.activeLoan && (
                                                    <button
                                                        onClick={() => handleOpenRepaidModal(user)}
                                                        className="px-3 py-1.5 text-xs font-medium text-white bg-[#1D7B3C] rounded-lg hover:bg-green-700 transition"
                                                    >
                                                        Mark Repaid
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Credit Limit Modal */}
            {showCreditModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md">
                        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Update Credit Limit</h3>
                            <button
                                onClick={() => setShowCreditModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-5">
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <p className="font-medium text-gray-900">
                                    {selectedUser.user.firstName} {selectedUser.user.lastName}
                                </p>
                                <p className="text-sm text-gray-600">{selectedUser.user.email}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Current limit: {formatCurrency(selectedUser.creditLimit)}
                                </p>
                            </div>

                            <div>
                                <label htmlFor="newCreditLimit" className="block text-sm font-medium text-gray-700 mb-1">
                                    New Credit Limit (NGN)
                                </label>
                                <input
                                    type="number"
                                    id="newCreditLimit"
                                    value={newCreditLimit}
                                    onChange={(e) => setNewCreditLimit(e.target.value)}
                                    min="50000"
                                    max="500000"
                                    step="10000"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/20 focus:border-[#1D7B3C]"
                                />
                            </div>
                        </div>

                        <div className="p-5 border-t border-gray-200 flex gap-3">
                            <button
                                onClick={() => setShowCreditModal(false)}
                                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateCredit}
                                disabled={isUpdatingCredit || !newCreditLimit}
                                className="flex-1 py-3 px-4 bg-[#1D7B3C] text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                            >
                                {isUpdatingCredit ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mark Repaid Modal */}
            {showRepaidModal && selectedUser && selectedUser.activeLoan && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md">
                        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Mark Loan as Repaid</h3>
                            <button
                                onClick={() => setShowRepaidModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-5">
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <p className="font-medium text-gray-900">
                                    {selectedUser.user.firstName} {selectedUser.user.lastName}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Loan Amount: <span className="font-bold text-amber-600">{formatCurrency(selectedUser.activeLoan.amount)}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Due Date: {formatDate(selectedUser.activeLoan.dueDate)}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="repaidAmount" className="block text-sm font-medium text-gray-700 mb-1">
                                        Repaid Amount (NGN)
                                    </label>
                                    <input
                                        type="number"
                                        id="repaidAmount"
                                        value={repaidAmount}
                                        onChange={(e) => setRepaidAmount(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/20 focus:border-[#1D7B3C]"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="repaidNotes" className="block text-sm font-medium text-gray-700 mb-1">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        id="repaidNotes"
                                        value={repaidNotes}
                                        onChange={(e) => setRepaidNotes(e.target.value)}
                                        placeholder="e.g., IPPIS deduction confirmed"
                                        rows={2}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/20 focus:border-[#1D7B3C] resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-gray-200 flex gap-3">
                            <button
                                onClick={() => setShowRepaidModal(false)}
                                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleMarkRepaid}
                                disabled={isMarkingRepaid || !repaidAmount}
                                className="flex-1 py-3 px-4 bg-[#1D7B3C] text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                            >
                                {isMarkingRepaid ? 'Processing...' : 'Confirm Repaid'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayLaterUsers;
