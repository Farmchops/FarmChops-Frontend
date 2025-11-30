// src/pages/PayLater/index.tsx
import { useGetPayLaterStatusQuery } from '@/redux/api/paylaterApi';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import PayLaterApplication from './PayLaterApplication';
import PayLaterStatus from './PayLaterStatus';
import PayLaterShop from './PayLaterShop';

const PayLaterPage = () => {
    const { data, isLoading, error } = useGetPayLaterStatusQuery();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // If API error (backend not ready), show application form
    // This allows UI preview while backend is being developed
    if (error) {
        return <PayLaterApplication />;
    }

    const status = data?.data;

    // No application yet - show application form
    if (!status?.hasApplication) {
        return <PayLaterApplication />;
    }

    // Pending or rejected - show status page
    if (status.status === 'pending' || status.status === 'rejected') {
        return <PayLaterStatus status={status} />;
    }

    // Approved - check if they have active loan
    if (status.status === 'approved' && status.account) {
        if (status.account.hasActiveLoan) {
            // Has active loan - show status with loan details
            return <PayLaterStatus status={status} />;
        }
        // No active loan - can shop
        return <PayLaterShop />;
    }

    // Fallback
    return <PayLaterApplication />;
};

export default PayLaterPage;
