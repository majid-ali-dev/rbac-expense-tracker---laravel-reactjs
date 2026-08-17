import { create } from 'zustand';
import { billingCycleAPI } from '../services/api';
import { showError } from '../utils/toast';

/**
 * Global billing-cycle context.
 *
 * - `cycles`/`currentCycle`: the full cycle list + the open cycle.
 * - `selectedCycleId`: the ONE cycle selected across the whole application
 *   (Dashboard, Expenses, Payments, Users, Categories, ...). null means "the
 *   current open cycle" (the default on login). Selecting a cycle anywhere —
 *   the Billing Cycles module or any page's cycle dropdown — updates it
 *   globally, so every module shows that cycle's data.
 */
const useCycleStore = create((set, get) => ({
    cycles: [],
    currentCycle: null,
    selectedCycleId: null,
    loading: false,
    error: null,

    fetchCycles: async () => {
        set({ loading: true, error: null });
        try {
            const response = await billingCycleAPI.getAll();
            const cycles = response.data.data || [];
            const current = cycles.find((c) => c.status === 'open') || cycles[0] || null;

            // If the globally selected cycle no longer exists, fall back to the
            // current cycle (the default).
            let selectedCycleId = get().selectedCycleId;
            if (selectedCycleId && !cycles.some((c) => c.id === Number(selectedCycleId))) {
                selectedCycleId = null;
            }

            set({
                cycles,
                currentCycle: current,
                selectedCycleId,
                loading: false,
            });
            return { success: true, cycles, current };
        } catch (error) {
            // 403 = the user lacks billing-cycle.view — they cannot list or
            // select cycles, so the app silently defaults to the current open
            // cycle everywhere. No error toast: this is the expected state for
            // users without the permission, not a failure.
            if (error.response?.status === 403) {
                set({ cycles: [], currentCycle: null, loading: false });
                return { success: false, error: null };
            }

            const message = error.response?.data?.message || 'Failed to load billing cycles';
            set({ loading: false, error: message });
            showError(message);
            return { success: false, error: message };
        }
    },

    /**
     * Cycle id currently shown across the app (defaults to the current cycle).
     * moduleKey is kept for API compatibility with existing callers.
     */
    getSelectedId: (moduleKey) => {
        const { selectedCycleId, currentCycle } = get();
        return selectedCycleId || currentCycle?.id || null;
    },

    /** Resolve a full cycle object from the store by id. */
    getCycleById: (cycleId) => {
        if (!cycleId) return null;
        return get().cycles.find((c) => c.id === Number(cycleId)) || null;
    },

    /**
     * Closed (historical) cycles are fully editable when selected — editing an
     * old cycle works exactly like editing the current one. Write permissions
     * are enforced per module (expenses.create, payments.create, ...), so there
     * is no separate read-only state.
     */
    isReadOnly: (moduleKey) => false,

    /**
     * Set the globally selected cycle across the whole application.
     * null resets to the current open cycle (the default).
     */
    selectCycle: (moduleKey, cycleId) =>
        set({ selectedCycleId: cycleId ? Number(cycleId) : null }),

    resetSelections: () => set({ selectedCycleId: null }),
}));

export default useCycleStore;
