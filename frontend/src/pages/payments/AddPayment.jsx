import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usePaymentStore from '../../store/paymentStore';
import useCycleStore from '../../store/cycleStore';
import AddPaymentForm from '../../components/payments/AddPaymentForm';
import AccessDenied from '../../components/common/AccessDenied';
import usePermission from '../../hooks/usePermission';
import { showDeleteConfirm, showDeletedSuccess } from '../../utils/toast';

const AddPayment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { can } = usePermission();
    const {
        user,
        loading,
        fetchAddPayment,
        submitPayment,
        clearUser,
        clearError,
    } = usePaymentStore();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const cycles = useCycleStore((s) => s.cycles);
    const cycleId = useCycleStore((s) => s.getSelectedId('payments'));
    const selectedCycle = cycles.find((c) => c.id === cycleId) || null;
    const readOnly = selectedCycle?.status === 'closed';

    useEffect(() => {
        useCycleStore.getState().fetchCycles();
    }, []);

    useEffect(() => {
        if (id && can('payments.create') && !readOnly) {
            fetchAddPayment(id, cycleId);
        }
        return () => clearUser();
    }, [id, cycleId, readOnly]);

    // Action-level guard: only users with payments.create may add payments.
    if (!can('payments.create')) {
        return <AccessDenied />;
    }

    // Payments can only be recorded into the current/open cycle — closed
    // (historical) cycles are strictly read-only.
    if (readOnly) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-10 text-center max-w-lg mx-auto mt-10">
                <div className="text-5xl mb-4">🔒</div>
                <h2 className="text-xl font-bold text-gray-900">Cycle Closed</h2>
                <p className="text-gray-500 mt-2 text-sm">
                    "{selectedCycle?.label}" is closed and read-only. Payments can only be
                    recorded in the current open cycle.
                </p>
                <button
                    onClick={() => navigate('/payments')}
                    className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all"
                >
                    Back to Payments
                </button>
            </div>
        );
    }

    const handleSubmit = async (amount) => {
        setIsSubmitting(true);
        try {
            const result = await submitPayment(id, amount);
            if (result.success) {
                navigate('/payments');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading && !user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading user details...</p>
                </div>
            </div>
        );
    }

    return (
        <AddPaymentForm
            user={user}
            onSubmit={handleSubmit}
            loading={isSubmitting || loading}
            onPaymentDeleted={() => id && fetchAddPayment(id)}
        />
    );
};

export default AddPayment;