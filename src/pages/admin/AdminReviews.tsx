import { useState } from 'react';
import { Star, Trash2, MessageSquare } from 'lucide-react';
import { useGetReviewsQuery, useDeleteReviewMutation } from '@/redux/api/adminReviewsApi';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const STAR_FILTERS = [
    { label: 'All', value: undefined },
    { label: '5★', value: 5 },
    { label: '4★', value: 4 },
    { label: '3★', value: 3 },
    { label: '2★', value: 2 },
    { label: '1★', value: 1 },
];

const STATUS_FILTERS = [
    { label: 'All', value: undefined },
    { label: 'Submitted', value: true },
    { label: 'Pending', value: false },
];

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star
                    key={s}
                    size={14}
                    className={s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                />
            ))}
        </div>
    );
}

export default function AdminReviews() {
    const [page, setPage] = useState(1);
    const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);
    const [submittedFilter, setSubmittedFilter] = useState<boolean | undefined>(undefined);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    const { data, isLoading, error } = useGetReviewsQuery({
        page,
        rating: ratingFilter,
        submitted: submittedFilter,
    });

    const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

    const reviews = data?.data?.reviews ?? [];
    const total = data?.data?.total ?? 0;
    const pageSize = data?.data?.pageSize ?? 20;
    const totalPages = Math.ceil(total / pageSize);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteReview(deleteTarget).unwrap();
        } finally {
            setDeleteTarget(null);
        }
    };

    const handleFilterChange = (rating: number | undefined, submitted: boolean | undefined) => {
        setRatingFilter(rating);
        setSubmittedFilter(submitted);
        setPage(1);
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Reviews</h1>
                <p className="text-sm text-gray-600 mt-1">Customer feedback submitted after delivery</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4 flex flex-wrap gap-4">
                {/* Rating filter */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 font-medium">Rating:</span>
                    <div className="flex gap-1">
                        {STAR_FILTERS.map((f) => (
                            <button
                                key={String(f.value)}
                                onClick={() => handleFilterChange(f.value, submittedFilter)}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                                    ratingFilter === f.value
                                        ? 'bg-[#1D7B3C] text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 font-medium">Status:</span>
                    <div className="flex gap-1">
                        {STATUS_FILTERS.map((f) => (
                            <button
                                key={String(f.value)}
                                onClick={() => handleFilterChange(ratingFilter, f.value)}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                                    submittedFilter === f.value
                                        ? 'bg-[#1D7B3C] text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {total > 0 && (
                    <span className="ml-auto text-sm text-gray-500 self-center">
                        {total} review{total !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <LoadingSpinner />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12 px-6">
                        <p className="text-red-500 font-semibold mb-2">Failed to load reviews</p>
                        <p className="text-sm text-gray-600">An error occurred while fetching reviews.</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500">No reviews found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3" />
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reviews.map((review) => (
                                    <tr key={review._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-900">
                                                {review.buyerId.firstName} {review.buyerId.lastName}
                                            </p>
                                            <p className="text-xs text-gray-500">{review.buyerId.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-900">{review.orderId.orderNumber}</p>
                                            <p className="text-xs text-gray-500">₦{review.orderId.totalAmount.toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StarRating rating={review.rating} />
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <p className="text-sm text-gray-700 truncate">
                                                {review.comment || <span className="text-gray-400 italic">No comment</span>}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm text-gray-600">
                                                {review.submittedAt
                                                    ? new Date(review.submittedAt).toLocaleDateString('en-GB', {
                                                          day: '2-digit',
                                                          month: 'short',
                                                          year: 'numeric',
                                                      })
                                                    : '—'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                review.isSubmitted
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {review.isSubmitted ? 'Submitted' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setDeleteTarget(review._id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                                title="Delete review"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-600">
                        Page {page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Review</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete this review? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
