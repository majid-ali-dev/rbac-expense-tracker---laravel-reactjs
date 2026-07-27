import React, { useState, useEffect, useMemo } from 'react';
import { FaDownload, FaFilter, FaUndo, FaSearch } from 'react-icons/fa';
import api from '../../services/api';
import axios from 'axios';

const ViewExpenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [totalPaid, setTotalPaid] = useState(0);
    const [remainingBalance, setRemainingBalance] = useState(0);
    const [extraBalance, setExtraBalance] = useState(0);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const from = firstDay.toISOString().split('T')[0];
        const to = now.toISOString().split('T')[0];
        setFromDate(from);
        setToDate(to);
        fetchExpenses(from, to);
    }, []);

    const fetchExpenses = async (from, to) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/expenses/sheet?from=${from}&to=${to}`);

            if (response.data.success) {
                const data = response.data.data;
                const expensesData = (data.expenses || []).map(exp => ({
                    ...exp,
                    amount: parseFloat(exp.amount) || 0,
                    date_display: exp.date ? new Date(exp.date).toLocaleDateString('en-GB') : 'Unknown'
                }));
                setExpenses(expensesData);
                setTotalExpenses(parseFloat(data.total_expenses) || 0);
                setTotalPaid(parseFloat(data.total_paid) || 0);
                setRemainingBalance(parseFloat(data.remaining_balance) || 0);
                setExtraBalance(parseFloat(data.extra_balance) || 0);
            } else {
                setError(response.data.message || 'Failed to fetch expenses');
            }
        } catch (err) {
            console.error('Error fetching expenses:', err);
            setError(err.response?.data?.message || 'Failed to fetch expenses. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        if (fromDate && toDate) {
            fetchExpenses(fromDate, toDate);
        }
    };

    const handleReset = () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const from = firstDay.toISOString().split('T')[0];
        const to = now.toISOString().split('T')[0];
        setFromDate(from);
        setToDate(to);
        setSearchTerm('');
        fetchExpenses(from, to);
    };

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const token = localStorage.getItem('token');
            // Use current fromDate and toDate for download
            const downloadFrom = fromDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
            const downloadTo = toDate || new Date().toISOString().split('T')[0];
            
            const response = await axios({
                method: 'GET',
                url: `${api.defaults.baseURL}/expenses/download-sheet?from=${downloadFrom}&to=${downloadTo}`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'text/csv',
                },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `expense-sheet-${downloadFrom}-to-${downloadTo}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    // Filter expenses by search term
    const filteredExpenses = useMemo(() => {
        if (!searchTerm) return expenses;
        const term = searchTerm.toLowerCase();
        return expenses.filter(exp =>
            exp.title?.toLowerCase().includes(term) ||
            exp.user?.name?.toLowerCase().includes(term) ||
            exp.category?.name?.toLowerCase().includes(term) ||
            exp.description?.toLowerCase().includes(term)
        );
    }, [expenses, searchTerm]);

    // Group filtered expenses by date
    const groupedExpenses = filteredExpenses.reduce((acc, expense) => {
        const date = expense.date_display || 'Unknown Date';
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(expense);
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedExpenses).sort((a, b) => {
        const dateA = a.split('/').reverse().join('-');
        const dateB = b.split('/').reverse().join('-');
        return new Date(dateB) - new Date(dateA);
    });

    const getDateTotal = (date) => {
        return groupedExpenses[date].reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    };

    if (error) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center">
                <div className="text-5xl mb-4">❌</div>
                <p className="text-red-600 text-lg font-medium">{error}</p>
                <button
                    onClick={handleReset}
                    className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all"
                >
                    <FaUndo size={14} />
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">View Expenses</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Filter and view expense reports</p>
                </div>
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {downloading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Downloading...
                        </>
                    ) : (
                        <>
                            <FaDownload size={16} />
                            Download Excel
                        </>
                    )}
                </button>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">From</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="px-4 py-2.5 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">To</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="px-4 py-2.5 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={handleFilter}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                    >
                        <FaFilter size={14} />
                        Filter
                    </button>
                    <button
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-300 transition-all"
                    >
                        <FaUndo size={14} />
                        Reset
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by title, user, category, description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                {searchTerm && (
                    <div className="mt-2 text-sm text-gray-500">
                        Found {filteredExpenses.length} result{filteredExpenses.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading expenses...</p>
                    </div>
                </div>
            )}

            {/* Daily Expenses Table */}
            {!loading && filteredExpenses.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                        <h2 className="text-lg font-bold text-white">Daily Expenses</h2>
                    </div>
                    <div className="p-4">
                        {sortedDates.map((date) => (
                            <div key={date} className="mb-6 last:mb-0">
                                <h3 className="text-md font-bold text-gray-700 border-l-4 border-blue-500 pl-3 mb-3">
                                    {date}
                                </h3>
                                <div className="overflow-x-auto rounded-xl border border-gray-200">
                                    <table className="w-full text-center align-middle">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">User</th>
                                                <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Category</th>
                                                <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Title</th>
                                                <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                                                <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groupedExpenses[date].map((expense) => (
                                                <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <td className="py-3 px-4 text-sm text-gray-700 font-medium">{expense.user?.name || '-'}</td>
                                                    <td className="py-3 px-4">
                                                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                            {expense.category?.name || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">{expense.title}</td>
                                                    <td className="py-3 px-4 text-sm font-bold text-blue-600">
                                                        Rs. {(parseFloat(expense.amount) || 0).toFixed(2)}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-500 max-w-xs truncate">
                                                        {expense.description || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        {/* Total at bottom */}
                                        <tfoot>
                                            <tr className="bg-blue-50 border-t-2 border-blue-200">
                                                <td colSpan="3" className="py-3 px-4 text-right text-sm font-bold text-gray-700">
                                                    Total:
                                                </td>
                                                <td className="py-3 px-4 text-sm font-bold text-blue-600">
                                                    Rs. {getDateTotal(date).toFixed(2)}
                                                </td>
                                                <td className="py-3 px-4"></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No Data Message */}
            {!loading && filteredExpenses.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <p className="text-gray-500 text-lg font-medium">
                        {searchTerm ? 'No matching expenses found' : 'No expenses found'}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                        {searchTerm ? 'Try adjusting your search term' : 'Try adjusting your date filter'}
                    </p>
                </div>
            )}

            {/* Summary Cards */}
            {!loading && filteredExpenses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow">
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Total Expenses</p>
                        <p className="text-2xl font-extrabold text-blue-700 mt-2">
                            Rs. {totalExpenses.toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow">
                        <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Total Paid</p>
                        <p className="text-2xl font-extrabold text-green-700 mt-2">
                            Rs. {totalPaid.toFixed(2)}
                        </p>
                    </div>
                    <div className={`bg-white rounded-2xl shadow-sm border p-6 text-center hover:shadow-md transition-shadow ${extraBalance > 0 ? 'border-yellow-500' : 'border-red-500'}`}>
                        <p className={`text-xs font-bold uppercase tracking-wider ${extraBalance > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {extraBalance > 0 ? 'Extra Balance' : 'Remaining Balance'}
                        </p>
                        <p className={`text-2xl font-extrabold mt-2 ${extraBalance > 0 ? 'text-yellow-700' : 'text-red-700'}`}>
                            Rs. {(extraBalance > 0 ? extraBalance : remainingBalance).toFixed(2)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewExpenses;