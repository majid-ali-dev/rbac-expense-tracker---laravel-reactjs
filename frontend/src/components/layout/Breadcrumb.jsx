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
// ("/users/5" -> Dashboard / Users / #5).
const buildItems = (pathname, labelMap) => {
    const segments = pathname.split('/').filter(Boolean);
    // Avoid a duplicate "Dashboard" entry on /dashboard/... routes.
    const rest = segments[0] === 'dashboard' ? segments.slice(1) : segments;

    return [
        { label: 'Dashboard', path: '/dashboard' },
        ...rest.map((segment, index) => {
            const path = '/' + rest.slice(0, index + 1).join('/');
            const isId = /^\d+$/.test(segment);
            const label = isId
                ? `#${segment}`
                : labelMap[segment] || capitalizeSegment(segment);
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
