<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'details'];

    // A payment method has many transactions
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
