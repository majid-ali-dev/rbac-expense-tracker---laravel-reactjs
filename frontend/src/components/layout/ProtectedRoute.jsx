import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Sidebar from './Sidebar';

const ProtectedRoute = () => {
    const { isAuthenticated, fetchUser, user, token } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // If we have token but no user, fetch user
                if (token && !user) {
                    console.log('Fetching user with token:', token.slice(0, 20) + '...');
                    const result = await fetchUser();
                    if (!result.success) {
                        console.error('Failed to fetch user:', result.error);
                        setError(result.error);
                    } else {
                        console.log('User fetched successfully:', result.user);
                    }
                }
                setAuthChecked(true);
            } catch (err) {
                console.error('Auth check error:', err);
                setError(err.message);
                setAuthChecked(true);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [token, fetchUser, user]);

    // Show loading spinner
    if (loading || !authChecked) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
        console.log('Not authenticated or no user, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    // Debug: Log user data
    console.log('User data in ProtectedRoute:', {
        name: user?.name,
        roles: user?.roles?.map(r => r.name),
        permissions: user?.permissions,
        permissionsType: Array.isArray(user?.permissions) ? 'array' : typeof user?.permissions,
    });

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 lg:ml-0 p-4 lg:p-8 min-h-screen overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default ProtectedRoute;