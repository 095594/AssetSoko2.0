<?php

namespace Database\Seeders;

use App\Models\Asset;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

class AssetSeeder extends Seeder
{
    public function run()
    {
        // Ensure the public storage directory for assets exists
        Storage::disk('public')->makeDirectory('assets');

        // Get or create a default user
        $user = User::firstOrCreate(
            ['email' => 'user@assetsoko.com'],
            [
                'name' => 'Default User',
                'password' => bcrypt('password'),
                'company_name' => 'Default Company',
                'phone_number' => '0712345678',
                'address' => 'Nairobi, Kenya',
            ]
        );

        // List of local images for seeding
        $imageFiles = [
            'bass_guitar.jpg',
            'office_furniture.jpg',
            'chairs.jpg',
            'sofa.jpg',
            'desktop_computer.jpg',
            'officedesk.jpg',
            'mouse.jpg',
            'printer.jpg',
            'laptop.jpg',
            'projector.jpg'
        ];

        // Ensure images exist in the storage directory
        foreach ($imageFiles as $imageFile) {
            $sourcePath = public_path('seed_images/' . $imageFile);
            $destinationPath = 'assets/' . $imageFile;

            if (file_exists($sourcePath)) {
                Storage::disk('public')->put($destinationPath, file_get_contents($sourcePath));
            }
        }

        // Sample assets
        $assets = [
            [
                'name' => 'Bass Guitar Fender Jazz',
                'description' => 'High-quality bass guitar for professional musicians.',
                'condition' => 'used',
                'category' => 'Musical Instruments',
                'quantity' => 1,
                'image_url' => 'assets/bass_guitar.jpg',
                'photos' => json_encode(['assets/bass_guitar.jpg']),
                'base_price' => 150.00,
                'reserve_price' => 250.00,
                'auction_start_time' => Carbon::now(),
                'auction_end_time' => Carbon::now()->addDays(7),
                'user_id' => $user->id,
                'status' => 'active',
            ],
            [
                'name' => 'Office Desk',
                'description' => 'Ergonomic office desk for modern workplaces.',
                'condition' => 'new',
                'category' => 'Furniture',
                'quantity' => 20,
                'image_url' => 'assets/officedesk.jpg',
                'photos' => json_encode(['assets/officedesk.jpg']),
                'base_price' => 200.00,
                'reserve_price' => 300.00,
                'auction_start_time' => Carbon::now(),
                'auction_end_time' => Carbon::now()->addDays(5),
                'user_id' => $user->id,
                'status' => 'active',
            ],
            [
                'name' => 'Projector Epson EB-U05',
                'description' => 'High-quality projector for presentations.',
                'condition' => 'refurbished',
                'category' => 'Electronics',
                'quantity' => 5,
                'image_url' => 'assets/projector.jpg',
                'photos' => json_encode(['assets/projector.jpg']),
                'base_price' => 600.00,
                'reserve_price' => 800.00,
                'auction_start_time' => Carbon::now(),
                'auction_end_time' => Carbon::now()->addDays(3),
                'user_id' => $user->id,
                'status' => 'active',
            ],
            [
                'name' => 'Dell XPS 13 Laptop',
                'description' => 'High-performance laptop for business and gaming.',
                'condition' => 'used',
                'category' => 'Computers',
                'quantity' => 10,
                'image_url' => 'assets/laptop.jpg',
                'photos' => json_encode(['assets/laptop.jpg']),
                'base_price' => 1200.00,
                'reserve_price' => 1500.00,
                'auction_start_time' => Carbon::now(),
                'auction_end_time' => Carbon::now()->addDays(10),
                'user_id' => $user->id,
                'status' => 'active',
            ],
            [
                'name' => 'HP LaserJet Printer',
                'description' => 'Reliable printer for office and home use.',
                'condition' => 'new',
                'category' => 'Office Equipment',
                'quantity' => 15,
                'image_url' => 'assets/printer.jpg',
                'photos' => json_encode(['assets/printer.jpg']),
                'base_price' => 250.00,
                'reserve_price' => 400.00,
                'auction_start_time' => Carbon::now(),
                'auction_end_time' => Carbon::now()->addDays(6),
                'user_id' => $user->id,
                'status' => 'active',
            ]
        ];

        // Insert sample assets into database
        foreach ($assets as $asset) {
            Asset::create($asset);
        }

        // Generate additional random assets using factories
        Asset::factory(20)->create([
            'user_id' => $user->id,
            'image_url' => 'assets/' . $imageFiles[array_rand($imageFiles)],
            'photos' => json_encode(['assets/' . $imageFiles[array_rand($imageFiles)]]),
            'status' => 'active',
            'auction_start_time' => Carbon::now(),
            'auction_end_time' => Carbon::now()->addDays(7),
        ]);
    }
}
