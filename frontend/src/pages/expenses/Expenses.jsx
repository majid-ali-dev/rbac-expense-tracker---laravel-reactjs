import React, { useState, useEffect } from 'react';
import useExpenseStore from '../../store/expenseStore';
import useCycleStore from '../../store/cycleStore';
import CycleFilter from '../../components/common/CycleFilter';
import ExpenseTable from '../../components/expenses/ExpenseTable';
import ExpenseForm from '../../components/expenses/ExpenseForm';
import ExpenseView from '../../components/expenses/ExpenseView';
import { showDeleteConfirm, showDeletedSuccess } from '../../utils/toast';

const Expenses = () => {
    const {
        expenses,
        categories,
        loading,
        pagination,
        fetchExpenses,
        fetchCategories,
        createExpense,
        updateExpense,
        deleteExpense,
        clearExpense,
        clearError,
    } = useExpenseStore();

    const [showForm, setShowForm] = useState(false);
    const [showView, setShowView] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [viewingExpense, setViewingExpense] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const cycleId = useCycleStore((s) => s.getSelectedId('expenses'));
    const fetchCycles = useCycleStore((s) => s.fetchCycles);
    // Closed (historical) cycles are read-only everywhere.
    const readOnly = useCycleStore((s) => s.isReadOnly('expenses'));

    useEffect(() => {
        fetchCycles();
        return () => clearError();
    }, [fetchCycles]);

    // Reload the list whenever the selected cycle changes (default: current)
    useEffect(() => {
        fetchExpenses(1, 10, cycleId);
        fetchCategories();
    }, [cycleId]);

    const handleCreate = () => {
        if (readOnly) return;
        setEditingExpense(null);
        setShowForm(true);
        setShowView(false);
    };

    const handleView = (expense) => {
        setViewingExpense(expense);
        setShowView(true);
        setShowForm(false);
    };

    const handleEdit = (expense) => {
        if (readOnly) return;
        setEditingExpense(expense);
        setShowForm(true);
        setShowView(false);
    };

    const handleDelete = async (expense) => {
        if (readOnly) return;
        const result = await showDeleteConfirm(
            'Are you sure?',
            `You won't be able to revert this! Expense "${expense.title}" will be deleted.`
        );

        if (result.isConfirmed) {
            const response = await deleteExpense(expense.id, cycleId);
            if (response.success) {
                await showDeletedSuccess('Deleted!', 'Expense has been deleted successfully.');
            }
        }
    };

    const handleFormSubmit = async (data) => {
        if (readOnly) return;
        setIsSubmitting(true);
        try {
            let result;
            if (editingExpense) {
                result = await updateExpense(editingExpense.id, data, cycleId);
            } else {
                result = await createExpense(data, cycleId);
            }

            if (result.success) {
                setShowForm(false);
                setEditingExpense(null);
                clearExpense();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingExpense(null);
        clearExpense();
    };

    const handleBackFromView = () => {
        setShowView(false);
        setViewingExpense(null);
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= (pagination?.last_page || 1)) {
            fetchExpenses(page, pagination?.per_page || 10);
        }
    };

    if (loading && expenses.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading expenses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {showView && viewingExpense ? (
                <ExpenseView expense={viewingExpense} onBack={handleBackFromView} />
            ) : showForm ? (
                <ExpenseForm
                    expense={editingExpense}
                    categories={categories}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCancelForm}
                    loading={isSubmitting || loading}
                />
            ) : (
                <ExpenseTable
                    expenses={expenses}
                    pagination={pagination}
                    cycleFilter={<CycleFilter moduleKey="expenses" />}
                    readOnly={readOnly}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onCreate={handleCreate}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default Expenses;