import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useRolePermissionStore from '../../store/rolePermissionStore';
import RolePermissionTable from '../../components/role-permissions/RolePermissionTable';
import RolePermissionForm from '../../components/role-permissions/RolePermissionForm';
import { showDeleteConfirm } from '../../utils/toast';

const RolePermissions = () => {
    const navigate = useNavigate();
    const {
        roles,
        role,
        allPermissions,
        loading,
        pagination,
        fetchRoles,
        fetchRolePermissions,
        updateRolePermissions,
        clearRole,
        clearError,
    } = useRolePermissionStore();

    const [showForm, setShowForm] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchRoles(1, 10);
        return () => clearError();
    }, []);

    const handleEdit = (role) => {
        setEditingRole(role);
        setShowForm(true);
        fetchRolePermissions(role.id);
    };

    const handleFormSubmit = async (permissionIds) => {
        setIsSubmitting(true);
        try {
            const result = await updateRolePermissions(editingRole.id, permissionIds);
            if (result.success) {
                setShowForm(false);
                setEditingRole(null);
                clearRole();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingRole(null);
        clearRole();
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
                <RolePermissionForm
                    role={role || editingRole}
                    allPermissions={allPermissions}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCancelForm}
                    loading={isSubmitting || loading}
                />
            ) : (
                <RolePermissionTable
                    roles={roles}
                    pagination={pagination}
                    onEdit={handleEdit}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default RolePermissions;