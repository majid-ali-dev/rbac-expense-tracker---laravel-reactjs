import React, { useState, useEffect } from 'react';
import { FaTimes, FaArrowLeft, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';

const RolePermissionForm = ({ role, allPermissions, onSubmit, onCancel, loading }) => {
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (role && role.permissions) {
            setSelectedPermissions(role.permissions.map(p => p.id));
        } else {
            setSelectedPermissions([]);
        }
    }, [role]);

    const handleTogglePermission = (permissionId) => {
        setSelectedPermissions(prev => {
            if (prev.includes(permissionId)) {
                return prev.filter(id => id !== permissionId);
            } else {
                return [...prev, permissionId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedPermissions.length === allPermissions.length) {
            setSelectedPermissions([]);
        } else {
            setSelectedPermissions(allPermissions.map(p => p.id));
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(selectedPermissions);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!role) {
        return null;
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-2xl">
                        <FaShieldAlt className="text-blue-600" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold text-gray-900">
                            Assign Permissions to "{role.name}"
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Select permissions to assign to this role
                        </p>
                    </div>
                </div>
                <button
                    onClick={onCancel}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                    <FaTimes size={20} />
                </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                        {selectedPermissions.length} of {allPermissions.length} permissions selected
                    </span>
                    <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        {selectedPermissions.length === allPermissions.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>

                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-center align-middle">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-200">
                                <th className="py-3.5 px-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Id</th>
                                <th className="py-3.5 px-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Permission Name</th>
                                <th className="py-3.5 px-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Select</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allPermissions.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="py-8 text-center text-gray-500">
                                        No permissions available
                                    </td>
                                </tr>
                            ) : (
                                allPermissions.map((permission, index) => (
                                    <tr key={permission.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3.5 px-4 text-sm text-gray-700 font-medium">
                                            {index + 1}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                                                {permission.name}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedPermissions.includes(permission.id)}
                                                onChange={() => handleTogglePermission(permission.id)}
                                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={loading || isSubmitting}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaCheckCircle size={16} />
                        {loading || isSubmitting ? 'Saving...' : 'Save Permissions'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-2xl hover:bg-gray-50 transition-all"
                    >
                        <FaArrowLeft size={14} />
                        Back
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RolePermissionForm;