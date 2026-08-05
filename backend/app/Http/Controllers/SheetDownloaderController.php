<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class SheetDownloaderController extends Controller
{
    public function index(Request $request)
    {
        if (!Auth::user()->hasAnyPermission(['download-expense', 'view-expense'])) {
            return response()->json([
                'success' => false,
                'message' => 'Permission denied'
            ], 403);
        }

        // Get current cycle
        $cycle = \App\Models\BillingCycle::current();

        // Use cycle start as default "from", and TODAY as default "to"
        // (not the cycle end date) so the sheet matches the dashboard and the
        // expenses list even when the open cycle is overdue for closing.
        $from = $request->get('from', $cycle->start_date->format('Y-m-d'));
        $to = $request->get('to', Carbon::now()->format('Y-m-d'));

        $expenses = Expense::with(['user', 'category'])
            ->whereBetween('date', [$from, $to])
            ->latest('date')
            ->get();

        $totalExpenses = $expenses->sum('amount');

        $totalPaid = Payment::where('billing_cycle_id', $cycle->id)
            ->sum('paid_amount');

        $balance = $totalPaid - $totalExpenses;
        $remainingBalance = $balance < 0 ? abs($balance) : 0;
        $extraBalance = $balance > 0 ? $balance : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'expenses' => $expenses,
                'from' => $from,
                'to' => $to,
                'total_expenses' => $totalExpenses,
                'total_paid' => $totalPaid,
                'remaining_balance' => $remainingBalance,
                'extra_balance' => $extraBalance,
            ]
        ]);
    }

    public function download(Request $request)
    {
        if (!Auth::user()->hasAnyPermission(['download-expense', 'view-expense'])) {
            return response()->json([
                'success' => false,
                'message' => 'Permission denied'
            ], 403);
        }

        $from = $request->get('from', now()->startOfMonth()->format('Y-m-d'));
        $to = $request->get('to', now()->endOfMonth()->format('Y-m-d'));

        $expenses = Expense::with(['user', 'category'])
            ->whereBetween('date', [$from, $to])
            ->get();

        $totalExpenses = $expenses->sum('amount');

        $totalPaid = Payment::whereBetween('created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->sum('paid_amount');

        $balance = $totalPaid - $totalExpenses;
        $remainingBalance = $balance < 0 ? abs($balance) : 0;
        $extraBalance = $balance > 0 ? $balance : 0;

        $filename = 'expense-sheet-' . now()->format('Y-m-d-His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        return response()->stream(function () use ($expenses, $from, $to, $totalExpenses, $totalPaid, $remainingBalance, $extraBalance) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Header
            fputcsv($file, ["Expense Report"]);
            fputcsv($file, ["Period: " . Carbon::parse($from)->format('d M Y') . " to " . Carbon::parse($to)->format('d M Y')]);
            fputcsv($file, []);

            // Expenses Table
            fputcsv($file, ['Date', 'User', 'Category', 'Title', 'Amount', 'Description']);

            foreach ($expenses as $expense) {
                fputcsv($file, [
                    $expense->date->format('d/m/Y'),
                    $expense->user->name ?? '-',
                    $expense->category->name ?? '-',
                    $expense->title,
                    number_format($expense->amount, 2),
                    $expense->description ?? '',
                ]);
            }

            fputcsv($file, []);
            fputcsv($file, ['TOTAL EXPENSES', '', '', '', number_format($totalExpenses, 2), '']);
            fputcsv($file, ['TOTAL PAID', '', '', '', number_format($totalPaid, 2), '']);

            if ($extraBalance > 0) {
                fputcsv($file, ['EXTRA BALANCE', '', '', '', number_format($extraBalance, 2), '']);
            } else {
                fputcsv($file, ['REMAINING BALANCE', '', '', '', number_format($remainingBalance, 2), '']);
            }

            fclose($file);
        }, 200, $headers);
    }
}
