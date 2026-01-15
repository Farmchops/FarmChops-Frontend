// src/pages/admin/PayLaterApplications.tsx
import { useState } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, ChevronDown, X, CheckCircle2, AlertCircle } from 'lucide-react';
import {
    useGetAdminApplicationsQuery,
    useReviewApplicationMutation,
    type AdminApplication
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

const PayLaterApplications = () => {
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedApplication, setSelectedApplication] = useState<AdminApplication | null>(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
    const [creditLimit, setCreditLimit] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const { data, isLoading, refetch } = useGetAdminApplicationsQuery({
        status: statusFilter || undefined,
    });
    const [reviewApplication, { isLoading: isReviewing }] = useReviewApplicationMutation();

    const applications = data?.data?.applications ?? [];
    const stats = data?.data?.stats;

    const filteredApplications = applications.filter(app => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            app.firstName.toLowerCase().includes(query) ||
            app.lastName.toLowerCase().includes(query) ||
            app.email.toLowerCase().includes(query) ||
            app.phoneNumber.includes(query)
        );
    });

    const handleOpenReview = (application: AdminApplication, action: 'approve' | 'reject') => {
        setSelectedApplication(application);
        setReviewAction(action);
        setCreditLimit('');
        setRejectionReason('');
        setShowReviewModal(true);
    };

    const handleReview = async () => {
        if (!selectedApplication || !reviewAction) return;

        // Validate credit limit for approval
        if (reviewAction === 'approve' && (!creditLimit || Number(creditLimit) < 50000)) {
            setToast({ type: 'error', message: 'Please enter a valid credit limit (minimum ₦50,000)' });
            setTimeout(() => setToast(null), 4000);
            return;
        }

        try {
            const result = await reviewApplication({
                id: selectedApplication._id,
                action: reviewAction,
                creditLimit: reviewAction === 'approve' ? Number(creditLimit) : undefined,
                rejectionReason: reviewAction === 'reject' ? rejectionReason : undefined,
            }).unwrap();

            console.log('Review successful:', result);
            setToast({
                type: 'success',
                message: reviewAction === 'approve'
                    ? 'Application approved successfully!'
                    : 'Application rejected successfully'
            });
            setTimeout(() => setToast(null), 4000);
            setShowReviewModal(false);
            setSelectedApplication(null);
            refetch();
        } catch (error: unknown) {
            console.error('Failed to review application:', error);
            const errorMessage = error && typeof error === 'object' && 'data' in error
                ? (error.data as { message?: string })?.message || 'Failed to process application'
                : 'Failed to process application';
            setToast({ type: 'error', message: errorMessage });
            setTimeout(() => setToast(null), 4000);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <Clock className="w-3 h-3" />
                        Pending
                    </span>
                );
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3" />
                        Approved
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3" />
                        Rejected
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">PayLater Applications</h1>
                <p className="text-gray-600">Review and manage PayLater credit applications</p>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                                <p className="text-sm text-gray-600">Pending</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                                <p className="text-sm text-gray-600">Approved</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                                <p className="text-sm text-gray-600">Rejected</p>
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
                            placeholder="Search by name, email, or phone..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/20 focus:border-[#1D7B3C]"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/20 focus:border-[#1D7B3C] appearance-none"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
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
                ) : filteredApplications.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No applications found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Applicant
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        IPPIS / BVN / NIN
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Verification Score
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Applied
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Credit Limit
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredApplications.map((app) => (
                                    <tr key={app._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {app.firstName} {app.lastName}
                                                </p>
                                                <p className="text-sm text-gray-500 capitalize">{app.gender}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="text-sm text-gray-900">{app.email}</p>
                                                <p className="text-sm text-gray-500">{app.phoneNumber}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm space-y-0.5">
                                                {app.ippis && <p className="text-gray-900 font-medium">IPPIS: {app.ippis}</p>}
                                                <p className="text-gray-600">BVN: {app.bvn}</p>
                                                <p className="text-gray-500">NIN: {app.nin || 'Pending'}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {app.verificationScore !== undefined ? (
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${app.verificationScore >= 80
                                                        ? 'bg-green-100 text-green-800'
                                                        : app.verificationScore >= 50
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {app.verificationScore}/100
                                                    </span>
                                                    {app.verificationScore >= 80 && <span className="text-xs text-green-600">✓ Strong</span>}
                                                    {app.verificationScore >= 50 && app.verificationScore < 80 && <span className="text-xs text-yellow-600">! Review</span>}
                                                    {app.verificationScore < 50 && <span className="text-xs text-red-600">✗ Weak</span>}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-sm text-gray-900">{formatDate(app.createdAt)}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            {getStatusBadge(app.status)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-sm text-gray-900">
                                                {app.creditLimit ? formatCurrency(app.creditLimit) : '-'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            {app.status === 'pending' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedApplication(app)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenReview(app, 'approve')}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenReview(app, 'reject')}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedApplication(app)}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {showReviewModal && selectedApplication && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">
                                {reviewAction === 'approve' ? 'Approve Application' : 'Reject Application'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowReviewModal(false);
                                    setSelectedApplication(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 max-h-[80vh] overflow-y-auto">
                            {/* Verification Summary - Redesigned */}
                            {selectedApplication.verificationScore !== undefined && (
                                <div className="relative overflow-hidden bg-white border-2 border-gray-100 rounded-xl p-6 mb-6 shadow-sm">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-bl-full opacity-50"></div>

                                    <div className="relative">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900 mb-1">Verification Score</h4>
                                                <p className="text-sm text-gray-500">Identity verification analysis</p>
                                            </div>
                                            <div className="text-right">
                                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-2xl ${selectedApplication.verificationScore >= 80
                                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                                    : selectedApplication.verificationScore >= 50
                                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                        : 'bg-red-50 text-red-700 border border-red-200'
                                                    }`}>
                                                    {selectedApplication.verificationScore}
                                                    <span className="text-sm font-medium">/ 100</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`flex items-start gap-3 p-3 rounded-lg ${selectedApplication.verificationScore >= 80
                                            ? 'bg-green-50 border border-green-100'
                                            : selectedApplication.verificationScore >= 50
                                                ? 'bg-amber-50 border border-amber-100'
                                                : 'bg-red-50 border border-red-100'
                                            }`}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${selectedApplication.verificationScore >= 80
                                                ? 'bg-green-100'
                                                : selectedApplication.verificationScore >= 50
                                                    ? 'bg-amber-100'
                                                    : 'bg-red-100'
                                                }`}>
                                                {selectedApplication.verificationScore >= 80 && <span className="text-xl">✓</span>}
                                                {selectedApplication.verificationScore >= 50 && selectedApplication.verificationScore < 80 && <span className="text-xl">⚠</span>}
                                                {selectedApplication.verificationScore < 50 && <span className="text-xl">✕</span>}
                                            </div>
                                            <div>
                                                <p className={`font-semibold mb-1 ${selectedApplication.verificationScore >= 80
                                                    ? 'text-green-900'
                                                    : selectedApplication.verificationScore >= 50
                                                        ? 'text-amber-900'
                                                        : 'text-red-900'
                                                    }`}>
                                                    {selectedApplication.verificationScore >= 80 && 'Highly Recommended'}
                                                    {selectedApplication.verificationScore >= 50 && selectedApplication.verificationScore < 80 && 'Requires Review'}
                                                    {selectedApplication.verificationScore < 50 && 'Not Recommended'}
                                                </p>
                                                <p className={`text-sm ${selectedApplication.verificationScore >= 80
                                                    ? 'text-green-700'
                                                    : selectedApplication.verificationScore >= 50
                                                        ? 'text-amber-700'
                                                        : 'text-red-700'
                                                    }`}>
                                                    {selectedApplication.verificationScore >= 80 && 'Strong candidate - Most verification checks passed successfully'}
                                                    {selectedApplication.verificationScore >= 50 && selectedApplication.verificationScore < 80 && 'Some verification checks failed - Careful review recommended'}
                                                    {selectedApplication.verificationScore < 50 && 'Multiple verification checks failed - High risk applicant'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Detailed Verification Results - Redesigned */}
                            {selectedApplication.verificationResults && (
                                <div className="space-y-4 mb-6">
                                    <h4 className="text-base font-bold text-gray-900 mb-4">Verification Breakdown</h4>

                                    {/* BVN Verification */}
                                    {selectedApplication.verificationResults.bvn && (
                                        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedApplication.verificationResults.bvn.verified
                                                        ? 'bg-green-100'
                                                        : 'bg-red-100'
                                                        }`}>
                                                        <span className={`text-2xl ${selectedApplication.verificationResults.bvn.verified
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                            }`}>
                                                            {selectedApplication.verificationResults.bvn.verified ? '✓' : '✕'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h5 className="font-semibold text-gray-900">BVN Verification</h5>
                                                        <p className="text-xs text-gray-500">Bank Verification Number</p>
                                                    </div>
                                                </div>
                                                <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${selectedApplication.verificationResults.bvn.verified
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {selectedApplication.verificationResults.bvn.verified ? '50' : '0'} pts
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 pl-15">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-0.5">Number</p>
                                                    <p className="text-sm font-medium text-gray-900">{selectedApplication.bvn}</p>
                                                </div>
                                                {selectedApplication.verificationResults.bvn.confidence && (
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-0.5">Confidence</p>
                                                        <p className="text-sm font-medium text-gray-900">{selectedApplication.verificationResults.bvn.confidence}%</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* NIN Verification */}
                                    {selectedApplication.verificationResults.nin && (
                                        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedApplication.verificationResults.nin.verified
                                                        ? 'bg-green-100'
                                                        : 'bg-red-100'
                                                        }`}>
                                                        <span className={`text-2xl ${selectedApplication.verificationResults.nin.verified
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                            }`}>
                                                            {selectedApplication.verificationResults.nin.verified ? '✓' : '✕'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h5 className="font-semibold text-gray-900">NIN Verification</h5>
                                                        <p className="text-xs text-gray-500">National Identity Number</p>
                                                    </div>
                                                </div>
                                                <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${selectedApplication.verificationResults.nin.verified
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {selectedApplication.verificationResults.nin.verified ? '30' : '0'} pts
                                                </div>
                                            </div>
                                            <div className="pl-15 space-y-2">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-0.5">Extracted Number</p>
                                                    <p className="text-sm font-medium text-gray-900">{selectedApplication.verificationResults.nin.extractedNumber || selectedApplication.nin}</p>
                                                </div>
                                                {selectedApplication.ninCardImage && (
                                                    <a
                                                        href={selectedApplication.ninCardImage}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        View NIN Card
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Face Match */}
                                    {selectedApplication.verificationResults.faceMatch && (
                                        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedApplication.verificationResults.faceMatch.matched
                                                        ? 'bg-green-100'
                                                        : 'bg-red-100'
                                                        }`}>
                                                        <span className={`text-2xl ${selectedApplication.verificationResults.faceMatch.matched
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                            }`}>
                                                            {selectedApplication.verificationResults.faceMatch.matched ? '✓' : '✕'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h5 className="font-semibold text-gray-900">Face Matching</h5>
                                                        <p className="text-xs text-gray-500">Biometric Verification</p>
                                                    </div>
                                                </div>
                                                <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${selectedApplication.verificationResults.faceMatch.matched
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {selectedApplication.verificationResults.faceMatch.matched ? '20' : '0'} pts
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 pl-15">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-0.5">Status</p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {selectedApplication.verificationResults.faceMatch.matched ? 'Matched' : 'Not Matched'}
                                                    </p>
                                                </div>
                                                {selectedApplication.verificationResults.faceMatch.confidence && (
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-0.5">Confidence</p>
                                                        <p className="text-sm font-medium text-gray-900">{selectedApplication.verificationResults.faceMatch.confidence}%</p>
                                                    </div>
                                                )}
                                            </div>
                                            {selectedApplication.passportPhoto && (
                                                <div className="pl-15 mt-2">
                                                    <a
                                                        href={selectedApplication.passportPhoto}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        View Passport Photo
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Applicant Info */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <h4 className="font-semibold text-gray-900 mb-2">📋 Applicant Information</h4>
                                <p className="font-medium text-gray-900">
                                    {selectedApplication.firstName} {selectedApplication.lastName}
                                </p>
                                <p className="text-sm text-gray-600">{selectedApplication.email}</p>
                                <div className="mt-2 text-sm space-y-1">
                                    <p className="text-gray-600">Phone: {selectedApplication.phoneNumber}</p>
                                    <p className="text-gray-600">Gender: <span className="capitalize">{selectedApplication.gender}</span></p>
                                    {selectedApplication.ippis && <p className="text-gray-600 font-medium">IPPIS: {selectedApplication.ippis}</p>}
                                    <p className="text-gray-600">BVN: {selectedApplication.bvn}</p>
                                    <p className="text-gray-600">NIN: {selectedApplication.nin || 'Pending'}</p>
                                </div>
                            </div>

                            {reviewAction === 'approve' ? (
                                <div>
                                    <label htmlFor="creditLimit" className="block text-sm font-medium text-gray-700 mb-1">
                                        Credit Limit (NGN)
                                    </label>
                                    <input
                                        type="number"
                                        id="creditLimit"
                                        value={creditLimit}
                                        onChange={(e) => setCreditLimit(e.target.value)}
                                        placeholder="e.g., 250000"
                                        min="50000"
                                        max="500000"
                                        step="10000"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/20 focus:border-[#1D7B3C]"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Min: ₦50,000 | Max: ₦500,000
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-1">
                                        Rejection Reason
                                    </label>
                                    <textarea
                                        id="rejectionReason"
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Explain why the application was rejected..."
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/20 focus:border-[#1D7B3C] resize-none"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="p-5 border-t border-gray-200 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowReviewModal(false);
                                    setSelectedApplication(null);
                                }}
                                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReview}
                                disabled={isReviewing || (reviewAction === 'approve' && !creditLimit)}
                                className={`flex-1 py-3 px-4 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${reviewAction === 'approve'
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                                    }`}
                            >
                                {isReviewing ? 'Processing...' : reviewAction === 'approve' ? 'Approve' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal (View Only) */}
            {selectedApplication && !showReviewModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Application Details</h3>
                            <button
                                onClick={() => setSelectedApplication(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-5 max-h-[70vh] overflow-y-auto">
                            {/* Verification Summary */}
                            {selectedApplication.verificationScore !== undefined && (
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-gray-900">📊 Verification Summary</h4>
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${selectedApplication.verificationScore >= 80
                                            ? 'bg-green-100 text-green-800'
                                            : selectedApplication.verificationScore >= 50
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {selectedApplication.verificationScore}/100
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        {selectedApplication.verificationScore >= 80 && '🟢 Highly Recommended - Strong candidate'}
                                        {selectedApplication.verificationScore >= 50 && selectedApplication.verificationScore < 80 && '🟡 Review Carefully - Some checks failed'}
                                        {selectedApplication.verificationScore < 50 && '🔴 Not Recommended - Multiple checks failed'}
                                    </p>
                                </div>
                            )}

                            {/* Verification Details */}
                            {selectedApplication.verificationResults ? (
                                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
                                    <h4 className="font-semibold text-gray-900 mb-3">✅ Verification Details</h4>


                                    {selectedApplication.verificationResults.bvn && (
                                        <div className="bg-white rounded-lg p-3 border">
                                            <p className="font-medium text-gray-900 mb-1">
                                                BVN Verification {selectedApplication.verificationResults.bvn.verified ? '✅ 50 pts' : '❌ 0 pts'}
                                            </p>
                                            <p className="text-sm text-gray-600">BVN: {selectedApplication.bvn}</p>
                                            {selectedApplication.verificationResults.bvn.confidence && (
                                                <p className="text-sm text-gray-600">Confidence: {selectedApplication.verificationResults.bvn.confidence}%</p>
                                            )}
                                        </div>
                                    )}

                                    {/* NIN */}
                                    {selectedApplication.verificationResults.nin && (
                                        <div className="bg-white rounded-lg p-3 border">
                                            <p className="font-medium text-gray-900 mb-1">
                                                NIN Verification {selectedApplication.verificationResults.nin.verified ? '✅ 30 pts' : '❌ 0 pts'}
                                            </p>
                                            <p className="text-sm text-gray-600">NIN: {selectedApplication.verificationResults.nin.extractedNumber || selectedApplication.nin}</p>
                                            {selectedApplication.ninCardImage && (
                                                <a href={selectedApplication.ninCardImage} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                                    📸 View NIN Card
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    {/* Face Match */}
                                    {selectedApplication.verificationResults.faceMatch && (
                                        <div className="bg-white rounded-lg p-3 border">
                                            <p className="font-medium text-gray-900 mb-1">
                                                Face Matching {selectedApplication.verificationResults.faceMatch.matched ? '✅ 20 pts' : '❌ 0 pts'}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Status: {selectedApplication.verificationResults.faceMatch.matched ? 'Matched' : 'Not Matched'}
                                            </p>
                                            {selectedApplication.verificationResults.faceMatch.confidence && (
                                                <p className="text-sm text-gray-600">Confidence: {selectedApplication.verificationResults.faceMatch.confidence}%</p>
                                            )}
                                            {selectedApplication.passportPhoto && (
                                                <a href={selectedApplication.passportPhoto} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                                    📸 View Passport Photo
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-yellow-800">⚠️ No verification results available yet</p>
                                </div>
                            )}

                            {/* Applicant Info */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">📋 Applicant Information</h4>
                                <p className="font-medium text-gray-900">{selectedApplication.firstName} {selectedApplication.lastName}</p>
                                <p className="text-sm text-gray-600">{selectedApplication.email}</p>
                                <div className="mt-2 text-sm space-y-1">
                                    <p className="text-gray-600">Phone: {selectedApplication.phoneNumber}</p>
                                    <p className="text-gray-600">Gender: <span className="capitalize">{selectedApplication.gender}</span></p>
                                    {selectedApplication.ippis && <p className="text-gray-600">IPPIS: {selectedApplication.ippis}</p>}
                                    <p className="text-gray-600">BVN: {selectedApplication.bvn}</p>
                                    <p className="text-gray-600">NIN: {selectedApplication.nin || 'Pending'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t">
                            <button
                                onClick={() => setSelectedApplication(null)}
                                className="w-full py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
                    <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border ${toast.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                        {toast.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                        <p className="font-medium">{toast.message}</p>
                        <button
                            type="button"
                            onClick={() => setToast(null)}
                            className="ml-2 p-1 hover:bg-white/50 rounded-lg transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayLaterApplications;
