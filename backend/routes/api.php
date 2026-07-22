<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register'])->name('register');

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/user', [AuthController::class, 'me'])->name('user.me');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Role Management Routes
    Route::prefix('roles')->group(function () {
        Route::get('/', [RoleController::class, 'index'])->name('roles.index');
        Route::post('/', [RoleController::class, 'store'])->name('roles.store');
        Route::get('/all', [RoleController::class, 'allRoles'])->name('roles.all');
        Route::get('/{id}', [RoleController::class, 'show'])->name('roles.show');
        Route::put('/{id}', [RoleController::class, 'update'])->name('roles.update');
        Route::delete('/{id}', [RoleController::class, 'destroy'])->name('roles.delete');
    });

    // Permission Management Routes
    Route::prefix('permissions')->group(function () {
        Route::get('/', [PermissionController::class, 'index'])->name('permissions.index');
        Route::post('/', [PermissionController::class, 'store'])->name('permissions.store');
        Route::get('/all', [PermissionController::class, 'allPermissions'])->name('permissions.all');
        Route::get('/{id}', [PermissionController::class, 'show'])->name('permissions.show');
        Route::put('/{id}', [PermissionController::class, 'update'])->name('permissions.update');
        Route::delete('/{id}', [PermissionController::class, 'destroy'])->name('permissions.delete');
    });

    // Role-Permission Management Routes
    Route::prefix('role-permissions')->group(function () {
        Route::get('/', [RolePermissionController::class, 'index'])->name('role-permissions.index');
        Route::get('/{id}/edit', [RolePermissionController::class, 'edit'])->name('role-permissions.edit');
        Route::put('/{id}', [RolePermissionController::class, 'update'])->name('role-permissions.update');
    });

    // User Management Routes
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('users.index');
        Route::post('/', [UserController::class, 'store'])->name('users.store');
        Route::get('/roles', [UserController::class, 'allRoles'])->name('users.roles');
        Route::get('/{id}', [UserController::class, 'show'])->name('users.show');
        Route::put('/{id}', [UserController::class, 'update'])->name('users.update');
        Route::put('/{id}/total', [UserController::class, 'updateTotal'])->name('users.update-total');
        Route::delete('/{id}', [UserController::class, 'destroy'])->name('users.delete');
    });
});
