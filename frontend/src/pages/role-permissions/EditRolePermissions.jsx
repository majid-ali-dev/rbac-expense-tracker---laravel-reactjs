import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useRolePermissionStore from '../../store/rolePermissionStore';
import RolePermissionForm from '../../components/role-permissions/RolePermissionForm';

const EditRolePermissions = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { role, allPermissions, loading, fetchRolePermissions, updateRolePermissions, clearRole } =
        useRolePermissionStore();

    useEffect(() => {
        if (id) {
            fetchRolePermissions(id);
        }
        return () => clearRole();
    }, [id]);

    const handleSubmit = async (permissionIds) => {
        const result = await updateRolePermissions(id, permissionIds);
        if (result.success) {
            navigate('/role-permissions');
        }
    };

    const handleCancel = () => {
        navigate('/role-permissions');
    };

    if (loading && !role) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading role permissions...</p>
                </div>
            </div>
        );
    }

    if (!role) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <p className="text-gray-500 text-lg">Role not found</p>
                    <button
                        onClick={handleCancel}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <RolePermissionForm
            role={role}
            allPermissions={allPermissions}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
        />
    );
};

export default EditRolePermissions;
