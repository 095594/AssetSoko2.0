<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'reviewed_user_id', 'rating', 'comment'
    ];

    // A review belongs to a user (who wrote the review)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // A review belongs to a reviewed user (who was reviewed)
    public function reviewedUser()
    {
        return $this->belongsTo(User::class, 'reviewed_user_id');
    }
}
