import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import useRoleStore from '../../store/roleStore';
import RoleTable from '../../components/roles/RoleTable';
import RoleForm from '../../components/roles/RoleForm';
import RoleDeleteModal from '../../components/roles/RoleDeleteModal';

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
    const [deletingRole, setDeletingRole] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchRoles(1, 15);
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

    const handleDelete = (role) => {
        setDeletingRole(role);
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

    const handleDeleteConfirm = async () => {
        if (!deletingRole) return;

        const result = await deleteRole(deletingRole.id);
        if (result.success) {
            setDeletingRole(null);
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.last_page) {
            fetchRoles(page, pagination.per_page);
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingRole(null);
    };

    const handleCancelDelete = () => {
        setDeletingRole(null);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Roles Management</h1>
                    <p className="text-gray-600 mt-1">Manage user roles and permissions</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <FaPlus size={16} />
                    Create Role
                </button>
            </div>

            {/* Role Form */}
            {showForm && (
                <RoleForm
                    role={editingRole}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCancelForm}
                    loading={isSubmitting || loading}
                />
            )}

            {/* Role Table */}
            {!showForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading && roles.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-3 text-gray-600">Loading roles...</p>
                            </div>
                        </div>
                    ) : (
                        <RoleTable
                            roles={roles}
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
            {deletingRole && (
                <RoleDeleteModal
                    role={deletingRole}
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleCancelDelete}
                    loading={loading}
                />
            )}
        </div>
    );
};

export default Roles;