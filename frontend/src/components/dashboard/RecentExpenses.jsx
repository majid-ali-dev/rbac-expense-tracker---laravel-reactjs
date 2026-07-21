import React from 'react';
import { format } from 'date-fns';

const RecentExpenses = ({ expenses }) => {
    if (!expenses || expenses.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No recent expenses found
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Title</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">User</th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map((expense) => (
                        <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-700">
                                {expense.date ? format(new Date(expense.date), 'dd/MM/yyyy') : '-'}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">{expense.title}</td>
                            <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                Rs. {parseFloat(expense.amount || 0).toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">{expense.user?.name || '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecentExpenses;