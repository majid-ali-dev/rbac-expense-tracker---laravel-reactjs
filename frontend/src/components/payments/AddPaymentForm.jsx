import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaWallet, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AddPaymentForm = ({ user, onSubmit, onCancel, loading }) => {
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    // Auto-fill remaining balance when user loads
    useEffect(() => {
        if (user && user.remaining > 0) {
            setAmount(user.remaining.toString());
        }
    }, [user]);

    if (!user) return null;

    const remaining = parseFloat(user.remaining || 0);
    const maxAmount = remaining;

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const paidAmount = parseFloat(amount);
        if (!paidAmount || paidAmount <= 0) {
            setError('Please enter a valid amount');
            return;
        }
        if (paidAmount > maxAmount) {
            setError(`Amount cannot exceed remaining balance of Rs ${maxAmount.toFixed(2)}`);
            return;
        }

        onSubmit(paidAmount);
    };

    const handleFillRemaining = () => {
        setAmount(maxAmount > 0 ? maxAmount.toString() : '');
        setError('');
    };

    const handleBack = () => {
        navigate('/payments');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-2xl hover:bg-gray-50 transition-all"
                    >
                        <FaArrowLeft size={14} />
                        Back
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900">Add Payment</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Add payment for {user.name}</p>
                    </div>
                </div>
            </div>

            {/* User Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-100 rounded-2xl">
                        <FaUser className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                                <FaEnvelope size={14} /> {user.email}
                            </span>
                            <span className="flex items-center gap-1">
                                <FaPhone size={14} /> {user.phone || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-blue-50 rounded-2xl p-4 text-center border border-blue-100">
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Total Amount</p>
                        <p className="text-2xl font-extrabold text-blue-700 mt-1">
                            Rs {parseFloat(user.total_amount || 0).toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100">
                        <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Total Paid</p>
                        <p className="text-2xl font-extrabold text-green-700 mt-1">
                            Rs {parseFloat(user.total_paid || 0).toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-yellow-50 rounded-2xl p-4 text-center border border-yellow-100">
                        <p className="text-xs text-yellow-600 font-bold uppercase tracking-wider">Remaining Balance</p>
                        <p className="text-2xl font-extrabold text-yellow-700 mt-1">
                            Rs {remaining.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Payment Form */}
            {remaining > 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                Payment Amount (Rs)
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Rs</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        max={maxAmount}
                                        value={amount}
                                        onChange={(e) => {
                                            setAmount(e.target.value);
                                            setError('');
                                        }}
                                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter amount"
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleFillRemaining}
                                    className="px-4 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-2xl hover:bg-gray-300 transition-all whitespace-nowrap"
                                >
                                    Fill Remaining
                                </button>
                            </div>
                            <p className="mt-1.5 text-sm text-gray-500">
                                Maximum allowed: Rs {maxAmount.toFixed(2)}
                            </p>
                            {error && (
                                <p className="mt-1.5 text-sm text-red-600">{error}</p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaCheckCircle size={16} />
                                {loading ? 'Processing...' : 'Submit Payment'}
                            </button>
                            <button
                                type="button"
                                onClick={handleBack}
                                className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-2xl hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-green-50 rounded-2xl border border-green-200 p-8 text-center">
                    <div className="text-5xl mb-4">✅</div>
                    <h3 className="text-xl font-bold text-green-700">Payment Complete!</h3>
                    <p className="text-green-600 mt-1">
                        This user has fully paid their dues. Total paid: Rs {parseFloat(user.total_paid || 0).toFixed(2)}
                    </p>
                    <button
                        onClick={handleBack}
                        className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all"
                    >
                        <FaArrowLeft size={14} />
                        Back to Payments
                    </button>
                </div>
            )}

            {/* Payment History */}
            {user.payments && user.payments.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <FaWallet size={18} />
                            Payment History
                        </h2>
                    </div>
                    <div className="p-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-center align-middle">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="py-2.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Date & Time</th>
                                        <th className="py-2.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Month</th>
                                        <th className="py-2.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Amount Paid</th>
                                        <th className="py-2.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {user.payments.map((payment) => (
                                        <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-2.5 px-4 text-sm text-gray-700">
                                                {payment.created_at ? new Date(payment.created_at).toLocaleString() : '-'}
                                            </td>
                                            <td className="py-2.5 px-4 text-sm text-gray-700">
                                                <span className="inline-flex px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                    {payment.month_label || '-'}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-4 text-sm font-bold text-green-600">
                                                Rs {parseFloat(payment.paid_amount || 0).toFixed(2)}
                                            </td>
                                            <td className="py-2.5 px-4">
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to delete this payment record?')) {
                                                            // Delete logic
                                                        }
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-105"
                                                    title="Delete"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddPaymentForm;