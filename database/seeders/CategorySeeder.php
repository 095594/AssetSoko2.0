<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            'Electronics', 'Furniture', 'Office Supplies', 'Vehicles', 
            'Machinery', 'Real Estate', 'Medical Equipment'
        ];

        foreach ($categories as $category) {
            Category::create(['name' => $category]);
        }
    }
}
