import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaShieldAlt, FaCheckSquare, FaRegSquare } from 'react-icons/fa';
import useRolePermissionStore from '../../store/rolePermissionStore';
import DataTable from '../../components/common/DataTable';

const ViewRolePermissions = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { role, allPermissions, loading, fetchRolePermissions, clearRole } = useRolePermissionStore();

    useEffect(() => {
        if (id) {
            fetchRolePermissions(id);
        }
        return () => clearRole();
    }, [id]);

    const handleBack = () => {
        navigate('/role-permissions');
    };

    if (loading && !role) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading permissions...</p>
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
                        onClick={handleBack}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const assignedIds = (role.permissions || []).map((p) => p.id);
    const assignedCount = assignedIds.length;
    const totalCount = allPermissions.length;
    const unassignedCount = totalCount - assignedCount;
    const progress = totalCount > 0 ? Math.round((assignedCount / totalCount) * 100) : 0;

    const columns = [
        {
            id: 'id',
            header: 'Id',
            accessorFn: (row) => row.id,
            cell: ({ row }) => (
                <span className="font-mono text-sm font-medium text-gray-700">{row.index + 1}</span>
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
            id: 'status',
            header: 'Status',
            accessorFn: (row) => (assignedIds.includes(row.id) ? 'Assigned' : 'Not assigned'),
            cell: ({ row }) => {
                const assigned = assignedIds.includes(row.original.id);
                return assigned ? (
                    <span className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm">
                        <FaCheckSquare size={18} />
                        Assigned
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-2 text-gray-400 font-medium text-sm">
                        <FaRegSquare size={18} />
                        Not assigned
                    </span>
                );
            },
            enableSorting: true,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Back button */}
            <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
                <FaArrowLeft size={14} />
                Back to Roles & Permissions
            </button>

            {/* Header card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-2xl">
                            <FaShieldAlt className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold text-gray-900">{role.name}</h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Role #{role.id} · Permissions overview
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                            <FaCheckSquare size={12} />
                            {assignedCount} Assigned
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                            <FaRegSquare size={12} />
                            {unassignedCount} Not assigned
                        </span>
                    </div>
                </div>

            </div>

            {/* Permission list — same DataTable as the other pages (search + 10 per page) */}
            <DataTable
                data={allPermissions}
                columns={columns}
                title="Permissions"
                searchPlaceholder="Search permissions..."
                itemsPerPage={10}
                onCreate={null}
            />
        </div>
    );
};

export default ViewRolePermissions;
