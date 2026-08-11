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
        'permission' => 'roles.view',
    ],
    [
        'title' => 'Permissions',
        'icon' => 'bi-key',
        'route' => 'permissions.index',
        'active' => ['permissions.*'],
        'permission' => 'permissions.view',
    ],
    [
        'title' => 'Roles & Permissions',
        'icon' => 'bi-diagram-3',
        'route' => 'role.permissions.index',
        'active' => ['role.permissions.*'],
        'permission' => 'role-permissions.view',
    ],
    [
        'title' => 'Manage Users',
        'icon' => 'bi-people',
        'route' => 'users.index',
        'active' => ['users.*'],
        'permission' => 'users.view',
    ],
    [
        'title' => 'Categories',
        'icon' => 'bi-cart',
        'route' => 'categories.index',
        'active' => ['categories.*'],
        'permission' => 'categories.view',
    ],
    [
        'title' => 'Expenses',
        'icon' => 'bi-cash-stack',
        'route' => 'expenses.index',
        'active' => ['expenses.*'],
        'permission' => 'expenses.view',
    ],
    [
        'title' => 'Payments',
        'icon' => 'bi-wallet2',
        'route' => 'payments.index',
        'active' => ['payments.*'],
        'permission' => 'payments.view',
    ],
];
