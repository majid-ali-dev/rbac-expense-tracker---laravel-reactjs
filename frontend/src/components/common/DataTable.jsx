import React, { useState, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';
import { FaSearch, FaSort, FaSortUp, FaSortDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const DataTable = ({
    data = [],
    columns = [],
    title,
    onCreate,
    createButtonText = 'Create New',
    searchPlaceholder = 'Search...',
    itemsPerPage = 10,
    onPageChange,
    pageCount,
    currentPage: externalPage,
}) => {
    const [globalFilter, setGlobalFilter] = useState('');
    const [pagination, setPagination] = useState({
        pageIndex: externalPage ? externalPage - 1 : 0,
        pageSize: itemsPerPage,
    });

    // Update pagination when external page changes
    React.useEffect(() => {
        if (externalPage !== undefined) {
            setPagination(prev => ({
                ...prev,
                pageIndex: externalPage - 1,
            }));
        }
    }, [externalPage]);

    // Create table instance
    const table = useReactTable({
        data,
        columns,
        pageCount: pageCount || Math.ceil(data.length / itemsPerPage),
        state: {
            globalFilter,
            pagination,
        },
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: (updater) => {
            const newPagination = typeof updater === 'function'
                ? updater(pagination)
                : updater;
            setPagination(newPagination);
            if (onPageChange) {
                onPageChange(newPagination.pageIndex + 1);
            }
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: !!onPageChange,
    });

    const totalRows = data.length;
    const pageCount_ = table.getPageCount();
    const currentPage_ = table.getState().pagination.pageIndex + 1;

    // Handle search with debounce
    const handleSearch = (e) => {
        setGlobalFilter(e.target.value);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header with Search and Create Button */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    {title && (
                        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                    )}
                    <div className="flex-1 sm:flex-none relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={globalFilter ?? ''}
                            onChange={handleSearch}
                            className="w-full sm:w-72 pl-9 pr-4 py-2 border border-gray-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>
                {onCreate && (
                    <button
                        onClick={onCreate}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 text-sm font-semibold whitespace-nowrap"
                    >
                        + {createButtonText}
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-center align-middle">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className="bg-gray-50/80 border-b border-gray-200">
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="py-3.5 px-4 text-sm font-bold text-gray-600 uppercase tracking-wider"
                                        style={{ width: header.getSize() }}
                                    >
                                        {header.isPlaceholder ? null : (
                                            <div
                                                className={`flex items-center justify-center gap-1.5 ${header.column.getCanSort() ? 'cursor-pointer hover:text-gray-900' : ''
                                                    }`}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                {{
                                                    asc: <FaSortUp className="text-blue-600" size={12} />,
                                                    desc: <FaSortDown className="text-blue-600" size={12} />,
                                                }[header.column.getIsSorted()] ?? (
                                                        header.column.getCanSort() && <FaSort className="text-gray-400" size={12} />
                                                    )}
                                            </div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="py-12 text-center text-gray-500">
                                    <p className="text-lg font-medium">No data found</p>
                                    <p className="text-sm mt-1">Try adjusting your search or filter</p>
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="py-3.5 px-4 text-sm text-gray-700">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalRows > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t border-gray-200 gap-3">
                    <div className="text-sm text-gray-600 order-2 sm:order-1">
                        Showing {table.getState().pagination.pageIndex * itemsPerPage + 1} to{' '}
                        {Math.min(
                            (table.getState().pagination.pageIndex + 1) * itemsPerPage,
                            totalRows
                        )} of {totalRows} results
                        {globalFilter && (
                            <span className="ml-2 text-xs text-gray-400">
                                (filtered)
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 order-1 sm:order-2">
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="p-2 border border-gray-300 rounded-2xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                        >
                            <FaChevronLeft size={14} />
                        </button>
                        <span className="px-4 py-2 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-600/20 min-w-[40px] text-center">
                            {currentPage_}
                        </span>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="p-2 border border-gray-300 rounded-2xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                        >
                            <FaChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;