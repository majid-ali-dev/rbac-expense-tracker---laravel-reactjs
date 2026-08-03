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
        // $defaultExpenses = [
        //     [
        //         'title' => 'Milk',
        //         'amount' => 250,
        //         'description' => 'Bought 5 liters of milk',
        //         'date' => now(),
        //     ],
        //     [
        //         'title' => 'Water',
        //         'amount' => 180,
        //         'description' => 'Bought drinking water',
        //         'date' => now(),
        //     ],
        //     [
        //         'title' => 'Eggs',
        //         'amount' => 420,
        //         'description' => 'Bought 3 dozen eggs',
        //         'date' => now(),
        //     ],
        //     [
        //         'title' => 'Potato',
        //         'amount' => 650,
        //         'description' => 'Bought 10 kg potatoes',
        //         'date' => now(),
        //     ],
        //     [
        //         'title' => 'Vegetables',
        //         'amount' => 890,
        //         'description' => 'Bought fresh vegetables',
        //         'date' => now(),
        //     ],
        // ];

        // foreach ($defaultExpenses as $expense) {
        //     Expense::create([
        //         'user_id' => 1,
        //         'category_id' => null,
        //         'title' => $expense['title'],
        //         'amount' => $expense['amount'],
        //         'description' => $expense['description'],
        //         'date' => $expense['date'],
        //     ]);
        // }
    }
}
