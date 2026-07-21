<?php

namespace Database\Seeders;

use App\Models\Expense;
use Illuminate\Database\Seeder;

class ExpenseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        // First create default categories
        $defaultExpenses = [
            ['title' => 'Milk', 'amount' => 50, 'description' => 'Bought 2 liters of milk', 'date' => now()->subDays(5)],
            ['title' => 'Water', 'amount' => 30, 'description' => 'Bought 10 liters of water', 'date' => now()->subDays(4)],
            ['title' => 'Eggs', 'amount' => 60, 'description' => 'Bought a dozen eggs', 'date' => now()->subDays(3)],
            ['title' => 'Potato', 'amount' => 115, 'description' => 'Bought 5 kg of potatoes', 'date' => now()->subDays(2)],
            ['title' => 'Sabzi', 'amount' => 285, 'description' => 'Bought fresh vegetables', 'date' => now()->subDay()],
        ];
        foreach ($defaultExpenses as $expense) {
            Expense::create([
                'user_id' => 1, // Assuming user with ID 3 exists
                'category_id' => null, // You can assign category IDs if needed
                'title' => $expense['title'],
                'amount' => $expense['amount'],
                'description' => $expense['description'],
                'date' => $expense['date'],
            ]);
        }
    }
}
