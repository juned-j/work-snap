<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => 'super_admin',
                'label' => 'Super Admin',
            ],
            [
                'name' => 'admin',
                'label' => 'Admin',
            ],
            [
                'name' => 'manager',
                'label' => 'Manager',
            ],
            [
                'name' => 'employee',
                'label' => 'Employee',
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['name' => $role['name']],
                $role
            );
        }
    }
}