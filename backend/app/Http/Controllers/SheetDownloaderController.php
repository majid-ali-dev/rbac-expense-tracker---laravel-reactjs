<?php

namespace App\Http\Controllers;

use App\Models\BillingCycle;
use App\Models\Expense;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class SheetDownloaderController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        [$cycle, $from, $to] = $this->resolveRange($request);

        $expenseQuery = $user->applyOwnAllScope(Expense::with(['user', 'category']), 'expenses.view-all');

        if ($request->integer('cycle_id')) {
            $expenseQuery->inCycle($cycle);
        }

        $expenses = $expenseQuery
            ->whereBetween('date', [$from, $to])
            ->latest('date')
            ->get();

        $totalExpenses = $expenses->sum('amount');

        $totalPaid = $user->applyOwnAllScope(Payment::query(), 'payments.view-all')
            ->where('billing_cycle_id', $cycle->id)
            ->sum('paid_amount');

        $balance = $totalPaid - $totalExpenses;
        $remainingBalance = $balance < 0 ? abs($balance) : 0;
        $extraBalance = $balance > 0 ? $balance : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'expenses' => $expenses,
                'cycle_id' => $cycle->id,
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
        $user = Auth::user();

        [$cycle, $from, $to] = $this->resolveRange($request);

        $expenseQuery = $user->applyOwnAllScope(Expense::with(['user', 'category']), 'expenses.view-all');

        if ($request->integer('cycle_id')) {
            $expenseQuery->inCycle($cycle);
        }

        $expenses = $expenseQuery
            ->whereBetween('date', [$from, $to])
            ->get();

        $totalExpenses = $expenses->sum('amount');

        // Payments are attributed by their permanent billing_cycle_id so the
        // export always matches the selected cycle.
        $totalPaid = $user->applyOwnAllScope(Payment::query(), 'payments.view-all')
            ->where('billing_cycle_id', $cycle->id)
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

    /**
     * Resolve the export range. When a cycle_id is supplied the default range
     * is that cycle's sealed range (start -> end for closed cycles, start ->
     * today for the open one). Explicit from/to always win so existing page
     * level date filters keep working.
     */
    private function resolveRange(Request $request): array
    {
        $cycleId = $request->integer('cycle_id') ?: null;
        $cycle = $cycleId ? BillingCycle::find($cycleId) : BillingCycle::current();
        $cycle = $cycle ?: BillingCycle::current();

        $isClosed = $cycle->status === 'closed';
        $defaultFrom = $cycle->start_date->format('Y-m-d');
        $defaultTo = $isClosed ? $cycle->end_date->format('Y-m-d') : Carbon::now()->format('Y-m-d');

        $from = $request->get('from', $defaultFrom);
        $to = $request->get('to', $defaultTo);

        return [$cycle, $from, $to];
    }
}
