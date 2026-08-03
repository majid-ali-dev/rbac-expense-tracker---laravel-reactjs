import React, { useState, useEffect } from 'react';
import { FaCalendarPlus, FaEdit, FaTrash } from 'react-icons/fa';
import api from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';

const CycleManager = () => {
    const [cycles, setCycles] = useState([]);
    const [currentCycle, setCurrentCycle] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchCycles();
    }, []);

    const fetchCycles = async () => {
        try {
            const response = await api.get('/billing-cycle/history');
            setCycles(response.data.data.data || []);

            const currentRes = await api.get('/billing-cycle/current');
            setCurrentCycle(currentRes.data.data);
        } catch (error) {
            console.error('Error fetching cycles:', error);
        }
    };

    const handleCreateCustomCycle = async () => {
        if (!startDate || !endDate) {
            showError('Please select start and end dates');
            return;
        }

        try {
            const response = await api.post('/billing-cycle/custom', {
                start_date: startDate,
                end_date: endDate,
            });

            showSuccess('Custom cycle created successfully');
            setShowForm(false);
            fetchCycles();
        } catch (error) {
            showError('Failed to create custom cycle');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-extrabold text-gray-900">Billing Cycle Management</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Current: <span className="font-semibold text-blue-600">{currentCycle?.label || 'No active cycle'}</span>
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
                >
                    <FaCalendarPlus size={14} />
                    Create Custom Cycle
                </button>
            </div>

            {/* Custom Cycle Form */}
            {showForm && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleCreateCustomCycle}
                                className="w-full px-4 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all"
                            >
                                Create Cycle
                            </button>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                        💡 You can set any start and end date. Cycle can start on 2nd, 3rd, 5th, or any day of the month.
                    </p>
                </div>
            )}

            {/* Cycle History */}
            <div className="overflow-x-auto">
                <table className="w-full text-center align-middle">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="py-2.5 px-4 text-xs font-bold text-gray-600 uppercase">Cycle</th>
                            <th className="py-2.5 px-4 text-xs font-bold text-gray-600 uppercase">Start Date</th>
                            <th className="py-2.5 px-4 text-xs font-bold text-gray-600 uppercase">End Date</th>
                            <th className="py-2.5 px-4 text-xs font-bold text-gray-600 uppercase">Status</th>
                            <th className="py-2.5 px-4 text-xs font-bold text-gray-600 uppercase">Closed At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cycles.map((cycle) => (
                            <tr key={cycle.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-2.5 px-4 text-sm font-medium text-gray-900">{cycle.label}</td>
                                <td className="py-2.5 px-4 text-sm text-gray-700">
                                    {new Date(cycle.start_date).toLocaleDateString('en-GB')}
                                </td>
                                <td className="py-2.5 px-4 text-sm text-gray-700">
                                    {new Date(cycle.end_date).toLocaleDateString('en-GB')}
                                </td>
                                <td className="py-2.5 px-4">
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${cycle.status === 'open'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {cycle.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="py-2.5 px-4 text-sm text-gray-700">
                                    {cycle.closed_at ? new Date(cycle.closed_at).toLocaleDateString('en-GB') : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CycleManager;