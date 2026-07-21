<?php

namespace App\Providers;

use App\Repositories\Contracts\RoleRepositoryInterface;
use App\Repositories\RoleRepository;
use Illuminate\Support\ServiceProvider;
use App\Repositories\Contracts\PermissionRepositoryInterface;
use App\Repositories\PermissionRepository;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(RoleRepositoryInterface::class, RoleRepository::class);
        $this->app->bind(PermissionRepositoryInterface::class, PermissionRepository::class);
    }

    public function boot(): void
    {
        //
    }
}
