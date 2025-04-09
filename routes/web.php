<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Inertia\Inertia;
use App\Http\Controllers\Admin\AssetController as AdminAssetController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Seller\DashboardController as SellerDashboardController;
use App\Http\Controllers\Buyer\DashboardController as BuyerDashboardController;
use App\Http\Controllers\BidController;
use App\Http\Controllers\WatchlistController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AssetController;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\EnsureUserIsSeller;
use App\Http\Middleware\EnsureUserIsBuyer;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\Seller\AssetController as SellerAssetController;
use App\Http\Controllers\Seller\BidController as SellerBidController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\Admin\AdminSettingsController;
use App\Http\Controllers\Buyer\AIRecommendationController;

// Broadcasting Routes
Broadcast::routes(['middleware' => ['web', 'auth']]);

// Public Route (Welcome Page)
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Public Assets Routes (must come before authenticated routes)
Route::get('/assets', [AssetController::class, 'publicIndex'])->name('assets.index');
Route::get('/assets/{asset}', [AssetController::class, 'show'])->name('assets.show');

// Authentication Routes
require __DIR__.'/auth.php';

// Common Routes for Authenticated Users
Route::middleware(['auth'])->group(function () {
    // Profile Routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password.update');
    Route::put('/profile/theme', [ProfileController::class, 'updateTheme'])->name('profile.theme.update');

    // Settings Routes
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings');
    Route::patch('/settings', [SettingsController::class, 'update'])->name('settings.update');

    // Notification Routes
    Route::post('/notifications/{notification}/mark-as-read', [NotificationController::class, 'markAsRead'])
        ->name('notifications.markAsRead');
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');

    // Payment routes
    Route::get('/payments/{asset}', [PaymentController::class, 'showPaymentForm'])->name('payments.create');
    Route::post('/payments/stripe/{asset}', [PaymentController::class, 'processStripePayment'])->name('payments.stripe');
    Route::post('/payments/mpesa/{asset}', [PaymentController::class, 'processMpesaPayment'])->name('payments.mpesa');
    Route::get('/payments/success/{asset}', [PaymentController::class, 'paymentSuccess'])->name('payments.success');
    Route::get('/payments/status/{asset}', [PaymentController::class, 'showPaymentStatus'])->name('payments.status');

    // M-Pesa callback route (should be public)
    Route::post('/payments/mpesa/callback', [PaymentController::class, 'mpesaCallback'])->name('payments.mpesa.callback');

    // General Dashboard (Redirect Based on Role)
    Route::get('/dashboard', function () {
        $user = auth()->user();
        
        return match ($user->role) {
            'admin' => redirect()->route('admin.dashboard'),
            default => redirect()->route('buyer.dashboard'),
        };
    })->name('dashboard');

    // My Assets Routes (for authenticated users)
    Route::get('/my-assets', [AssetController::class, 'index'])->name('my.assets.index');
    Route::get('/my-assets/create', [AssetController::class, 'create'])->name('my.assets.create');
    Route::post('/my-assets', [AssetController::class, 'store'])->name('my.assets.store');
    Route::get('/my-assets/{asset}/edit', [AssetController::class, 'edit'])->name('my.assets.edit');
    Route::put('/my-assets/{asset}', [AssetController::class, 'update'])->name('my.assets.update');
    Route::delete('/my-assets/{asset}', [AssetController::class, 'destroy'])->name('my.assets.destroy');
    
    // Watchlist Routes
    Route::post('watchlist/{asset}', [WatchlistController::class, 'toggle'])->name('watchlist.toggle');
    Route::get('watchlist', [WatchlistController::class, 'index'])->name('watchlist.index');
    
    // Bid Routes
    Route::post('bids/place', [BidController::class, 'store'])->name('bids.store');
    Route::get('bids', [BidController::class, 'index'])->name('bids.index');

    // Bid statistics route
    Route::get('/buyer/bids/stats', [BidController::class, 'stats'])->name('buyer.bids.stats');
});

// Admin Routes
Route::middleware(['auth', EnsureUserIsAdmin::class])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
    Route::resource('/assets', AdminAssetController::class)->names('admin.assets');
    Route::resource('/users', UserController::class)->names('admin.users');
    Route::resource('/orders', \App\Http\Controllers\Admin\OrderController::class)->names('admin.orders');
    
    // Reports Routes
    Route::get('/reports', [ReportController::class, 'index'])->name('admin.reports.index');
    Route::get('/reports/sales', [ReportController::class, 'sales'])->name('admin.reports.sales');
    Route::get('/reports/users', [ReportController::class, 'users'])->name('admin.reports.users');
    Route::get('/reports/assets', [ReportController::class, 'assets'])->name('admin.reports.assets');
    Route::get('/reports/export/{type}/{format}', [ReportController::class, 'export'])->name('admin.reports.export');
    
    // Settings Routes
    Route::get('/settings', [AdminSettingsController::class, 'index'])->name('admin.settings.index');
    Route::put('/settings', [AdminSettingsController::class, 'update'])->name('admin.settings.update');
});

Route::put('/profile/theme', [ProfileController::class, 'updateTheme'])
    ->middleware('auth')
    ->name('profile.theme.update');
    
// Buyer Routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('buyer')->name('buyer.')->group(function () {
        Route::get('/dashboard', [BuyerDashboardController::class, 'index'])->name('dashboard');
        Route::get('/recommendations', [AIRecommendationController::class, 'getRecommendations'])->name('recommendations');
        Route::get('/assets', [AssetController::class, 'browse'])->name('assets.index');
        Route::get('/assets/{asset}', [AssetController::class, 'show'])->name('assets.show');
        Route::post('/assets/{asset}/bid', [BidController::class, 'store'])->name('bids.store');
        Route::get('/bids', [BidController::class, 'index'])->name('bids.index');
        Route::get('/bids/won', [BidController::class, 'won'])->name('bids.won');
        Route::get('/watchlist', [WatchlistController::class, 'index'])->name('watchlist');
        Route::post('/watchlist/{asset}/toggle', [WatchlistController::class, 'toggle'])->name('watchlist.toggle');
        Route::post('/payments/initiate/{asset}', [PaymentController::class, 'initiatePayment'])->name('payments.initiate');
        Route::get('/payments/status/{asset}', [PaymentController::class, 'showPaymentStatus'])->name('payments.status');
    });
});

// Seller Routes
Route::middleware(['auth'])->prefix('seller')->group(function () {
    Route::get('/dashboard', [SellerDashboardController::class, 'index'])->name('seller.dashboard');
    
    // Asset Management
    Route::get('/assets', [SellerAssetController::class, 'index'])->name('seller.assets.index');
    Route::get('/assets/create', [SellerAssetController::class, 'create'])->name('seller.assets.create');
    Route::post('/assets', [SellerAssetController::class, 'store'])->name('seller.assets.store');
    Route::get('/assets/{asset}/edit', [SellerAssetController::class, 'edit'])->name('seller.assets.edit');
    Route::put('/assets/{asset}', [SellerAssetController::class, 'update'])->name('seller.assets.update');
    Route::delete('/assets/{asset}', [SellerAssetController::class, 'destroy'])->name('seller.assets.destroy');
    
    // Bid Management
    Route::get('/bids', [SellerBidController::class, 'index'])->name('seller.bids.index');
    Route::get('/bids/{bid}', [SellerBidController::class, 'show'])->name('seller.bids.show');
});

Route::get('/test-pusher', function () {
    event(new App\Events\TestEvent('Hello from Pusher!'));
    return 'Test event dispatched!';
});