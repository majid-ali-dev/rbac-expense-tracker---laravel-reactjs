<?php

namespace App\Helpers;

use App\Models\User;
use Illuminate\Support\Collection;

class SidebarHelper
{
    public static function getSidebarItems(User $user): Collection
    {
        $items = config('sidebar', []);

        return collect($items)->filter(function ($item) use ($user) {
            if (is_null($item['permission'])) {
                return true;
            }
            return $user->hasPermission($item['permission']);
        })->values();
    }
}
