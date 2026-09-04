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
    FaCalendarAlt,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaAngleDoubleLeft,
    FaAngleDoubleRight
} from 'react-icons/fa';
import useAuthStore from '../../store/authStore';
import { canAccessModule } from '../../utils/permissions';
import logo from '../../assets/logo.png';

// Menu groups — dividers are rendered between groups automatically.
const menuGroups = [
    {
        items: [
            { title: 'Dashboard', icon: FaHome, path: '/dashboard' },
        ],
    },
    {
        items: [
            { title: 'Roles', icon: FaUserShield, path: '/roles' },
            { title: 'Permissions', icon: FaKey, path: '/permissions' },
            { title: 'Roles & Permissions', icon: FaLayerGroup, path: '/role-permissions' },
            { title: 'Manage Users', icon: FaUsers, path: '/users' },
        ],
    },
    {
        items: [
            { title: 'Categories', icon: FaShoppingCart, path: '/categories' },
            { title: 'Expenses', icon: FaMoneyBillWave, path: '/expenses' },
            { title: 'Payments', icon: FaWallet, path: '/payments' },
            { title: 'Billing Cycles', icon: FaCalendarAlt, path: '/billing-cycles' },
        ],
    },
];

// Collapsed preference: saved choice wins; otherwise default to icon-only on
// tablet/laptop widths (< xl) and expanded on larger desktop screens.
const getInitialCollapsed = () => {
    try {
        const stored = localStorage.getItem('sidebarCollapsed');
        if (stored === 'true' || stored === 'false') return stored === 'true';
    } catch {
        // localStorage unavailable — fall through
    }
    return typeof window !== 'undefined' && window.innerWidth < 1280;
};

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, fetchUser } = useAuthStore();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(getInitialCollapsed);
    const [isDesktopView, setIsDesktopView] = useState(
        () => typeof window !== 'undefined' && window.innerWidth >= 1024
    );

    useEffect(() => {
        if (!user) {
            fetchUser();
        }
    }, []);

    // Persist the collapse preference so it survives page reloads.
    useEffect(() => {
        try {
            localStorage.setItem('sidebarCollapsed', isCollapsed ? 'true' : 'false');
        } catch {
            // ignore storage errors
        }
    }, [isCollapsed]);

    // Track viewport so the mobile drawer always shows the full menu,
    // even when the desktop collapse preference is set. Also close the
    // mobile drawer when resizing up to desktop.
    useEffect(() => {
        const handleResize = () => {
            const desktop = window.innerWidth >= 1024;
            setIsDesktopView(desktop);
            if (desktop && isMobileOpen) {
                setIsMobileOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobileOpen]);

    const toggleCollapsed = () => setIsCollapsed((prev) => !prev);
    const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);
    const closeMobileSidebar = () => setIsMobileOpen(false);

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

    const getUserInitials = () => {
        if (!user?.name) return 'U';
        const names = user.name.split(' ');
        return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Icon-only compact mode only applies on desktop (lg+); the mobile drawer
    // always renders the full expanded menu.
    const isCompact = isCollapsed && isDesktopView;

    // Filter every group by module access and drop groups that become empty.
    const visibleGroups = menuGroups
        .map((group) => ({ ...group, items: group.items.filter((item) => canAccessModule(user, item.path)) }))
        .filter((group) => group.items.length > 0);

    if (!user) return null;

    return (
        <>
            {/* Mobile Toggle Button */}
            {!isMobileOpen && (
                <button
                    onClick={toggleMobileSidebar}
                    className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-lg shadow-lg border border-gray-200 text-[#0f1b3d] dark:text-[#e8edf9] hover:bg-gray-100 transition-colors"
                    aria-label="Open menu"
                >
                    <FaBars size={20} />
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
                    fixed lg:sticky top-0 lg:top-4 left-0 z-40
                    flex flex-col
                    w-72 ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
                    h-screen lg:h-[calc(100vh-2rem)] lg:mb-4 lg:ml-4
                    bg-[#e2e4e7] dark:bg-[#0f1b3d]
                    text-[#0f1b3d] dark:text-[#d3dcf2]
                    transition-[width,transform] duration-300 ease-in-out
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    rounded-r-3xl lg:rounded-3xl
                    lg:border lg:border-[#0f1b3d]/10 dark:lg:border-white/10
                    lg:shadow-[0_10px_40px_-12px_rgba(15,27,61,0.35)] dark:lg:shadow-[0_10px_40px_-12px_rgba(0,0,0,0.7)]
                `}
            >
                {/* Brand — circular logo + name, like a professional sidebar */}
                <div className="relative flex items-center justify-between px-4 pt-5 pb-4 shrink-0">
                    <div className={`flex items-center gap-3 ${isCompact ? 'justify-center mx-auto' : ''}`}>
                        <div className="w-11 h-11 shrink-0 rounded-full bg-[#ffffff] border border-[#0f1b3d]/10 dark:border-white/15 shadow-md shadow-[#0f1b3d]/15 dark:shadow-black/30 flex items-center justify-center overflow-hidden">
                            <img
                                src={logo}
                                alt="Expense Tracker"
                                className="w-[80%] h-[80%] object-contain"
                            />
                        </div>
                        {!isCompact && (
                            <div className="min-w-0">
                                <h1 className="text-base font-bold text-[#0f1b3d] dark:text-white leading-tight whitespace-nowrap">
                                    Expense Tracker
                                </h1>
                                <p className="text-[11px] text-[#3d4a73] dark:text-[#8393c4] truncate">
                                    Smart admin workspace
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Close (mobile only) */}
                    <button
                        onClick={closeMobileSidebar}
                        className="lg:hidden text-[#3d4a73] dark:text-[#9fb0d9] hover:text-[#0f1b3d] dark:hover:text-white hover:bg-[#0f1b3d]/10 dark:hover:bg-white/10 p-2 rounded-lg transition-colors"
                        aria-label="Close menu"
                    >
                        <FaTimes size={20} />
                    </button>

                    {/* Collapse / Expand toggle — top-right of the sidebar (desktop only) */}
                    <button
                        onClick={toggleCollapsed}
                        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        aria-expanded={!isCollapsed}
                        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        className="
                            hidden lg:flex absolute top-[26px] -right-4
                            items-center justify-center w-8 h-8 rounded-full
                            bg-[#e2e4e7] dark:bg-[#0f1b3d]
                            border border-[#0f1b3d]/15 dark:border-white/20
                            text-[#0f1b3d] dark:text-[#9fb0d9]
                            shadow-[0_2px_8px_rgba(15,27,61,0.25)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.6)]
                            hover:bg-[#d9dce3] dark:hover:bg-[#16244d]
                            hover:text-[#0f1b3d] dark:hover:text-white
                            transition-all duration-200 active:scale-95
                        "
                    >
                        {isCollapsed ? <FaAngleDoubleRight size={14} /> : <FaAngleDoubleLeft size={14} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className={`flex-1 min-h-0 overflow-y-auto py-4 ${isCompact ? 'px-2' : 'px-3'}`}>
                    {visibleGroups.map((group, groupIndex) => (
                        <div key={groupIndex}>
                            {groupIndex > 0 && (
                                <div className="mx-3 my-2 h-px bg-[#0f1b3d]/10 dark:bg-white/10" />
                            )}
                            <ul className="space-y-1">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path ||
                                        location.pathname.startsWith(item.path + '/');

                                    return (
                                        <li key={item.path}>
                                            <Link
                                                to={item.path}
                                                onClick={closeMobileSidebar}
                                                title={isCompact ? item.title : undefined}
                                                className={`
                                                    flex items-center rounded-2xl transition-all duration-200
                                                    ${isCompact
                                                        ? 'justify-center w-11 h-11 mx-auto'
                                                        : 'gap-3 px-4 py-2.5'}
                                                    ${isActive
                                                        ? 'bg-[#0f1b3d]/10 text-[#0f1b3d] dark:bg-white/10 dark:text-white'
                                                        : 'text-[#3d4a73] dark:text-[#aebfea] hover:bg-[#0f1b3d]/5 dark:hover:bg-white/5 hover:text-[#0f1b3d] dark:hover:text-white'}
                                                `}
                                            >
                                                <Icon
                                                    size={18}
                                                    className={`shrink-0 ${isActive
                                                        ? 'text-[#0f1b3d] dark:text-[#8fb0ff]'
                                                        : 'text-[#3d4a73] dark:text-[#9fb0d9]'}`}
                                                />
                                                {!isCompact && (
                                                    <>
                                                        <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                                                            {item.title}
                                                        </span>
                                                        {isActive && (
                                                            <span className="ml-auto w-1.5 h-1.5 bg-[#0f1b3d] dark:bg-[#8fb0ff] rounded-full" />
                                                        )}
                                                    </>
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* User Profile */}
                <div className="shrink-0 p-4 border-t border-[#0f1b3d]/10 dark:border-white/10">
                    {isCompact ? (
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className="w-10 h-10 bg-[#0f1b3d] dark:bg-[#1e2f5c] rounded-full flex items-center justify-center text-white dark:text-[#e8edf9] font-bold text-sm shadow-lg shadow-[#0f1b3d]/25 dark:shadow-black/40"
                                title={user?.name || 'User'}
                            >
                                {getUserInitials()}
                            </div>
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="p-2 text-[#3d4a73] dark:text-[#9fb0d9] hover:text-[#0f1b3d] dark:hover:text-white hover:bg-[#0f1b3d]/10 dark:hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
                                title="Logout"
                                aria-label="Logout"
                            >
                                <FaSignOutAlt size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#0f1b3d]/5 dark:bg-white/5 border border-[#0f1b3d]/10 dark:border-white/10">
                            <div className="w-11 h-11 bg-[#0f1b3d] dark:bg-[#1e2f5c] rounded-full flex items-center justify-center text-white dark:text-[#e8edf9] font-bold text-sm shadow-lg shadow-[#0f1b3d]/25 dark:shadow-black/40">
                                {getUserInitials()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-[#0f1b3d] dark:text-white truncate">
                                    {user?.name || 'User'}
                                </p>
                                <p className="text-xs text-[#3d4a73] dark:text-[#9fb0d9] truncate">
                                    {[...new Set((user?.roles || []).map(r => r.name).filter(Boolean))].join(', ') || 'User'}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="p-2 text-[#3d4a73] dark:text-[#9fb0d9] hover:text-[#0f1b3d] dark:hover:text-white hover:bg-[#0f1b3d]/10 dark:hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
                                title="Logout"
                                aria-label="Logout"
                            >
                                <FaSignOutAlt size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;