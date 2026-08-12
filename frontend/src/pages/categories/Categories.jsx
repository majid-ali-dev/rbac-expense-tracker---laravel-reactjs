import React, { useState, useEffect } from 'react';
import useCategoryStore from '../../store/categoryStore';
import useCycleStore from '../../store/cycleStore';
import CycleFilter from '../../components/common/CycleFilter';
import CategoryTable from '../../components/categories/CategoryTable';
import CategoryForm from '../../components/categories/CategoryForm';
import { showDeleteConfirm, showDeletedSuccess } from '../../utils/toast';

const Categories = () => {
    const {
        categories,
        loading,
        pagination,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        clearCategory,
        clearError,
    } = useCategoryStore();

    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const cycleId = useCycleStore((s) => s.getSelectedId('categories'));
    const fetchCycles = useCycleStore((s) => s.fetchCycles);
    // Closed (historical) cycles are read-only everywhere.
    const readOnly = useCycleStore((s) => s.isReadOnly('categories'));

    useEffect(() => {
        fetchCycles();
        return () => clearError();
    }, [fetchCycles]);

    // Reload category stats whenever the selected cycle changes
    useEffect(() => {
        fetchCategories(1, 10, cycleId);
    }, [cycleId]);

    const handleCreate = () => {
        if (readOnly) return;
        setEditingCategory(null);
        setShowForm(true);
    };

    const handleEdit = (category) => {
        if (readOnly) return;
        setEditingCategory(category);
        setShowForm(true);
    };

    const handleDelete = async (category) => {
        if (readOnly) return;
        const result = await showDeleteConfirm(
            'Are you sure?',
            `You won't be able to revert this! Category "${category.name}" will be deleted.`
        );

        if (result.isConfirmed) {
            const response = await deleteCategory(category.id, cycleId);
            if (response.success) {
                await showDeletedSuccess('Deleted!', 'Category has been deleted successfully.');
            }
        }
    };

    const handleFormSubmit = async (data) => {
        if (readOnly) return;
        setIsSubmitting(true);
        try {
            let result;
            if (editingCategory) {
                result = await updateCategory(editingCategory.id, data, cycleId);
            } else {
                result = await createCategory(data, cycleId);
            }

            if (result.success) {
                setShowForm(false);
                setEditingCategory(null);
                clearCategory();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingCategory(null);
        clearCategory();
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= (pagination?.last_page || 1)) {
            fetchCategories(page, pagination?.per_page || 10);
        }
    };

    if (loading && categories.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading categories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {showForm ? (
                <CategoryForm
                    category={editingCategory}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCancelForm}
                    loading={isSubmitting || loading}
                />
            ) : (
                <CategoryTable
                    categories={categories}
                    pagination={pagination}
                    cycleFilter={<CycleFilter moduleKey="categories" />}
                    readOnly={readOnly}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onCreate={handleCreate}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default Categories;