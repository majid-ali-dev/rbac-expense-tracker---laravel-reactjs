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

    useEffect(() => {
        if (!user) {
            fetchUser();
        }
    }, []);

    // Close sidebar on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024 && isMobileOpen) {
                setIsMobileOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobileOpen]);

    const menuItems = [
        { title: 'Dashboard', icon: FaHome, path: '/dashboard', permission: null },
        { title: 'Roles', icon: FaUserShield, path: '/roles', permission: 'assign-roles' },
        { title: 'Permissions', icon: FaKey, path: '/permissions', permission: 'assign-roles' },
        { title: 'Roles & Permissions', icon: FaLayerGroup, path: '/role-permissions', permission: 'assign-roles' },
        { title: 'Manage Users', icon: FaUsers, path: '/users', permission: 'manage-users' },
        { title: 'Categories', icon: FaShoppingCart, path: '/categories', permission: 'manage-categories' },
        { title: 'Expenses', icon: FaMoneyBillWave, path: '/expenses', permission: 'view-expense' },
        { title: 'Payments', icon: FaWallet, path: '/payments', permission: 'view-payment' },
    ];

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

    const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);
    const closeMobileSidebar = () => setIsMobileOpen(false);

    const getUserInitials = () => {
        if (!user?.name) return 'U';
        const names = user.name.split(' ');
        return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (!user) return null;

    return (
        <>
            {/* Mobile Toggle Button */}
            {!isMobileOpen && (
                <button
                    onClick={toggleMobileSidebar}
                    className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    aria-label="Open menu"
                >
                    <FaBars size={20} className="text-gray-700" />
                </button>
            )}

            {/* Backdrop */}
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
                    w-72 h-screen bg-[#0f172a] text-white
                    transition-transform duration-300 ease-in-out
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    shadow-2xl border-r border-gray-700
                `}
            >
                {/* Brand */}
                <div className="flex items-center justify-between p-5 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                            <FaWallet className="text-white" size={22} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Expense Tracker</h1>
                            <p className="text-xs text-gray-400">Smart admin workspace</p>
                        </div>
                    </div>
                    <button
                        onClick={closeMobileSidebar}
                        className="lg:hidden text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="px-3 py-4 overflow-y-auto h-[calc(100vh-200px)]">
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
                                            flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all
                                            ${isActive
                                                ? 'bg-blue-600/20 text-white border-l-4 border-blue-600 translate-x-1'
                                                : 'text-gray-300 hover:bg-white/5 hover:text-white hover:translate-x-1'
                                            }
                                        `}
                                    >
                                        <Icon size={18} />
                                        <span className="text-sm font-semibold">{item.title}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User Profile */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-[#0f172a]">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-gray-700">
                        <div className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-600/30">
                            {getUserInitials()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">
                                {user?.name || 'User'}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                                {user?.roles?.map(r => r.name).join(', ') || 'User'}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
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