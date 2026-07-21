<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run()
    {
        // First create default categories
        $defaultCategories = ['Milk', 'Water', 'Eggs', 'Potato', 'Sabzi', 'Onion', 'Tomato', 'Rice', 'Chicken'];

        foreach ($defaultCategories as $cat) {
            Category::create([
                'name' => $cat,
            ]);
        }

        // Create 1 more random categories
        Category::factory(1)->create();
    }
}
