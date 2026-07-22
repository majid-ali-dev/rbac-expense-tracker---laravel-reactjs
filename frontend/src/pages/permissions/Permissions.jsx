import React, { useState, useEffect } from 'react';
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

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingPermission(null);
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= (pagination?.last_page || 1)) {
            fetchPermissions(page, pagination?.per_page || 10);
        }
    };

    if (loading && permissions.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading permissions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {showForm ? (
                <PermissionForm
                    permission={editingPermission}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCancelForm}
                    loading={isSubmitting || loading}
                />
            ) : (
                <PermissionTable
                    permissions={permissions}
                    pagination={pagination}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onCreate={handleCreate}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default Permissions;