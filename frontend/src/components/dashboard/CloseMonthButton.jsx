import React, { useState } from 'react';
import { FaLock } from 'react-icons/fa';
import { billingCycleAPI } from '../../services/api';
import { showDeleteConfirm, showDeletedSuccess, showError } from '../../utils/toast';

const CloseMonthButton = ({ cycleLabel, onClosed }) => {
    const [loading, setLoading] = useState(false);

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
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-800/20"
        >
            <FaLock size={12} />
            {loading ? 'Closing...' : 'Close Current Cycle'}
        </button>
    );
};

export default CloseMonthButton;