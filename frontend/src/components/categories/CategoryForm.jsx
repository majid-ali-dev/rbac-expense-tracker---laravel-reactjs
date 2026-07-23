import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaArrowLeft, FaCheckCircle, FaTags } from 'react-icons/fa';

const CategoryForm = ({ category, onSubmit, onCancel, loading }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (category) {
            reset({ name: category.name });
        } else {
            reset({ name: '' });
        }
    }, [category, reset]);

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
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-2xl">
                        <FaTags className="text-green-600" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold text-gray-900">
                            {category ? 'Edit Category' : 'Add New Category'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {category ? 'Update category name' : 'Create a new expense category'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onCancel}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                    <FaTimes size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                        Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        {...register('name', {
                            required: 'Category name is required',
                            minLength: { value: 2, message: 'Name must be at least 2 characters' },
                            maxLength: { value: 255, message: 'Name must not exceed 255 characters' },
                        })}
                        className={`
                            w-full max-w-md px-4 py-3 rounded-2xl border transition-all
                            ${errors.name
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-green-500'
                            }
                            focus:outline-none focus:ring-2 focus:border-transparent
                        `}
                        placeholder="Enter category name (e.g., Milk, Water, Grocery)"
                        disabled={loading || isSubmitting}
                    />
                    {errors.name && (
                        <p className="mt-1.5 text-sm text-red-600">{errors.name.message}</p>
                    )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={loading || isSubmitting}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaCheckCircle size={16} />
                        {loading || isSubmitting ? 'Saving...' : (category ? 'Update' : 'Save')}
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

export default CategoryForm;