// Centralized permission helpers. Permissions always come from the database
// via the authenticated user's roles (user.permissions array).

export const hasPermission = (user, permission) =>
    !!user?.permissions?.includes(permission);

export const hasAnyPermission = (user, permissions = []) =>
    permissions.some((permission) => hasPermission(user, permission));

/**
 * Permissions required to open each module page. A user needs ANY of the
 * listed permissions to access the page.
 */
export const MODULE_PERMISSIONS = {
    '/dashboard': ['dashboard.view'],
    '/roles': ['roles.view'],
    '/permissions': ['permissions.view'],
    '/role-permissions': ['role-permissions.view'],
    '/users': ['users.view'],
    '/categories': ['categories.view'],
    '/expenses': ['expenses.view', 'expenses.view-all'],
    '/expenses/view': ['expenses.export'],
    '/payments': ['payments.view', 'payments.view-all'],
    '/notifications': ['notifications.view'],
};

/**
 * Resolve the permission requirements for a route path (exact match first,
 * then by module prefix, e.g. "/users/5" -> "/users").
 */
export const modulePermissionsFor = (pathname) => {
    if (MODULE_PERMISSIONS[pathname]) {
        return MODULE_PERMISSIONS[pathname];
    }
    const prefix = Object.keys(MODULE_PERMISSIONS)
        .filter((key) => key !== '/' && pathname.startsWith(key + '/'))
        .sort((a, b) => b.length - a.length)[0];
    return prefix ? MODULE_PERMISSIONS[prefix] : null;
};

export const canAccessModule = (user, pathname) => {
    const required = modulePermissionsFor(pathname);
    // No permission requirement -> page is always available (e.g. login).
    if (required === null) return true;
    return hasAnyPermission(user, required);
};

/**
 * Row-level scope check: can the user act on a record owned by ownerId?
 * Own permission covers own records; the "-all" permission covers any.
 */
export const canActOnOwned = (user, ownPermission, allPermission, ownerId) =>
    hasPermission(user, allPermission) ||
    (Number(ownerId) === Number(user?.id) && hasPermission(user, ownPermission));
