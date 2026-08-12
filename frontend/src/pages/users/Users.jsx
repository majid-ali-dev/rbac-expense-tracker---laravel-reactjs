import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../../store/userStore';
import useCycleStore from '../../store/cycleStore';
import CycleFilter from '../../components/common/CycleFilter';
import UserTable from '../../components/users/UserTable';
import UserForm from '../../components/users/UserForm';
import { showDeleteConfirm, showDeletedSuccess } from '../../utils/toast';

const Users = () => {
    const navigate = useNavigate();
    const {
        users,
        roles,
        loading,
        pagination,
        fetchUsers,
        fetchRoles,
        createUser,
        updateUser,
        deleteUser,
        clearUser,
        clearError,
    } = useUserStore();

    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const cycleId = useCycleStore((s) => s.getSelectedId('users'));
    const fetchCycles = useCycleStore((s) => s.fetchCycles);

    useEffect(() => {
        fetchCycles();
        fetchRoles();
        return () => clearError();
    }, [fetchCycles]);

    // Reload the member list whenever the selected cycle changes
    useEffect(() => {
        fetchUsers(1, 10, cycleId);
    }, [cycleId]);

    const handleCreate = () => {
        setEditingUser(null);
        setShowForm(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setShowForm(true);
    };

    const handleView = (user) => {
        navigate(`/users/${user.id}`);
    };

    const handleDelete = async (user) => {
        const result = await showDeleteConfirm(
            'Are you sure?',
            `You won't be able to revert this! User "${user.name}" will be deleted.`
        );

        if (result.isConfirmed) {
            const response = await deleteUser(user.id, cycleId);
            if (response.success) {
                await showDeletedSuccess('Deleted!', 'User has been deleted successfully.');
            }
        }
    };

    const handleFormSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            let result;
            if (editingUser) {
                result = await updateUser(editingUser.id, data, cycleId);
            } else {
                result = await createUser(data, cycleId);
            }

            if (result.success) {
                setShowForm(false);
                setEditingUser(null);
                clearUser();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingUser(null);
        clearUser();
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= (pagination?.last_page || 1)) {
            fetchUsers(page, pagination?.per_page || 10);
        }
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {showForm ? (
                <UserForm
                    user={editingUser}
                    roles={roles}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCancelForm}
                    loading={isSubmitting || loading}
                />
            ) : (
                <UserTable
                    users={users}
                    pagination={pagination}
                    cycleFilter={<CycleFilter moduleKey="users" />}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    onCreate={handleCreate}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default Users;