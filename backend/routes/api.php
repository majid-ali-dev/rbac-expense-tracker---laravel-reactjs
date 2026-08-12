<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SheetDownloaderController;
use App\Http\Controllers\BillingCycleController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register'])->name('register');

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/user', [AuthController::class, 'me'])->name('user.me');

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware('permission:dashboard.view')
        ->name('dashboard');

    // Billing Cycle Routes
    Route::prefix('billing-cycle')->group(function () {
        Route::get('/current', [BillingCycleController::class, 'current']);
        Route::get('/all', [BillingCycleController::class, 'all']);
        Route::get('/history', [BillingCycleController::class, 'history']);
        Route::post('/close', [BillingCycleController::class, 'closeCurrentMonth'])
            ->middleware('permission:billing-cycle.close');
    });

    // Role Management Routes
    Route::prefix('roles')->group(function () {
        Route::get('/', [RoleController::class, 'index'])->middleware('permission:roles.view')->name('roles.index');
        Route::post('/', [RoleController::class, 'store'])->middleware('permission:roles.create')->name('roles.store');
        Route::get('/all', [RoleController::class, 'allRoles'])->middleware('permission:roles.view')->name('roles.all');
        Route::get('/{id}', [RoleController::class, 'show'])->middleware('permission:roles.view')->name('roles.show');
        Route::put('/{id}', [RoleController::class, 'update'])->middleware('permission:roles.edit')->name('roles.update');
        Route::delete('/{id}', [RoleController::class, 'destroy'])->middleware('permission:roles.delete')->name('roles.delete');
    });

    // Permission Management Routes
    Route::prefix('permissions')->group(function () {
        Route::get('/', [PermissionController::class, 'index'])->middleware('permission:permissions.view')->name('permissions.index');
        Route::post('/', [PermissionController::class, 'store'])->middleware('permission:permissions.create')->name('permissions.store');
        Route::get('/all', [PermissionController::class, 'allPermissions'])->middleware('permission:permissions.view')->name('permissions.all');
        Route::get('/{id}', [PermissionController::class, 'show'])->middleware('permission:permissions.view')->name('permissions.show');
        Route::put('/{id}', [PermissionController::class, 'update'])->middleware('permission:permissions.edit')->name('permissions.update');
        Route::delete('/{id}', [PermissionController::class, 'destroy'])->middleware('permission:permissions.delete')->name('permissions.delete');
    });

    // Role-Permission Management Routes
    Route::prefix('role-permissions')->group(function () {
        Route::get('/', [RolePermissionController::class, 'index'])->middleware('permission:role-permissions.view')->name('role-permissions.index');
        Route::get('/{id}/edit', [RolePermissionController::class, 'edit'])->middleware('permission:role-permissions.view')->name('role-permissions.edit');
        Route::put('/{id}', [RolePermissionController::class, 'update'])->middleware('permission:role-permissions.update')->name('role-permissions.update');
    });

    // User Management Routes
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index'])->middleware('permission:users.view')->name('users.index');
        Route::post('/', [UserController::class, 'store'])->middleware('permission:users.create')->name('users.store');
        Route::get('/roles', [UserController::class, 'allRoles'])->middleware('permission:users.view')->name('users.roles');
        Route::get('/{id}', [UserController::class, 'show'])->middleware('permission:users.view')->name('users.show');
        Route::put('/{id}', [UserController::class, 'update'])->middleware('permission:users.edit')->name('users.update');
        Route::put('/{id}/total', [UserController::class, 'updateTotal'])->middleware('permission:users.edit')->name('users.update-total');
        Route::delete('/{id}', [UserController::class, 'destroy'])->middleware('permission:users.delete')->name('users.delete');
    });

    // Category Management Routes
    Route::prefix('categories')->group(function () {
        Route::get('/', [CategoryController::class, 'index'])->middleware('permission:categories.view')->name('categories.index');
        Route::post('/', [CategoryController::class, 'store'])->middleware('permission:categories.create')->name('categories.store');
        Route::get('/all', [CategoryController::class, 'allCategories'])->middleware('permission:categories.view')->name('categories.all');
        Route::get('/{id}', [CategoryController::class, 'show'])->middleware('permission:categories.view')->name('categories.show');
        Route::put('/{id}', [CategoryController::class, 'update'])->middleware('permission:categories.edit')->name('categories.update');
        Route::delete('/{id}', [CategoryController::class, 'destroy'])->middleware('permission:categories.delete')->name('categories.delete');
    });

    // Expense Management Routes
    Route::prefix('expenses')->group(function () {
        Route::get('/sheet', [SheetDownloaderController::class, 'index'])
            ->middleware('permission:expenses.export')
            ->name('expenses.sheet');
        Route::get('/download-sheet', [SheetDownloaderController::class, 'download'])
            ->middleware('permission:expenses.download')
            ->name('expenses.download-sheet');
        Route::get('/categories', [ExpenseController::class, 'categories'])
            ->middleware('permission:expenses.view,expenses.view-all')
            ->name('expenses.categories');
        Route::get('/', [ExpenseController::class, 'index'])
            ->middleware('permission:expenses.view,expenses.view-all')
            ->name('expenses.index');
        Route::post('/', [ExpenseController::class, 'store'])
            ->middleware('permission:expenses.create')
            ->name('expenses.store');
        Route::get('/{id}', [ExpenseController::class, 'show'])
            ->middleware('permission:expenses.view,expenses.view-all')
            ->name('expenses.show');
        Route::put('/{id}', [ExpenseController::class, 'update'])
            ->middleware('permission:expenses.edit,expenses.edit-all')
            ->name('expenses.update');
        Route::delete('/{id}', [ExpenseController::class, 'destroy'])
            ->middleware('permission:expenses.delete,expenses.delete-all')
            ->name('expenses.delete');
    });

    // Payment Management Routes
    Route::prefix('payments')->group(function () {
        Route::get('/', [PaymentController::class, 'index'])
            ->middleware('permission:payments.view,payments.view-all')
            ->name('payments.index');
        Route::get('/{id}/add', [PaymentController::class, 'addPayment'])
            ->middleware('permission:payments.create')
            ->name('payments.add');
        Route::post('/{id}/pay', [PaymentController::class, 'pay'])
            ->middleware('permission:payments.create')
            ->name('payments.pay');
        Route::delete('/{id}', [PaymentController::class, 'destroy'])
            ->middleware('permission:payments.delete')
            ->name('payments.destroy');
    });

    // Notification Routes
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])
            ->middleware('permission:notifications.view')
            ->name('notifications.index');
        Route::post('/', [NotificationController::class, 'store'])
            ->middleware('permission:notifications.create')
            ->name('notifications.store');
        Route::get('/unread-count', [NotificationController::class, 'unreadCount'])
            ->middleware('permission:notifications.view')
            ->name('notifications.unread-count');
        Route::get('/unread', [NotificationController::class, 'unread'])
            ->middleware('permission:notifications.view')
            ->name('notifications.unread');
        Route::get('/read', [NotificationController::class, 'read'])
            ->middleware('permission:notifications.view')
            ->name('notifications.read');
        Route::post('/{id}/mark-read', [NotificationController::class, 'markAsRead'])
            ->middleware('permission:notifications.view')
            ->name('notifications.mark-read');
        Route::get('/{id}', [NotificationController::class, 'show'])
            ->middleware('permission:notifications.view')
            ->name('notifications.show');
        Route::put('/{id}', [NotificationController::class, 'update'])
            ->middleware('permission:notifications.edit')
            ->name('notifications.update');
        Route::delete('/{id}', [NotificationController::class, 'destroy'])
            ->middleware('permission:notifications.delete')
            ->name('notifications.destroy');
    });
});
