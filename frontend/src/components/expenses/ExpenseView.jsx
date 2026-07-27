import React from 'react';
import { FaArrowLeft, FaUser, FaTag, FaMoneyBillWave, FaCalendar, FaFileAlt, FaClock, FaUserCircle } from 'react-icons/fa';

const ExpenseView = ({ expense, onBack }) => {
    if (!expense) return null;

    // Get history data from expense
    const histories = expense.histories || [];

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get action badge color
    const getActionBadge = (action) => {
        const colors = {
            'created': 'bg-green-100 text-green-700 border-green-200',
            'updated': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'deleted': 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[action] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    // Get action icon
    const getActionIcon = (action) => {
        const icons = {
            'created': '✅',
            'updated': '✏️',
            'deleted': '🗑️',
        };
        return icons[action] || '📌';
    };

    // Get field label
    const getFieldLabel = (field) => {
        const labels = {
            'title': 'Title',
            'amount': 'Amount',
            'date': 'Date',
            'description': 'Description',
            'category_id': 'Category',
        };
        return labels[field] || field;
    };

    // Format value for display
    const formatValue = (field, value) => {
        if (value === null || value === undefined || value === '') return '-';

        if (field === 'amount') {
            return `Rs. ${parseFloat(value).toFixed(2)}`;
        }

        if (field === 'date') {
            return new Date(value).toLocaleDateString('en-GB');
        }

        if (field === 'category_id') {
            // Try to find category name from expense
            if (expense.category && expense.category.id === parseInt(value)) {
                return expense.category.name;
            }
            return value;
        }

        return value;
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-2xl">
                        <FaMoneyBillWave className="text-blue-600" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold text-gray-900">Expense Details</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Complete information about this expense</p>
                    </div>
                </div>
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-2xl hover:bg-gray-50 transition-all"
                >
                    <FaArrowLeft size={14} />
                    Back
                </button>
            </div>

            {/* Expense Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="p-2 bg-blue-100 rounded-xl">
                        <FaUser className="text-blue-600" size={18} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">User</p>
                        <p className="text-sm font-bold text-gray-900">{expense.user?.name || '-'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="p-2 bg-purple-100 rounded-xl">
                        <FaTag className="text-purple-600" size={18} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Category</p>
                        <p className="text-sm font-bold text-gray-900">{expense.category?.name || '-'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="p-2 bg-green-100 rounded-xl">
                        <FaMoneyBillWave className="text-green-600" size={18} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Amount</p>
                        <p className="text-sm font-bold text-green-600">Rs. {(expense.amount || 0).toFixed(2)}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="p-2 bg-orange-100 rounded-xl">
                        <FaCalendar className="text-orange-600" size={18} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Date</p>
                        <p className="text-sm font-bold text-gray-900">{expense.date_formatted || '-'}</p>
                    </div>
                </div>

                <div className="md:col-span-2 flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="p-2 bg-red-100 rounded-xl">
                        <FaFileAlt className="text-red-600" size={18} />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">Description</p>
                        <p className="text-sm text-gray-700">{expense.description || 'No description provided'}</p>
                    </div>
                </div>
            </div>

            {/* Expense History Section - Only show if there are histories */}
            {histories.length > 0 && (
                <div className="mt-8 border-t border-gray-200 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FaClock className="text-blue-600" size={18} />
                        <h3 className="text-lg font-bold text-gray-900">Expense History</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-0.5 rounded-full">
                            {histories.length} change{histories.length > 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className="space-y-4">
                        {histories.map((history, index) => (
                            <div key={index} className="border border-gray-200 rounded-2xl overflow-hidden">
                                {/* History Header */}
                                <div className={`px-4 py-3 flex flex-wrap items-center justify-between gap-2 ${history.action === 'created' ? 'bg-green-50' : history.action === 'updated' ? 'bg-yellow-50' : 'bg-red-50'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{getActionIcon(history.action)}</span>
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${getActionBadge(history.action)}`}>
                                            {history.action.charAt(0).toUpperCase() + history.action.slice(1)}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                            <FaUserCircle size={14} />
                                            <span className="font-medium">{history.user?.name || 'System'}</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {formatDate(history.created_at)}
                                    </div>
                                </div>

                                {/* History Body */}
                                <div className="p-4 bg-white">
                                    {history.action === 'created' ? (
                                        <div className="text-sm text-gray-700">
                                            <span className="font-medium">New expense created</span>
                                            {history.new_data && (
                                                <div className="mt-1 text-xs text-gray-500">
                                                    Amount: Rs. {(parseFloat(history.new_data?.amount) || 0).toFixed(2)}
                                                    {history.new_data?.description && ` | ${history.new_data.description}`}
                                                </div>
                                            )}
                                        </div>
                                    ) : history.action === 'updated' ? (
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">Changes made:</p>
                                            <div className="space-y-1.5">
                                                {history.changed_fields?.split(',').map((field, idx) => {
                                                    const fieldName = field.trim();
                                                    const oldValue = history.old_data?.[fieldName];
                                                    const newValue = history.new_data?.[fieldName];

                                                    // Skip if both values are the same
                                                    if (oldValue === newValue) return null;

                                                    return (
                                                        <div key={idx} className="flex flex-wrap items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded-lg">
                                                            <span className="font-medium text-gray-600 min-w-[80px]">
                                                                {getFieldLabel(fieldName)}:
                                                            </span>
                                                            <span className="text-red-500 line-through">
                                                                {formatValue(fieldName, oldValue)}
                                                            </span>
                                                            <span className="text-gray-400">→</span>
                                                            <span className="text-green-600 font-medium">
                                                                {formatValue(fieldName, newValue)}
                                                            </span>
                                                        </div>
                                                    );
                                                }).filter(Boolean)}
                                            </div>
                                        </div>
                                    ) : history.action === 'deleted' ? (
                                        <div className="text-sm text-gray-700">
                                            <span className="font-medium text-red-600">Expense deleted</span>
                                            {history.old_data && (
                                                <div className="mt-1 text-xs text-gray-500">
                                                    Title: {history.old_data?.title || '-'}
                                                    {history.old_data?.amount && ` | Amount: Rs. ${parseFloat(history.old_data.amount).toFixed(2)}`}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-700">
                                            {history.action} action performed
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseView;