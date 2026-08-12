import React, { useEffect } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import useCycleStore from '../../store/cycleStore';

const formatRange = (cycle) => {
    const fmt = (d) => {
        if (!d) return '';
        return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };
    return `${fmt(cycle.start_date)} – ${fmt(cycle.end_date)}`;
};

/**
 * Reusable billing-cycle dropdown. Reads/writes the selected cycle for a
 * module (e.g. 'expenses', 'payments', 'users', 'categories', 'dashboard').
 * Defaults to the current open cycle; previous cycles are always selectable.
 */
const CycleFilter = ({ moduleKey, className = '' }) => {
    const cycles = useCycleStore((s) => s.cycles);
    const currentCycle = useCycleStore((s) => s.currentCycle);
    const fetchCycles = useCycleStore((s) => s.fetchCycles);
    const selectCycle = useCycleStore((s) => s.selectCycle);
    const selectedId = useCycleStore((s) => s.getSelectedId(moduleKey));

    useEffect(() => {
        if (cycles.length === 0) {
            fetchCycles();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (cycles.length === 0 && !currentCycle) {
        return null;
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <FaCalendarAlt className="text-gray-400" size={14} />
            <select
                value={selectedId || currentCycle?.id || ''}
                onChange={(e) => selectCycle(moduleKey, e.target.value ? Number(e.target.value) : null)}
                title="Select billing cycle"
                className="px-3 py-2 rounded-2xl border border-gray-300 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer max-w-[280px]"
            >
                {cycles.map((cycle) => (
                    <option key={cycle.id} value={cycle.id}>
                        {cycle.label} · {formatRange(cycle)}
                        {cycle.status === 'open' ? ' (Current)' : ''}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CycleFilter;
