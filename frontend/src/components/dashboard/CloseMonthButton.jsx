import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { FaLock } from 'react-icons/fa';
import { billingCycleAPI } from '../../services/api';
import usePermission from '../../hooks/usePermission';
import useCycleStore from '../../store/cycleStore';
import { showDeletedSuccess, showError } from '../../utils/toast';

const CloseMonthButton = ({ cycleLabel, cycleId, onClosed }) => {
    const [loading, setLoading] = useState(false);
    const { can } = usePermission();

    // Only users with the database permission may close the cycle
    if (!can('billing-cycle.close')) {
        return null;
    }

    // Local calendar date (YYYY-MM-DD). Using the UTC date here (toISOString)
    // can be a day behind the user's local date in timezones ahead of UTC,
    // which would pre-fill the modal with yesterday and silently close the
    // cycle on the wrong day.
    const localDate = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const handleClose = async () => {
        const cycle = useCycleStore.getState().currentCycle;
        const today = localDate(new Date());
        const defaultStart = cycle?.start_date ? cycle.start_date.slice(0, 10) : today;

        const result = await Swal.fire({
            title: `Close ${cycleLabel || 'Current Cycle'}?`,
            html: `
                <div style="text-align:left">
                    <p style="font-size:13px;color:#64748b;margin-bottom:16px;line-height:1.5">
                        Choose the date range that will be permanently closed and snapshotted.
                        Expenses/payments inside this range are saved to this cycle; anything after
                        the end date stays available in the next cycle.
                    </p>
                    <label for="swal-close-start" style="font-size:12px;font-weight:700;color:#334155">Start Date</label>
                    <input type="date" id="swal-close-start" class="swal2-input" value="${defaultStart}" max="${today}" />
                    <label for="swal-close-end" style="font-size:12px;font-weight:700;color:#334155;margin-top:12px;display:block">End Date (cycle close date)</label>
                    <input type="date" id="swal-close-end" class="swal2-input" value="${today}" max="${today}" />
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, close cycle',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            preConfirm: () => {
                const start = Swal.getPopup()?.querySelector('#swal-close-start')?.value;
                const end = Swal.getPopup()?.querySelector('#swal-close-end')?.value;

                if (!start || !end) {
                    Swal.showValidationMessage('Please select both dates');
                    return false;
                }
                if (start > end) {
                    Swal.showValidationMessage('Start date cannot be after the end date');
                    return false;
                }
                return { start_date: start, end_date: end };
            },
        });

        if (!result.isConfirmed || !result.value) return;

        setLoading(true);
        try {
            const { start_date, end_date } = result.value;
            const response = await billingCycleAPI.closeMonth({
                // Send the EXACT dates the user selected in the modal — nothing
                // else (no system/current date is ever substituted here).
                start_date,
                end_date,
                // Always identify the cycle being closed so the backend can
                // reject a stale/concurrent request that targets the wrong one.
                cycle_id: cycleId ?? cycle?.id,
            });
            await showDeletedSuccess(
                'Cycle Closed',
                `${response.data.message || 'New cycle started'}. Sealed range: ${start_date} to ${end_date}`
            );
            // Refresh the cycle list so every module's dropdown shows the new cycle
            await useCycleStore.getState().fetchCycles();
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
