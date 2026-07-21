import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import usePermissionStore from '../../store/permissionStore';
import PermissionTable from '../../components/permissions/PermissionTable';
import PermissionForm from '../../components/permissions/PermissionForm';
import PermissionDeleteModal from '../../components/permissions/PermissionDeleteModal';

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
    const [deletingPermission, setDeletingPermission] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchPermissions(1, 10); // Changed from 15 to 10
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

    const handleDelete = (permission) => {
        setDeletingPermission(permission);
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

    const handleDeleteConfirm = async () => {
        if (!deletingPermission) return;

        const result = await deletePermission(deletingPermission.id);
        if (result.success) {
            setDeletingPermission(null);
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

    const handleCancelDelete = () => {
        setDeletingPermission(null);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Permissions Management</h1>
                    <p className="text-gray-600 mt-1">Manage system permissions and access control</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <FaPlus size={16} />
                    Create Permission
                </button>
            </div>

            {/* Permission Form */}
            {showForm && (
                <PermissionForm
                    permission={editingPermission}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCancelForm}
                    loading={isSubmitting || loading}
                />
            )}

            {/* Permission Table */}
            {!showForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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

            {/* Delete Modal */}
            {deletingPermission && (
                <PermissionDeleteModal
                    permission={deletingPermission}
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleCancelDelete}
                    loading={loading}
                />
            )}
        </div>
    );
};

export default Permissions;