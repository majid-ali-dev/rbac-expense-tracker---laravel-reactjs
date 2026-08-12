import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useUserProfileStore from '../../store/userProfileStore';
import useCycleStore from '../../store/cycleStore';
import UserProfileView from '../../components/users/UserProfileView';

const UserProfile = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user, paymentHistory, cycle, loading, fetchUserProfile, clearProfile } = useUserProfileStore();
    const cycleId = useCycleStore((s) => s.getSelectedId('users'));

    // Child page: inherits the cycle selected on the Manage Users index.
    useEffect(() => {
        useCycleStore.getState().fetchCycles();
    }, []);

    useEffect(() => {
        if (id) {
            fetchUserProfile(id, cycleId);
        }
        return () => clearProfile();
    }, [id, cycleId]);

    const handleBack = () => {
        navigate('/users');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading user profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <p className="text-gray-500 text-lg">User not found</p>
                    <button
                        onClick={handleBack}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <UserProfileView
            user={user}
            paymentHistory={paymentHistory}
            cycle={cycle}
            onBack={handleBack}
        />
    );
};

export default UserProfile;