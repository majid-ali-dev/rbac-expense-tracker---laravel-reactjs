import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import {
    FaCalendarAlt,
    FaCalendarPlus,
    FaEdit,
    FaLock,
    FaCheckCircle,
    FaRegCircle,
} from 'react-icons/fa';
import { billingCycleAPI } from '../../services/api';
import useCycleStore from '../../store/cycleStore';
import usePermission from '../../hooks/usePermission';
import { showSuccess, showError, showDeletedSuccess } from '../../utils/toast';

const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Local calendar date (YYYY-MM-DD) — avoids the UTC off-by-one of toISOString().
const localDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

/**
 * Billing / Close Cycles module.
 *
 * Lists every billing cycle (open + historical), lets any permitted user pick
 * the GLOBAL cycle shown across the whole app, and lets admins create, edit and
 * close cycles. Replaces the old dashboard "Close Cycle" button.
 */
const BillingCycles = () => {
    const { can } = usePermission();
    const cycles = useCycleStore((s) => s.cycles);
    const currentCycle = useCycleStore((s) => s.currentCycle);
    const selectedCycleId = useCycleStore((s) => s.selectedCycleId);
    const fetchCycles = useCycleStore((s) => s.fetchCycles);
    const selectCycle = useCycleStore((s) => s.selectCycle);

    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingCycle, setEditingCycle] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchCycles();
    }, [fetchCycles]);

    const handleSelect = async (cycle) => {
        // Selecting a cycle makes it the global active cycle across the whole
        // application (Dashboard, Expenses, Payments, Users, Categories, ...).
        selectCycle('billing-cycles', cycle.id);
        showSuccess(`"${cycle.label}" is now the selected cycle across the app`);
    };

    const openCreateForm = () => {
        setEditingCycle(null);
        setStartDate('');
        setEndDate('');
        setShowForm(true);
    };

    const openEditForm = (cycle) => {
        setEditingCycle(cycle);
        setStartDate(cycle.start_date ? cycle.start_date.slice(0, 10) : '');
        setEndDate(cycle.end_date ? cycle.end_date.slice(0, 10) : '');
        setShowForm(true);
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        if (!startDate || !endDate) {
            showError('Please select both start and end dates');
            return;
        }
        if (startDate > endDate) {
            showError('Start date cannot be after the end date');
            return;
        }

        setLoading(true);
        try {
            if (editingCycle) {
                const response = await billingCycleAPI.updateCycle(editingCycle.id, {
                    start_date: startDate,
                    end_date: endDate,
                });
                showSuccess(response.data.message || 'Billing cycle updated successfully');
            } else {
                const response = await billingCycleAPI.createCycle({
                    start_date: startDate,
                    end_date: endDate,
                });
                showSuccess(response.data.message || 'Billing cycle created successfully');
            }
            setShowForm(false);
            setEditingCycle(null);
            await fetchCycles();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to save billing cycle');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = async (cycle) => {
        const today = localDate(new Date());
        const defaultStart = cycle?.start_date ? cycle.start_date.slice(0, 10) : today;

        const result = await Swal.fire({
            title: `Close ${cycle?.label || 'Current Cycle'}?`,
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
                // Send the EXACT dates selected in the modal — nothing else.
                start_date,
                end_date,
                cycle_id: cycle.id,
            });
            await showDeletedSuccess(
                'Cycle Closed',
                `${response.data.message || 'New cycle started'}. Sealed range: ${start_date} to ${end_date}`
            );
            await fetchCycles();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to close the cycle');
        } finally {
            setLoading(false);
        }
    };

    const openCycle = currentCycle;
    const selectedCycle = cycles.find((c) => c.id === Number(selectedCycleId)) || null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                            <FaCalendarAlt className="text-blue-600" size={22} />
                            Billing Cycles
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Create, close and manage billing cycles. Selecting a cycle makes it the
                            active cycle across the whole application.
                        </p>
                    </div>
                    {can('billing-cycle.create') && (
                        <button
                            onClick={openCreateForm}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                        >
                            <FaCalendarPlus size={15} />
                            Create Cycle
                        </button>
                    )}
                </div>

                {/* Current + selected summary */}
                <div className="mt-4 flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        <FaCheckCircle size={13} />
                        Current: {openCycle?.label || 'No active cycle'}
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        <FaRegCircle size={13} />
                        Selected across app:{' '}
                        {selectedCycle
                            ? `${selectedCycle.label} (${selectedCycle.status})`
                            : (openCycle?.label || 'No active cycle')}
                    </span>
                </div>
            </div>

            {/* Create / Edit form */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                        {editingCycle ? `Edit Cycle: ${editingCycle.label}` : 'Create New Cycle'}
                    </h2>
                    <form onSubmit={handleSubmitForm} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : (editingCycle ? 'Update Cycle' : 'Create Cycle')}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); setEditingCycle(null); }}
                                className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-2xl hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Cycles table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-center align-middle">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Cycle</th>
                                <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Start Date</th>
                                <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">End Date</th>
                                <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Closed At</th>
                                <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Selection</th>
                                <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cycles.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-gray-500">
                                        No billing cycles found.
                                    </td>
                                </tr>
                            )}
                            {cycles.map((cycle) => {
                                const isSelected = cycle.id === Number(selectedCycleId);
                                const isOpen = cycle.status === 'open';
                                return (
                                    <tr key={cycle.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                                            {cycle.label}
                                            {isOpen && (
                                                <span className="ml-2 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                                                    ACTIVE
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700">{formatDate(cycle.start_date)}</td>
                                        <td className="py-3 px-4 text-sm text-gray-700">{formatDate(cycle.end_date)}</td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                                                isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {isOpen ? 'OPEN' : 'CLOSED'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700">
                                            {cycle.closed_at ? formatDate(cycle.closed_at) : '-'}
                                        </td>
                                        <td className="py-3 px-4">
                                            {isSelected ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                                                    <FaCheckCircle size={12} /> Selected
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">Not selected</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {!isSelected && (
                                                    <button
                                                        onClick={() => handleSelect(cycle)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all"
                                                        title="Use this cycle everywhere in the app"
                                                    >
                                                        <FaRegCircle size={12} />
                                                        Select
                                                    </button>
                                                )}
                                                {can('billing-cycle.edit') && (
                                                    <button
                                                        onClick={() => openEditForm(cycle)}
                                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-all hover:scale-105"
                                                        title="Edit cycle dates"
                                                    >
                                                        <FaEdit size={15} />
                                                    </button>
                                                )}
                                                {isOpen && can('billing-cycle.close') && (
                                                    <button
                                                        onClick={() => handleClose(cycle)}
                                                        disabled={loading}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-50"
                                                        title="Close this cycle and start the next one"
                                                    >
                                                        <FaLock size={12} />
                                                        Close
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <p className="text-xs text-gray-500">
                💡 Selecting an old/closed cycle shows its data on the Dashboard, Expenses, Payments,
                Users and Categories pages — and any records added or edited while it is selected are
                saved to that cycle.
            </p>
        </div>
    );
};

export default BillingCycles;
