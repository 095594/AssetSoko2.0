<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    protected $fillable = ['transaction_id', 'buyer_id', 'comment', 'rating'];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }
}
