import React, { useState, useEffect } from 'react';
import { FaTimes, FaArrowLeft, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';
import DataTable from '../common/DataTable';

const RolePermissionForm = ({ role, allPermissions, onSubmit, onCancel, loading }) => {
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [currentPageIds, setCurrentPageIds] = useState([]);
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

    const allOnPageSelected =
        currentPageIds.length > 0 && currentPageIds.every(id => selectedPermissions.includes(id));

    const handleSelectPage = () => {
        if (allOnPageSelected) {
            setSelectedPermissions(prev => prev.filter(id => !currentPageIds.includes(id)));
        } else {
            setSelectedPermissions(prev => [...new Set([...prev, ...currentPageIds])]);
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

    const columns = [
        {
            id: 'id',
            header: 'Id',
            accessorFn: (row) => row.id,
            cell: ({ row }) => (
                <span className="text-sm text-gray-700 font-medium">{row.index + 1}</span>
            ),
            enableSorting: true,
        },
        {
            id: 'name',
            header: 'Permission Name',
            accessorFn: (row) => row.name,
            cell: ({ getValue }) => (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                    {getValue()}
                </span>
            ),
            enableSorting: true,
        },
        {
            id: 'select',
            header: 'Select',
            cell: ({ row }) => {
                const permission = row.original;
                return (
                    <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => handleTogglePermission(permission.id)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                );
            },
            enableSorting: false,
        },
    ];

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
                        onClick={handleSelectPage}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        {allOnPageSelected ? 'Deselect Current Page' : 'Select Current Page'}
                    </button>
                </div>

                <DataTable
                    data={allPermissions}
                    columns={columns}
                    title="Permissions"
                    searchPlaceholder="Search permissions..."
                    itemsPerPage={10}
                    onCreate={null}
                    onPageRowsChange={setCurrentPageIds}
                />

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