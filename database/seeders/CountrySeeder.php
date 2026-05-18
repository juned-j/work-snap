<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Country;

class CountrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Inserting sample countries
        Country::create([
            'name' => 'United States',
        ]);

        Country::create([
            'name' => 'Canada',
        ]);

        Country::create([
            'name' => 'United Kingdom',
        ]);

        Country::create([
            'name' => 'Germany',
        ]);

        Country::create([
            'name' => 'India',
        ]);

        Country::create([
            'name' => 'Singapore',
        ]);

        Country::create([
            'name' => 'France',
        ]);

        Country::create([
            'name' => 'Italy',
        ]);
    }
}
