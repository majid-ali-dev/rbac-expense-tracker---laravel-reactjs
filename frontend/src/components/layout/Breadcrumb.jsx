import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// "book-expense" -> "Book Expense"
const capitalizeSegment = (segment) =>
    segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

// Build the trail from the current pathname.
// Always starts with "Dashboard" (/dashboard), then one item per segment
// ("/users/5" -> Dashboard / Users / #5). Numeric id segments in the middle
// of a trail are skipped (e.g. "/role-permissions/3/view" ->
// Dashboard / Roles & Permissions / View Permissions).
const buildItems = (pathname, labelMap) => {
    const segments = pathname.split('/').filter(Boolean);
    // Avoid a duplicate "Dashboard" entry on /dashboard/... routes.
    const rest = segments[0] === 'dashboard' ? segments.slice(1) : segments;

    const visible = rest
        .map((segment, index) => ({ segment, index, isId: /^\d+$/.test(segment) }))
        .filter(({ segment, index, isId }) => !(isId && index < rest.length - 1));

    return [
        { label: 'Dashboard', path: '/dashboard' },
        ...visible.map(({ segment, index, isId }) => {
            const path = '/' + rest.slice(0, index + 1).join('/');
            // Path-scoped label key (ids stripped), e.g. 'role-permissions/view'.
            const trailKey = rest
                .slice(0, index + 1)
                .filter((s) => !/^\d+$/.test(s))
                .join('/');
            const label = isId
                ? `#${segment}`
                : labelMap[segment] || labelMap[trailKey] || capitalizeSegment(segment);
            return { label, path };
        }),
    ];
};

/**
 * Auto-generated breadcrumb navigation.
 * Renders "Dashboard / Module / Screen" from the current URL and re-renders
 * automatically whenever the route changes.
 *
 * @param {Object}  props
 * @param {Object}  [props.labelMap]  Optional per-segment label overrides,
 *                                    e.g. { 'role-permissions': 'Roles & Permissions' }
 */
const Breadcrumb = ({ labelMap = {} }) => {
    const location = useLocation();
    const items = buildItems(location.pathname, labelMap);

    return (
        <nav aria-label="breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center text-sm">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <React.Fragment key={item.path}>
                            {index > 0 && (
                                <li
                                    aria-hidden="true"
                                    className="mx-2 text-gray-400 select-none"
                                >
                                    /
                                </li>
                            )}
                            <li>
                                {isLast ? (
                                    <span
                                        aria-current="page"
                                        className="font-medium text-gray-700"
                                    >
                                        {item.label}
                                    </span>
                                ) : (
                                    <Link
                                        to={item.path}
                                        className="text-blue-600 transition-colors hover:underline hover:underline-offset-4"
                                    >
                                        {item.label}
                                    </Link>
                                )}
                            </li>
                        </React.Fragment>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
