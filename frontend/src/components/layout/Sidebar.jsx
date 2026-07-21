import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FaHome,
    FaUsers,
    FaUserShield,
    FaKey,
    FaLayerGroup,
    FaShoppingCart,
    FaMoneyBillWave,
    FaWallet,
    FaSignOutAlt,
    FaBars,
    FaTimes
} from 'react-icons/fa';
import useAuthStore from '../../store/authStore';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, fetchUser } = useAuthStore();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Fetch user if not loaded
    useEffect(() => {
        if (!user) {
            fetchUser();
        }
    }, []);

    // Close sidebar when window resizes to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024 && isMobileOpen) {
                setIsMobileOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobileOpen]);

    // Sidebar configuration based on user permissions
    const menuItems = [
        {
            title: 'Dashboard',
            icon: FaHome,
            path: '/dashboard',
            permission: null,
        },
        {
            title: 'Roles',
            icon: FaUserShield,
            path: '/roles',
            permission: 'assign-roles',
        },
        {
            title: 'Permissions',
            icon: FaKey,
            path: '/permissions',
            permission: 'assign-roles',
        },
        {
            title: 'Roles & Permissions',
            icon: FaLayerGroup,
            path: '/role-permissions',
            permission: 'assign-roles',
        },
        {
            title: 'Manage Users',
            icon: FaUsers,
            path: '/users',
            permission: 'manage-users',
        },
        {
            title: 'Categories',
            icon: FaShoppingCart,
            path: '/categories',
            permission: 'manage-categories',
        },
        {
            title: 'Expenses',
            icon: FaMoneyBillWave,
            path: '/expenses',
            permission: 'view-expense',
        },
        {
            title: 'Payments',
            icon: FaWallet,
            path: '/payments',
            permission: 'view-payment',
        },
    ];

    // Filter menu items based on user permissions
    const filteredMenuItems = menuItems.filter(item => {
        if (item.permission === null) return true;
        const permissions = user?.permissions || [];
        return permissions.includes(item.permission) || permissions.includes('super_admin');
    });

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const toggleMobileSidebar = () => {
        setIsMobileOpen(!isMobileOpen);
    };

    const closeMobileSidebar = () => {
        setIsMobileOpen(false);
    };

    const getUserInitials = () => {
        if (!user?.name) return 'U';
        const names = user.name.split(' ');
        return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Don't render sidebar if user is not loaded
    if (!user) {
        return null;
    }

    return (
        <>
            {/* Mobile Toggle Button - Only show when sidebar is closed */}
            {!isMobileOpen && (
                <button
                    onClick={toggleMobileSidebar}
                    className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    aria-label="Open menu"
                >
                    <FaBars size={20} className="text-gray-700" />
                </button>
            )}

            {/* Backdrop for mobile */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
                    onClick={closeMobileSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:sticky top-0 left-0 z-40
                    w-64 h-screen bg-gray-900 text-white
                    transition-transform duration-300 ease-in-out
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    shadow-2xl
                `}
            >
                {/* Brand */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <FaWallet className="text-white" size={20} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Expense Tracker</h1>
                            <p className="text-xs text-gray-400">Smart admin workspace</p>
                        </div>
                    </div>
                    {/* Close button - Only show on mobile when sidebar is open */}
                    <button
                        onClick={closeMobileSidebar}
                        className="lg:hidden text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition-colors"
                        aria-label="Close menu"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="px-3 py-4 overflow-y-auto h-[calc(100vh-180px)]">
                    <ul className="space-y-1">
                        {filteredMenuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path ||
                                location.pathname.startsWith(item.path + '/');

                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        onClick={closeMobileSidebar}
                                        className={`
                                            flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                                            ${isActive
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                            }
                                        `}
                                    >
                                        <Icon size={18} />
                                        <span className="text-sm font-medium">{item.title}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User Profile */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-gray-900">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {getUserInitials()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user?.name || 'User'}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                                {user?.roles?.map(r => r.name).join(', ') || 'User'}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                            title="Logout"
                        >
                            <FaSignOutAlt size={18} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;