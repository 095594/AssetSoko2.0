<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Create an admin user
        // User::create([
        //     'name' => 'Admin User',
        //     'email' => 'admin@assetsoko.com',
        //     'password' => Hash::make('password'),
        //     'company_name' => 'Asset Soko Ltd.',
        //     'phone_number' => '0711223344',
        //     'address' => '123 Admin Street, Nairobi',
        //     'role' => 'admin',
        // ]);

        // Create a seller user
        User::create([
            'name' => 'Jane Seller',
            'email' => 'jane@assetsoko.com',
            'password' => Hash::make('password'),
            'company_name' => 'Jane’s Tech Resale',
            'phone_number' => '0722334455',
            'address' => 'Westlands, Nairobi',
            'role' => 'seller',
        ]);

        // Create a buyer user
        User::create([
            'name' => 'John Buyer',
            'email' => 'john@assetsoko.com',
            'password' => Hash::make('password'),
            'company_name' => 'Buyer Inc.',
            'phone_number' => '0733445566',
            'address' => 'Karen, Nairobi',
            'role' => 'buyer',
        ]);

        // Create more buyers and sellers using factories
        User::factory(5)->state(['role' => 'seller'])->create();
        User::factory(10)->state(['role' => 'buyer'])->create();
    }
}
