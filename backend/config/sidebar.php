<?php

return [
    [
        'title' => 'Dashboard',
        'icon' => 'bi-grid-1x2-fill',
        'route' => 'dashboard',
        'active' => ['dashboard'],
        'permission' => null,
    ],
    [
        'title' => 'Roles',
        'icon' => 'bi-shield-lock',
        'route' => 'roles.index',
        'active' => ['roles.*'],
        'permission' => 'assign-roles',
    ],
    [
        'title' => 'Permissions',
        'icon' => 'bi-key',
        'route' => 'permissions.index',
        'active' => ['permissions.*'],
        'permission' => 'assign-roles',
    ],
    [
        'title' => 'Roles & Permissions',
        'icon' => 'bi-diagram-3',
        'route' => 'role.permissions.index',
        'active' => ['role.permissions.*'],
        'permission' => 'assign-roles',
    ],
    [
        'title' => 'Manage Users',
        'icon' => 'bi-people',
        'route' => 'users.index',
        'active' => ['users.*'],
        'permission' => 'manage-users',
    ],
    [
        'title' => 'Categories',
        'icon' => 'bi-cart',
        'route' => 'categories.index',
        'active' => ['categories.*'],
        'permission' => 'manage-categories',
    ],
    [
        'title' => 'Expenses',
        'icon' => 'bi-cash-stack',
        'route' => 'expenses.index',
        'active' => ['expenses.*'],
        'permission' => 'view-expense',
    ],
    [
        'title' => 'Payments',
        'icon' => 'bi-wallet2',
        'route' => 'payments.index',
        'active' => ['payments.*'],
        'permission' => 'view-payment',
    ],
];
