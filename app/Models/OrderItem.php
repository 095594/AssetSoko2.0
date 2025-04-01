<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    //
    protected $fillable = [
        'order_id',
        'asset_id',
        'quantity',
        'price',
    ];
    
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
    
    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }
}
