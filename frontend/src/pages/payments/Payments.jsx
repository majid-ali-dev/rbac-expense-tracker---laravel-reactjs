import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePaymentStore from '../../store/paymentStore';
import useCycleStore from '../../store/cycleStore';
import CycleFilter from '../../components/common/CycleFilter';
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
    const cycleId = useCycleStore((s) => s.getSelectedId('payments'));
    const fetchCycles = useCycleStore((s) => s.fetchCycles);
    // Closed (historical) cycles are read-only everywhere.
    const readOnly = useCycleStore((s) => s.isReadOnly('payments'));

    useEffect(() => {
        fetchCycles();
        return () => clearError();
    }, [fetchCycles]);

    // null cycleId falls back to the current cycle on the backend, so the page
    // still works even if the cycle list fails to load.
    useEffect(() => {
        fetchPayments(1, 10, cycleId);
    }, [cycleId]);

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
                cycleFilter={<CycleFilter moduleKey="payments" />}
                readOnly={readOnly}
                onAddPayment={handleAddPayment}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default Payments;