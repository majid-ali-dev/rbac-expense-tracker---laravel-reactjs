import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usePaymentStore from '../../store/paymentStore';
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

    useEffect(() => {
        if (id && can('payments.create')) {
            fetchAddPayment(id);
        }
        return () => clearUser();
    }, [id]);

    // Action-level guard: only users with payments.create may add payments.
    if (!can('payments.create')) {
        return <AccessDenied />;
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