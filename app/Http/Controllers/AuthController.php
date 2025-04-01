<?php

// namespace App\Http\Controllers;

// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Auth;
// use Inertia\Inertia;

// class AuthController extends Controller
// {
//     public function showLoginForm()
//     {
//         return Inertia::render('Auth/Login');
//     }

//     public function login(Request $request)
//     {
//         $credentials = $request->validate([
//             'email' => 'required|email',
//             'password' => 'required',
//         ]);

//         if (Auth::attempt($credentials)) {
//             $request->session()->regenerate();

//             // Redirect based on role
//             if (auth()->user()->isSeller()) {
//                 return redirect()->route('seller.dashboard');
//             }

//             return redirect('/');
//         }

//         return back()->withErrors(['email' => 'Invalid credentials']);
//     }

//     public function logout(Request $request)
//     {
//         Auth::logout();
//         $request->session()->invalidate();
//         $request->session()->regenerateToken();
//         return redirect('/');
//     }
// }