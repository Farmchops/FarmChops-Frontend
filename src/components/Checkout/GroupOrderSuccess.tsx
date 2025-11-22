import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useGetGroupByShareableCodeQuery } from '@/redux/api/groupOrdersApi';

const GroupOrderSuccess: React.FC = () => {
    const navigate = useNavigate();
    const { groupId } = useParams<{ groupId: string }>();
    const { data, error, isLoading } = useGetGroupByShareableCodeQuery(groupId || '', { skip: !groupId });

    useEffect(() => {
        if (data?.group?.groupId) {
            // Redirect to the canonical group detail page where users can join
            navigate(`/group/${data.group.groupId}`);
        }
    }, [data, navigate]);

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

    if (error || !data?.group) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <div className="mb-6">
                        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="text-red-600" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 12.34a2 2 0 0 0 0 2.83l6.36 6.36a2 2 0 0 0 2.83 0l8.48-8.48a2 2 0 0 0 0-2.83L13.12 3.86a2 2 0 0 0-2.83 0z"></path></svg>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Group Not Found</h2>
                    <p className="text-gray-600 mb-4">This shared group link is invalid or has expired.</p>
                    <div className="space-y-3">
                        <button onClick={() => navigate('/group-sharing')} className="w-full px-6 py-3 bg-[#1D7B3C] text-white rounded-lg">Browse Groups</button>
                        <button onClick={() => navigate('/')} className="w-full px-6 py-3 border rounded-lg">Home</button>
                    </div>
                </div>
            </div>
        );
    }

    // If data exists we'll redirect; meanwhile render nothing
    return null;
};

export default GroupOrderSuccess;
