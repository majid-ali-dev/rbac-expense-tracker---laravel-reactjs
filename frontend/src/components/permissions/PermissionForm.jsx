import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

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
            reset({ name: permission.name });
        } else {
            reset({ name: '' });
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
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold text-gray-900">
                    {permission ? 'Edit Permission' : 'Create Permission'}
                </h2>
                <button
                    onClick={onCancel}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                    <FaTimes size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Permission Name</label>
                    <input
                        type="text"
                        {...register('name', {
                            required: 'Permission name is required',
                            minLength: { value: 2, message: 'Permission name must be at least 2 characters' },
                            maxLength: { value: 255, message: 'Permission name must not exceed 255 characters' },
                            pattern: {
                                value: /^[a-z0-9-]+$/,
                                message: 'Use lowercase letters and hyphens only',
                            },
                        })}
                        className={`
                            w-full px-4 py-3 rounded-2xl border transition-all
                            ${errors.name
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                            }
                            focus:outline-none focus:ring-2 focus:border-transparent
                        `}
                        placeholder="Enter permission name (e.g., manage-users)"
                        disabled={loading || isSubmitting}
                    />
                    {errors.name && (
                        <p className="mt-1.5 text-sm text-red-600">{errors.name.message}</p>
                    )}
                    <p className="mt-1.5 text-xs text-gray-500">
                        Use lowercase letters and hyphens only (e.g., view-expense, create-payment)
                    </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={loading || isSubmitting}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaCheckCircle size={16} />
                        {loading || isSubmitting ? 'Saving...' : (permission ? 'Update' : 'Save')}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-2xl hover:bg-gray-50 transition-all"
                    >
                        <FaArrowLeft size={14} />
                        Back
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PermissionForm;