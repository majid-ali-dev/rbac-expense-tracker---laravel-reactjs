import React, { useState } from 'react';
import { FaLock } from 'react-icons/fa';
import { billingCycleAPI } from '../../services/api';
import usePermission from '../../hooks/usePermission';
import { showDeleteConfirm, showDeletedSuccess, showError } from '../../utils/toast';

const CloseMonthButton = ({ cycleLabel, onClosed }) => {
    const [loading, setLoading] = useState(false);
    const { can } = usePermission();

    // Only users with the database permission may close the cycle
    if (!can('billing-cycle.close')) {
        return null;
    }

    const handleClose = async () => {
        const result = await showDeleteConfirm(
            'Close Current Cycle?',
            `${cycleLabel || 'This cycle'} will be closed and a new one will start. All members reset to unpaid.`
        );

        if (!result.isConfirmed) return;

        setLoading(true);
        try {
            const response = await billingCycleAPI.closeMonth();
            await showDeletedSuccess(
                'Cycle Closed',
                response.data.message || 'New cycle started'
            );
            onClosed?.();
        } catch (err) {
            console.error('Close error:', err);
            showError(err.response?.data?.message || 'Failed to close the cycle');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleClose}
            disabled={loading}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
            title="Close Current Cycle"
        >
            <FaLock size={18} />
            {loading && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
            )}
        </button>
    );
};

export default CloseMonthButton;