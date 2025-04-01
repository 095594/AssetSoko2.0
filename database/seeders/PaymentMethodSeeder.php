<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    public function run()
    {
        $methods = [
            ['name' => 'M-Pesa', 'details' => 'Pay via M-Pesa Till or Paybill'],
            ['name' => 'Bank Transfer', 'details' => 'Use IBAN or Swift Code'],
            ['name' => 'Credit Card', 'details' => 'Visa, MasterCard, AMEX'],
            ['name' => 'PayPal', 'details' => 'Secure online payment']
        ];

        foreach ($methods as $method) {
            PaymentMethod::create($method);
        }
    }
}
