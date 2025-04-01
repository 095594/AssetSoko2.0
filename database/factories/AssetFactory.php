<?php

namespace Database\Factories;

use App\Models\Asset;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class AssetFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Asset::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $categories = ['electronics', 'furniture', 'vehicles', 'art', 'jewelry', 'office equipment', 'Musical Instruments'];
        $conditions = ['new', 'used', 'refurbished'];
        $statuses = ['draft', 'active', 'sold', 'expired'];
        
        $basePrice = $this->faker->randomFloat(2, 100, 10000);
        $reservePrice = $basePrice * 1.2; // 20% higher than base price
        
        return [
            'user_id' => User::factory(),
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->paragraphs(3, true),
            'quantity' => $this->faker->numberBetween(1, 10),
            'category' => $this->faker->randomElement($categories),
            'condition' => $this->faker->randomElement($conditions),
            'base_price' => $basePrice,
            'reserve_price' => $reservePrice,
            'current_price' => $basePrice,
            'bid_count' => 0,
            'image_url' => null,
            'photos' => null,
            'status' => $this->faker->randomElement($statuses),
            'auction_start_time' => $this->faker->dateTimeBetween('-1 month', '+1 month'),
            'auction_end_time' => $this->faker->dateTimeBetween('+1 month', '+3 months'),
        ];
    }
}