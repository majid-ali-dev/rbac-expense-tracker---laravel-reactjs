import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

const UserForm = ({ user, roles = [], onSubmit, onCancel, loading }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState([]);

    useEffect(() => {
        if (user) {
            reset({
                name: user.name,
                email: user.email,
                phone: user.phone,
                total_amount: user.total_amount || '',
            });
            setSelectedRoles(user.roles?.map(r => r.id) || []);
        } else {
            reset({
                name: '',
                email: '',
                phone: '',
                password: '',
                total_amount: '',
            });
            setSelectedRoles([]);
        }
    }, [user, reset]);

    const handleRoleToggle = (roleId) => {
        setSelectedRoles(prev => {
            if (prev.includes(roleId)) {
                return prev.filter(id => id !== roleId);
            } else {
                return [...prev, roleId];
            }
        });
    };

    const handleFormSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const formData = {
                ...data,
                roles: selectedRoles,
            };
            await onSubmit(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold text-gray-900">
                    {user ? 'Edit User' : 'Add New User'}
                </h2>
                <button
                    onClick={onCancel}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                    <FaTimes size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('name', {
                                required: 'Name is required',
                                minLength: { value: 2, message: 'Name must be at least 2 characters' },
                                maxLength: { value: 255, message: 'Name must not exceed 255 characters' },
                            })}
                            className={`
                                w-full px-4 py-3 rounded-2xl border transition-all
                                ${errors.name
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                                }
                                focus:outline-none focus:ring-2 focus:border-transparent
                            `}
                            placeholder="Enter full name"
                            disabled={loading || isSubmitting}
                        />
                        {errors.name && (
                            <p className="mt-1.5 text-sm text-red-600">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address',
                                },
                            })}
                            className={`
                                w-full px-4 py-3 rounded-2xl border transition-all
                                ${errors.email
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                                }
                                focus:outline-none focus:ring-2 focus:border-transparent
                            `}
                            placeholder="Enter email address"
                            disabled={loading || isSubmitting}
                        />
                        {errors.email && (
                            <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('phone', {
                                required: 'Phone is required',
                                minLength: { value: 10, message: 'Phone must be at least 10 digits' },
                            })}
                            className={`
                                w-full px-4 py-3 rounded-2xl border transition-all
                                ${errors.phone
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                                }
                                focus:outline-none focus:ring-2 focus:border-transparent
                            `}
                            placeholder="Enter phone number"
                            disabled={loading || isSubmitting}
                        />
                        {errors.phone && (
                            <p className="mt-1.5 text-sm text-red-600">{errors.phone.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            {user ? 'Password (leave blank to keep current)' : 'Password'}
                            <span className="text-red-500"> *</span>
                        </label>
                        <input
                            type="password"
                            {...register('password', {
                                required: user ? false : 'Password is required',
                                minLength: {
                                    value: 5,
                                    message: 'Password must be at least 5 characters'
                                },
                            })}
                            className={`
                                w-full px-4 py-3 rounded-2xl border transition-all
                                ${errors.password
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                                }
                                focus:outline-none focus:ring-2 focus:border-transparent
                            `}
                            placeholder={user ? 'Enter new password (optional)' : 'Enter password'}
                            disabled={loading || isSubmitting}
                        />
                        {errors.password && (
                            <p className="mt-1.5 text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                        Total Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register('total_amount', {
                            min: { value: 0, message: 'Total amount must be at least 0' },
                        })}
                        className={`
                            w-full max-w-xs px-4 py-3 rounded-2xl border transition-all
                            ${errors.total_amount
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                            }
                            focus:outline-none focus:ring-2 focus:border-transparent
                        `}
                        placeholder="Enter total amount"
                        disabled={loading || isSubmitting}
                    />
                    {errors.total_amount && (
                        <p className="mt-1.5 text-sm text-red-600">{errors.total_amount.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                        <span className="font-semibold">Note:</span> This is the total amount the user has paid.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Assign Roles
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {roles.map((role) => (
                            <label key={role.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedRoles.includes(role.id)}
                                    onChange={() => handleRoleToggle(role.id)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{role.name}</span>
                            </label>
                        ))}
                    </div>
                    {selectedRoles.length === 0 && (
                        <p className="mt-1 text-xs text-yellow-600">
                            No roles selected. User will be assigned as "member" by default.
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={loading || isSubmitting}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaCheckCircle size={16} />
                        {loading || isSubmitting ? 'Saving...' : (user ? 'Update' : 'Save')}
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

export default UserForm;