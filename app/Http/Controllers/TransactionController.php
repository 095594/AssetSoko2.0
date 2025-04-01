<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;

class TransactionController extends Controller
{
    public function getRecentTransactions(Request $request)
    {
        return response()->json(Transaction::with(['auction.asset'])->where('user_id', $request->user()->id)->latest()->take(5)->get());
    }
}

