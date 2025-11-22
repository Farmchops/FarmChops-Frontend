import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetGroupByShareableCodeQuery } from '@/redux/api/groupOrdersApi';

const GroupOrderSuccess: React.FC = () => {
    const navigate = useNavigate();
    const { groupId: shareableCode } = useParams<{ groupId: string }>();
    const { data, error, isLoading, isError } = useGetGroupByShareableCodeQuery(shareableCode || '', { skip: !shareableCode });

    // Get the group ID from the response - check both groupId and _id
    const group = data?.group;
    const resolvedGroupId = group?.groupId || group?._id;

    useEffect(() => {
        if (resolvedGroupId) {
            // Redirect to the canonical group detail page where users can join
            navigate(`/group/${resolvedGroupId}`, { replace: true });
        }
    }, [resolvedGroupId, navigate]);

    // While resolving the shareable code, show a brief loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1D7B3C] mx-auto mb-4"></div>
                    <p className="text-gray-600">Resolving shared group...</p>
                </div>
            </div>
        );
    }

    // Show error state if API call failed or group not found
    if (isError || error || !group || (!group.groupId && !group._id)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <div className="mb-6">
                        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="text-red-600" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Group Not Found</h2>
                    <p className="text-gray-600 mb-4">This shared group link is invalid or has expired.</p>
                    <div className="space-y-3">
                        <button type="button" onClick={() => navigate('/group-sharing')} className="w-full px-6 py-3 bg-[#1D7B3C] text-white rounded-lg hover:bg-[#166331] transition">Browse Groups</button>
                        <button type="button" onClick={() => navigate('/')} className="w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Go Home</button>
                    </div>
                </div>
            </div>
        );
    }

    // If data exists and we have a valid groupId, we'll redirect via useEffect
    // Show loading while waiting for redirect
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1D7B3C] mx-auto mb-4"></div>
                <p className="text-gray-600">Redirecting to group...</p>
            </div>
        </div>
    );
};

export default GroupOrderSuccess;
