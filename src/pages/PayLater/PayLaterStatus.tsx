// src/pages/PayLater/PayLaterStatus.tsx
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, AlertTriangle, CreditCard, Calendar, ArrowRight } from 'lucide-react';
import type { PayLaterStatusResponse } from '@/redux/api/paylaterApi';

interface PayLaterStatusProps {
    status: PayLaterStatusResponse['data'];
}

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
        month: 'long',
        day: 'numeric',
    });
};

const PayLaterStatus = ({ status }: PayLaterStatusProps) => {
    // Pending Application
    if (status.status === 'pending') {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-lg mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8 text-amber-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Under Review</h2>
                        <p className="text-gray-600 mb-6">
                            Your PayLater application is being reviewed by our team. We'll verify your details and send you an email once your application is processed.
                        </p>

                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Submitted</span>
                                <span className="font-medium text-gray-900">
                                    {status.application?.submittedAt ? formatDate(status.application.submittedAt) : 'Recently'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-2">
                                <span className="text-gray-600">Estimated Review Time</span>
                                <span className="font-medium text-gray-900">1-3 business days</span>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left">
                            <p className="text-sm text-blue-800">
                                <strong>What happens next?</strong><br />
                                Our team will verify your BVN and NIN details. Once approved, you'll receive an email notification with your credit limit and can start shopping with PayLater.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Rejected Application
    if (status.status === 'rejected') {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-lg mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Not Approved</h2>
                        <p className="text-gray-600 mb-6">
                            Unfortunately, we couldn't approve your PayLater application at this time. This could be due to verification issues with the provided details.
                        </p>

                        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                            <p className="text-sm text-gray-700">
                                If you believe this is an error or would like to reapply with updated information, please contact our support team.
                            </p>
                        </div>

                        <Link
                            to="/contact"
                            className="inline-flex items-center gap-2 bg-[#1D7B3C] text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Approved with Active Loan
    if (status.status === 'approved' && status.account?.hasActiveLoan && status.account.activeLoan) {
        const loan = status.account.activeLoan;
        const dueDate = new Date(loan.dueDate);
        const isOverdue = loan.repaymentStatus === 'overdue' || dueDate < new Date();
        const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-lg mx-auto">
                    {/* Active Loan Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                        <div className={`px-6 py-4 ${isOverdue ? 'bg-red-600' : 'bg-[#1D7B3C]'}`}>
                            <div className="flex items-center justify-between">
                                <div className="text-white">
                                    <p className="text-sm opacity-90">Active Loan</p>
                                    <p className="text-2xl font-bold">{formatCurrency(loan.amount)}</p>
                                </div>
                                {isOverdue ? (
                                    <AlertTriangle className="w-10 h-10 text-white/80" />
                                ) : (
                                    <CreditCard className="w-10 h-10 text-white/80" />
                                )}
                            </div>
                        </div>

                        <div className="p-6">
                            {isOverdue ? (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-red-800">Payment Overdue</p>
                                            <p className="text-sm text-red-700">
                                                Your payment was due on {formatDate(loan.dueDate)}. Please contact support to resolve this.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-amber-600" />
                                        <div>
                                            <p className="font-medium text-amber-800">
                                                {daysUntilDue > 0 ? `${daysUntilDue} days until due` : 'Due today'}
                                            </p>
                                            <p className="text-sm text-amber-700">Due date: {formatDate(loan.dueDate)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Status</span>
                                    <span className={`font-medium ${
                                        loan.repaymentStatus === 'paid' ? 'text-green-600' :
                                        loan.repaymentStatus === 'overdue' ? 'text-red-600' : 'text-amber-600'
                                    }`}>
                                        {loan.repaymentStatus.charAt(0).toUpperCase() + loan.repaymentStatus.slice(1)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Credit Limit</span>
                                    <span className="font-medium text-gray-900">{formatCurrency(status.account.creditLimit)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Available Credit</span>
                                    <span className="font-medium text-gray-900">{formatCurrency(status.account.availableCredit)}</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-600 text-center">
                                    Repay your current loan to make another PayLater purchase. Payment will be automatically deducted via IPPIS.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order History Link */}
                    <Link
                        to="/paylater/orders"
                        className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-[#1D7B3C] transition"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">PayLater Order History</p>
                                <p className="text-sm text-gray-600">View all your PayLater purchases</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400" />
                        </div>
                    </Link>
                </div>
            </div>
        );
    }

    // Approved with No Active Loan (ready to shop) - should redirect to shop
    if (status.status === 'approved' && status.account && !status.account.hasActiveLoan) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-lg mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-[#1D7B3C] px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="text-white">
                                    <p className="text-sm opacity-90">Available Credit</p>
                                    <p className="text-2xl font-bold">{formatCurrency(status.account.availableCredit)}</p>
                                </div>
                                <CheckCircle className="w-10 h-10 text-white/80" />
                            </div>
                        </div>

                        <div className="p-6 text-center">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to Shop!</h2>
                            <p className="text-gray-600 mb-6">
                                Your PayLater account is active. Browse products and checkout without paying upfront.
                            </p>

                            <Link
                                to="/paylater/shop"
                                className="inline-flex items-center gap-2 bg-[#1D7B3C] text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
                            >
                                Start Shopping
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback
    return null;
};

export default PayLaterStatus;
