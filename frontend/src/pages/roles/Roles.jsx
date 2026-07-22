import React, { useState, useEffect } from 'react';
import useRoleStore from '../../store/roleStore';
import RoleTable from '../../components/roles/RoleTable';
import RoleForm from '../../components/roles/RoleForm';
import { showDeleteConfirm, showDeletedSuccess } from '../../utils/toast';

const Roles = () => {
    const {
        roles,
        loading,
        pagination,
        fetchRoles,
        createRole,
        updateRole,
        deleteRole,
        clearError,
    } = useRoleStore();

    const [showForm, setShowForm] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchRoles(1, 10);
        return () => clearError();
    }, []);

    const handleCreate = () => {
        setEditingRole(null);
        setShowForm(true);
    };

    const handleEdit = (role) => {
        setEditingRole(role);
        setShowForm(true);
    };

    const handleDelete = async (role) => {
        const result = await showDeleteConfirm(
            'Are you sure?',
            `You won't be able to revert this! Role "${role.name}" will be deleted.`
        );
        
        if (result.isConfirmed) {
            const response = await deleteRole(role.id);
            if (response.success) {
                await showDeletedSuccess('Deleted!', 'Role has been deleted successfully.');
            }
        }
    };

    const handleFormSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            let result;
            if (editingRole) {
                result = await updateRole(editingRole.id, data);
            } else {
                result = await createRole(data);
            }

            if (result.success) {
                setShowForm(false);
                setEditingRole(null);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingRole(null);
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= (pagination?.last_page || 1)) {
            fetchRoles(page, pagination?.per_page || 10);
        }
    };

    if (loading && roles.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading roles...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {showForm ? (
                <RoleForm
                    role={editingRole}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCancelForm}
                    loading={isSubmitting || loading}
                />
            ) : (
                <RoleTable
                    roles={roles}
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

export default Roles;