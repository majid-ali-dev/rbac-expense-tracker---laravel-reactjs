import { create } from 'zustand';
import { billingCycleAPI } from '../services/api';
import { showError } from '../utils/toast';

export const CYCLE_MODULES = ['dashboard', 'users', 'categories', 'expenses', 'payments'];

const defaultSelections = () => Object.fromEntries(CYCLE_MODULES.map((m) => [m, null]));

/**
 * Global billing-cycle context.
 *
 * - `cycles`/`currentCycle`: the full cycle list + the open cycle.
 * - `selections[moduleKey]`: which cycle each module is showing. null means
 *   "current cycle" (the default). Selections persist until the user changes
 *   them explicitly, so a cycle picked on an index page carries over to its
 *   child pages (view, add, etc.).
 */
const useCycleStore = create((set, get) => ({
    cycles: [],
    currentCycle: null,
    loading: false,
    error: null,
    selections: defaultSelections(),

    fetchCycles: async () => {
        set({ loading: true, error: null });
        try {
            const response = await billingCycleAPI.getAll();
            const cycles = response.data.data || [];
            const current = cycles.find((c) => c.status === 'open') || cycles[0] || null;

            set({
                cycles,
                currentCycle: current,
                loading: false,
            });
            return { success: true, cycles, current };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to load billing cycles';
            set({ loading: false, error: message });
            showError(message);
            return { success: false, error: message };
        }
    },

    /** Cycle id a module is currently showing (defaults to the current cycle). */
    getSelectedId: (moduleKey) => {
        const { selections, currentCycle } = get();
        return selections[moduleKey] || currentCycle?.id || null;
    },

    /** Resolve a full cycle object from the store by id. */
    getCycleById: (cycleId) => {
        if (!cycleId) return null;
        return get().cycles.find((c) => c.id === Number(cycleId)) || null;
    },

    /**
     * Whether the cycle a module is currently showing is closed. Closed
     * (historical) cycles are read-only everywhere — pages use this to hide
     * create/edit/delete actions (Payments, Users, Categories, Expenses).
     */
    isReadOnly: (moduleKey) => {
        const cycle = get().getCycleById(get().getSelectedId(moduleKey));
        return cycle ? cycle.status === 'closed' : false;
    },

    /** Explicitly switch the module to another cycle (null = current cycle). */
    selectCycle: (moduleKey, cycleId) =>
        set((state) => ({
            selections: { ...state.selections, [moduleKey]: cycleId || null },
        })),

    resetSelections: () => set({ selections: defaultSelections() }),
}));

export default useCycleStore;
