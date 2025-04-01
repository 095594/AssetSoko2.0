<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    //
    protected $fillable = [
        'order_id',
        'invoice_number',
        'total_amount',
        'issue_date',
        'due_date',
        'status',
    ];
    
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
