<?php

namespace App\Http\Controllers;

use App\Models\BillingCycle;
use Illuminate\Http\Request;

abstract class Controller
{
    /**
     * Shared server-side guard for records that are NOT themselves tied to a
     * billing cycle (users, categories). The caller sends the cycle_id it is
     * currently viewing; if that cycle is closed (read-only), the mutation is
     * rejected with a 409 so the closed-cycle rule cannot be bypassed via a
     * direct API call.
     */
    protected function guardWritableCycle(Request $request): void
    {
        $cycleId = $request->integer('cycle_id') ?: null;

        if (!$cycleId) {
            return;
        }

        $cycle = BillingCycle::find($cycleId);

        if ($cycle) {
            $cycle->assertWritable();
        }
    }
}
