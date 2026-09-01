import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaArrowLeft, FaCheckCircle, FaMoneyBillWave } from 'react-icons/fa';
import useTranslation from '../../hooks/useTranslation';

const ExpenseForm = ({ expense, categories = [], onSubmit, onCancel, loading }) => {
    const { t } = useTranslation();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (expense) {
            reset({
                category_id: expense.category_id || '',
                amount: expense.amount || '',
                date: expense.date ? expense.date.split('T')[0] : '',
                description: expense.description || '',
            });
        } else {
            reset({
                category_id: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                description: '',
            });
        }
    }, [expense, reset]);

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
                    <div className="p-2 bg-blue-100 rounded-2xl">
                        <FaMoneyBillWave className="text-blue-600" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold text-gray-900">
                            {expense ? t('editExpense') : t('addNewExpense')}
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {expense ? t('updateExpenseDesc') : t('createNewExpense')}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            {t('category')} <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register('category_id', {
                                required: t('pleaseSelectCategory'),
                            })}
                            className={`
                                w-full px-4 py-3 rounded-2xl border transition-all
                                ${errors.category_id
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                                }
                                focus:outline-none focus:ring-2 focus:border-transparent
                                bg-white
                            `}
                            disabled={loading || isSubmitting}
                        >
                            <option value="">{t('selectCategory')}</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {errors.category_id && (
                            <p className="mt-1.5 text-sm text-red-600">{errors.category_id.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            {t('amountRs')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            {...register('amount', {
                                required: t('amountRequired'),
                                min: { value: 0, message: t('amountMin') },
                            })}
                            className={`
                                w-full px-4 py-3 rounded-2xl border transition-all
                                ${errors.amount
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                                }
                                focus:outline-none focus:ring-2 focus:border-transparent
                            `}
                            placeholder={t('enterAmount')}
                            disabled={loading || isSubmitting}
                        />
                        {errors.amount && (
                            <p className="mt-1.5 text-sm text-red-600">{errors.amount.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            {t('date')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            {...register('date', {
                                required: t('dateRequired'),
                            })}
                            className={`
                                w-full px-4 py-3 rounded-2xl border transition-all
                                ${errors.date
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                                }
                                focus:outline-none focus:ring-2 focus:border-transparent
                            `}
                            disabled={loading || isSubmitting}
                        />
                        {errors.date && (
                            <p className="mt-1.5 text-sm text-red-600">{errors.date.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            {t('description')}
                        </label>
                        <textarea
                            {...register('description')}
                            rows="1"
                            className={`
                                w-full px-4 py-3 rounded-2xl border transition-all
                                ${errors.description
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                                }
                                focus:outline-none focus:ring-2 focus:border-transparent
                            `}
                            placeholder={t('enterDescription')}
                            disabled={loading || isSubmitting}
                        />
                        {errors.description && (
                            <p className="mt-1.5 text-sm text-red-600">{errors.description.message}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={loading || isSubmitting}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaCheckCircle size={16} />
                        {loading || isSubmitting ? t('saving') : (expense ? t('update') : t('save'))}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-2xl hover:bg-gray-50 transition-all"
                    >
                        <FaArrowLeft size={14} />
                        {t('back')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ExpenseForm;