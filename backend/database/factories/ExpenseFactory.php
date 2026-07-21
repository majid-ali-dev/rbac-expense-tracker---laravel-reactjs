<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExpenseFactory extends Factory
{
    protected $model = Expense::class;

    public function definition()
    {
        return [
            'user_id' => User::inRandomOrder()->first()->id ?? 1,
            'title' => $this->faker->word(),
            'amount' => $this->faker->randomFloat(2, 10, 500),
            'date' => $this->faker->date(),
            'description' => $this->faker->sentence(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
