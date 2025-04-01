<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'buyer_id', 'seller_id', 'asset_id', 
        'amount', 'payment_method_id', 'status'
    ];

    // A transaction belongs to a buyer
    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    // A transaction belongs to a seller
    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    // A transaction belongs to an asset
    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    // A transaction belongs to a payment method
    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }
    public function auction()
    {
        return $this->belongsTo(Auction::class);
    }
}
