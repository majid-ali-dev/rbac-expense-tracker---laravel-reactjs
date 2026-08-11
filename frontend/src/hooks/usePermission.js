import useAuthStore from '../store/authStore';
import { hasPermission, hasAnyPermission, canActOnOwned } from '../utils/permissions';

/**
 * Reusable permission hook. Reads the authenticated user (whose permissions
 * come from the database via roles) and exposes check helpers.
 */
const usePermission = () => {
    const { user } = useAuthStore();

    return {
        user,
        can: (permission) => hasPermission(user, permission),
        canAny: (...permissions) => hasAnyPermission(user, permissions),
        canActOn: (ownPermission, allPermission, ownerId) =>
            canActOnOwned(user, ownPermission, allPermission, ownerId),
    };
};

export default usePermission;
