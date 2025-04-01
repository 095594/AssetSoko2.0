<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class BidFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'amount' => $this->faker->randomFloat(2, 100, 10000),
            'bid_time' => now(),
            'status' => $this->faker->randomElement(['pending', 'accepted', 'rejected', 'outbid']),
        ];
    }
} 