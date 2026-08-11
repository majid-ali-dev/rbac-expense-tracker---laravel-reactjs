import React, { useMemo } from 'react';
import { FaTimes, FaEye, FaCheck, FaShieldAlt } from 'react-icons/fa';

// Human-readable label for permission module prefixes (e.g. "users.create" -> "Users")
const moduleLabel = (key) => {
    const map = {
        dashboard: 'Dashboard',
        users: 'Users',
        roles: 'Roles',
        permissions: 'Permissions',
        'role-permissions': 'Role Permissions',
        categories: 'Categories',
        expenses: 'Expenses',
        payments: 'Payments',
        notifications: 'Notifications',
        'billing-cycle': 'Billing Cycle',
    };
    if (map[key]) return map[key];
    return key.charAt(0).toUpperCase() + key.slice(1);
};

const RolePermissionViewModal = ({ role, allPermissions = [], loading, error, onClose }) => {
    // Role's assigned permission ids
    const assignedIds = useMemo(
        () => new Set((role?.permissions || []).map((p) => p.id)),
        [role]
    );

    // Group all permissions by module prefix so the view is scannable
    const grouped = useMemo(() => {
        const groups = {};
        allPermissions.forEach((p) => {
            const moduleKey = p.name.includes('.') ? p.name.split('.')[0] : 'general';
            if (!groups[moduleKey]) groups[moduleKey] = [];
            groups[moduleKey].push(p);
        });
        return Object.entries(groups);
    }, [allPermissions]);

    if (!role) return null;

    const assignedCount = assignedIds.size;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-2xl">
                            <FaEye className="text-blue-600" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900">Role Permissions</h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                <span className="font-bold text-blue-600">{role.name}</span> — {assignedCount} of{' '}
                                {allPermissions.length} permissions assigned
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                        title="Close"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-sm font-medium">Loading permissions...</p>
                    </div>
                )}

                {/* Error state */}
                {!loading && error && (
                    <div className="py-16 px-6 text-center">
                        <p className="text-gray-600 font-medium">{error}</p>
                    </div>
                )}

                {/* Permissions list */}
                {!loading && !error && (
                    <div className="flex-1 overflow-auto px-5 py-4">
                        {grouped.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-lg font-medium">No permissions available</p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {grouped.map(([moduleKey, perms]) => {
                                    const moduleAssigned = perms.filter((p) => assignedIds.has(p.id)).length;
                                    const allAssigned = moduleAssigned === perms.length;
                                    return (
                                        <div key={moduleKey}>
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                                    <FaShieldAlt size={12} className="text-blue-500" />
                                                    {moduleLabel(moduleKey)}
                                                </h3>
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                        allAssigned
                                                            ? 'bg-green-100 text-green-700'
                                                            : moduleAssigned > 0
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-gray-100 text-gray-500'
                                                    }`}
                                                >
                                                    {moduleAssigned}/{perms.length}
                                                </span>
                                            </div>
                                            <div className="border border-gray-200 rounded-2xl overflow-hidden">
                                                <table className="w-full">
                                                    <tbody>
                                                        {perms.map((permission, index) => {
                                                            const assigned = assignedIds.has(permission.id);
                                                            return (
                                                                <tr
                                                                    key={permission.id}
                                                                    className={`border-b border-gray-100 last:border-0 transition-colors ${
                                                                        assigned ? 'bg-green-50/40 hover:bg-green-50/70' : 'hover:bg-gray-50/50'
                                                                    }`}
                                                                >
                                                                    <td className="py-2.5 pl-4 pr-2 text-xs font-medium text-gray-400 w-10">
                                                                        {index + 1}
                                                                    </td>
                                                                    <td className="py-2.5 px-2">
                                                                        <span
                                                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                                                                assigned
                                                                                    ? 'bg-green-100 text-green-700'
                                                                                    : 'bg-gray-100 text-gray-500'
                                                                            }`}
                                                                        >
                                                                            {permission.name}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-2.5 pl-2 pr-4 text-right">
                                                                        {assigned ? (
                                                                            <span
                                                                                className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-green-500 text-white shadow-sm"
                                                                                title="Assigned"
                                                                            >
                                                                                <FaCheck size={12} />
                                                                            </span>
                                                                        ) : (
                                                                            <span
                                                                                className="inline-flex items-center justify-center w-6 h-6 rounded-md border-2 border-gray-200 bg-gray-50"
                                                                                title="Not assigned"
                                                                            />
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="px-5 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1.5">
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-green-500 text-white">
                                <FaCheck size={9} />
                            </span>
                            Assigned
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded border-2 border-gray-200 bg-gray-50"></span>
                            Not assigned
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RolePermissionViewModal;
