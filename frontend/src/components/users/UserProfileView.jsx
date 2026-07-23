import React from 'react';
import { FaArrowLeft, FaDownload, FaWallet, FaCalendar, FaPhone, FaEnvelope, FaUser } from 'react-icons/fa';
import { generateUserProfilePDF } from '../../utils/pdfExport';

const UserProfileView = ({ user, paymentHistory, onBack }) => {
    if (!user) return null;

    const handleDownloadPDF = () => {
        generateUserProfilePDF(user, paymentHistory);
    };

    const getStatusBadge = (status) => {
        const colors = {
            paid: 'bg-green-100 text-green-700 border-green-200',
            partial: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            unpaid: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getStatusIcon = (status) => {
        const icons = {
            paid: '✅',
            partial: '⏳',
            unpaid: '❌',
        };
        return icons[status] || '•';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all"
                    >
                        <FaArrowLeft size={18} className="text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900">User Profile</h1>
                        <p className="text-sm text-gray-500">Complete user information and payment history</p>
                    </div>
                </div>
                <button
                    onClick={handleDownloadPDF}
                    className="inline-flex items-center gap-2.5 px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-2xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-0.5 active:scale-95"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" />
                        <polyline points="9 15 12 18 15 15" />
                    </svg>
                    <span>PDF</span>
                   
                </button>
            </div>

            {/* User Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                    <h2 className="text-lg font-bold text-white">User Information</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="p-2 bg-blue-100 rounded-xl">
                                <FaUser className="text-blue-600" size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Full Name</p>
                                <p className="text-sm font-bold text-gray-900">{user.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="p-2 bg-purple-100 rounded-xl">
                                <FaEnvelope className="text-purple-600" size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Email</p>
                                <p className="text-sm font-bold text-gray-900">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="p-2 bg-green-100 rounded-xl">
                                <FaPhone className="text-green-600" size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Phone</p>
                                <p className="text-sm font-bold text-gray-900">{user.phone || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="p-2 bg-orange-100 rounded-xl">
                                <FaCalendar className="text-orange-600" size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Joined</p>
                                <p className="text-sm font-bold text-gray-900">{user.joined_at || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                            <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Total Amount</p>
                            <p className="text-2xl font-extrabold text-blue-700 mt-1">
                                Rs. {(user.total_amount || 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-2xl border border-green-100 text-center">
                            <p className="text-xs text-green-600 font-medium uppercase tracking-wider">Total Paid</p>
                            <p className="text-2xl font-extrabold text-green-700 mt-1">
                                Rs. {(user.total_paid || 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-center">
                            <p className="text-xs text-red-600 font-medium uppercase tracking-wider">Remaining</p>
                            <p className="text-2xl font-extrabold text-red-700 mt-1">
                                Rs. {(user.remaining || 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-center">
                            <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Status</p>
                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusBadge(user.payment_status)} mt-1`}>
                                {getStatusIcon(user.payment_status)}
                                {(user.payment_status || 'UNPAID').toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4">
                        <p className="text-xs text-gray-500">
                            <span className="font-bold">Roles:</span> {user.roles?.join(', ') || 'No roles assigned'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <FaWallet size={18} />
                        Payment History
                    </h2>
                </div>
                <div className="p-6">
                    {!paymentHistory || paymentHistory.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">💳</div>
                            <p className="text-gray-500 text-lg font-medium">No payment history found</p>
                            <p className="text-sm text-gray-400 mt-1">This user hasn't made any payments yet</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {paymentHistory.map((monthData, index) => (
                                <div key={index} className="border border-gray-200 rounded-2xl overflow-hidden">
                                    <div className="bg-blue-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                        <h3 className="font-bold text-gray-900">{monthData.month}</h3>
                                        <span className="text-sm font-bold text-blue-600">
                                            Total: Rs. {(monthData.total || 0).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="text-left py-2.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                                                    <th className="text-left py-2.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                                                    <th className="text-left py-2.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Month</th>
                                                    <th className="text-left py-2.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Updated By</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {monthData.payments.map((payment, idx) => (
                                                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                        <td className="py-2.5 px-4 text-sm text-gray-700">{payment.date}</td>
                                                        <td className="py-2.5 px-4 text-sm font-bold text-green-600">
                                                            Rs. {(payment.amount || 0).toFixed(2)}
                                                        </td>
                                                        <td className="py-2.5 px-4 text-sm text-gray-700">
                                                            <span className="inline-flex px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                                {payment.month_label || '-'}
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5 px-4 text-sm text-gray-700">{payment.updated_by}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfileView;