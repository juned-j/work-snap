<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;
class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Category::create([
            'name' => 'Electronics',
            'CategoryCode' => 'ELEC001', // Unique code
        ]);

        Category::create([
            'name' => 'Furniture',
            'CategoryCode' => 'FURN002',
        ]);

        Category::create([
            'name' => 'Clothing',
            'CategoryCode' => 'CLOT003',
        ]);

        Category::create([
            'name' => 'FMCG',
            'CategoryCode' => 'FMCG004',
        ]);

        // Add more categories as required
        // You can also use a factory to create more data
        // Category::factory()->count(10)->create(); 
    }
}
