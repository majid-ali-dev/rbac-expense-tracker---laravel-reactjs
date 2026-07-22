import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import usePermissionStore from '../../store/permissionStore';
import PermissionTable from '../../components/permissions/PermissionTable';
import PermissionForm from '../../components/permissions/PermissionForm';
import { showDeleteConfirm, showDeletedSuccess } from '../../utils/toast';

const Permissions = () => {
    const {
        permissions,
        loading,
        pagination,
        fetchPermissions,
        createPermission,
        updatePermission,
        deletePermission,
        clearError,
    } = usePermissionStore();

    const [showForm, setShowForm] = useState(false);
    const [editingPermission, setEditingPermission] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchPermissions(1, 10);
        return () => clearError();
    }, []);

    const handleCreate = () => {
        setEditingPermission(null);
        setShowForm(true);
    };

    const handleEdit = (permission) => {
        setEditingPermission(permission);
        setShowForm(true);
    };

    const handleDelete = async (permission) => {
        const result = await showDeleteConfirm(
            'Are you sure?',
            `You won't be able to revert this! Permission "${permission.name}" will be deleted.`
        );

        if (result.isConfirmed) {
            const response = await deletePermission(permission.id);
            if (response.success) {
                await showDeletedSuccess('Deleted!', 'Permission has been deleted successfully.');
            }
        }
    };

    const handleFormSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            let result;
            if (editingPermission) {
                result = await updatePermission(editingPermission.id, data);
            } else {
                result = await createPermission(data);
            }

            if (result.success) {
                setShowForm(false);
                setEditingPermission(null);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.last_page) {
            fetchPermissions(page, pagination.per_page);
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingPermission(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Permissions Management</h1>
                    <p className="text-gray-600 mt-1">Manage system permissions and access control</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20"
                >
                    <FaPlus size={16} />
                    Create Permission
                </button>
            </div>

            {showForm && (
                <PermissionForm
                    permission={editingPermission}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCancelForm}
                    loading={isSubmitting || loading}
                />
            )}

            {!showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading && permissions.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                                <p className="mt-3 text-gray-600">Loading permissions...</p>
                            </div>
                        </div>
                    ) : (
                        <PermissionTable
                            permissions={permissions}
                            pagination={pagination}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onPageChange={handlePageChange}
                            onCreate={handleCreate}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default Permissions;