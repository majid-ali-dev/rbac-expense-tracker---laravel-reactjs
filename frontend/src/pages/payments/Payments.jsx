import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePaymentStore from '../../store/paymentStore';
import PaymentTable from '../../components/payments/PaymentTable';

const Payments = () => {
    const navigate = useNavigate();
    const {
        users,
        stats,
        loading,
        pagination,
        fetchPayments,
        clearError,
    } = usePaymentStore();

    useEffect(() => {
        fetchPayments(1, 10);
        return () => clearError();
    }, []);

    const handleAddPayment = (user) => {
        navigate(`/payments/${user.id}/add`);
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= (pagination?.last_page || 1)) {
            fetchPayments(page, pagination?.per_page || 10);
        }
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading payments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PaymentTable
                users={users}
                pagination={pagination}
                stats={stats}
                onAddPayment={handleAddPayment}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default Payments;