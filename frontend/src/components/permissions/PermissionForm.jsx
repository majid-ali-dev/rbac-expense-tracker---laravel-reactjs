import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes } from 'react-icons/fa';

const PermissionForm = ({ permission, onSubmit, onCancel, loading }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (permission) {
            reset({
                name: permission.name,
            });
        } else {
            reset({
                name: '',
            });
        }
    }, [permission, reset]);

    const handleFormSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await onSubmit(data);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                    {permission ? 'Edit Permission' : 'Create Permission'}
                </h2>
                <button
                    onClick={onCancel}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <FaTimes size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Permission Name
                    </label>
                    <input
                        type="text"
                        {...register('name', {
                            required: 'Permission name is required',
                            minLength: {
                                value: 2,
                                message: 'Permission name must be at least 2 characters',
                            },
                            maxLength: {
                                value: 255,
                                message: 'Permission name must not exceed 255 characters',
                            },
                            pattern: {
                                value: /^[a-z0-9-]+$/,
                                message: 'Permission name must be lowercase with hyphens (e.g., manage-users)',
                            },
                        })}
                        className={`
                            w-full px-4 py-2.5 rounded-lg border transition-colors
                            ${errors.name
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                            }
                            focus:outline-none focus:ring-2
                        `}
                        placeholder="Enter permission name (e.g., manage-users, create-expense)"
                        disabled={loading || isSubmitting}
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                        Use lowercase letters and hyphens only (e.g., view-expense, create-payment)
                    </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={loading || isSubmitting}
                        className="px-6 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading || isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                                {permission ? 'Updating...' : 'Creating...'}
                            </span>
                        ) : (
                            permission ? 'Update Permission' : 'Create Permission'
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PermissionForm;