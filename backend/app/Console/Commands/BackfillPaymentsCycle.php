<?php

namespace App\Console\Commands;

use App\Models\BillingCycle;
use App\Models\Payment;
use Illuminate\Console\Command;

class BackfillPaymentsCycle extends Command
{
    protected $signature = 'billing:backfill-payments';
    protected $description = 'One-time fix: attach payments created before billing cycles existed to the current cycle';

    public function handle(): int
    {
        $cycle = BillingCycle::current();

        $count = Payment::whereNull('billing_cycle_id')->update([
            'billing_cycle_id' => $cycle->id,
        ]);

        $this->info("Backfilled {$count} old payment(s) into cycle: {$cycle->label}");

        return self::SUCCESS;
    }
}
