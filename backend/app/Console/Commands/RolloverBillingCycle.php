<?php

namespace App\Console\Commands;

use App\Services\MonthlyRolloverService;
use Illuminate\Console\Command;

class RolloverBillingCycle extends Command
{
    protected $signature = 'billing:rollover';
    protected $description = 'Close the current month and start a new billing cycle (runs automatically on the 1st of every month)';

    public function handle(MonthlyRolloverService $service): int
    {
        $newCycle = $service->closeCurrentAndStartNext();

        $this->info("Billing cycle rolled over. New month: {$newCycle->label}");

        return self::SUCCESS;
    }
}
