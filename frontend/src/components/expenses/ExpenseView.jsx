import React from 'react';
import { FaArrowLeft, FaUser, FaTag, FaMoneyBillWave, FaCalendar, FaFileAlt } from 'react-icons/fa';

const ExpenseView = ({ expense, onBack }) => {
    if (!expense) return null;

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
        </div>
    );
};

export default ExpenseView;