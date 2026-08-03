import React from 'react';

const ChartCard = ({ title, subtitle, icon: Icon, iconColor = 'bg-blue-500', headerRight, children, className = '' }) => {
    return (
        <div
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 hover:shadow-md transition-shadow duration-200 ${className}`}
        >
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className={`${iconColor} p-2.5 rounded-xl text-white shadow-lg shrink-0`}>
                            <Icon size={16} />
                        </div>
                    )}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
                        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
                    </div>
                </div>
                {headerRight}
            </div>
            <div>{children}</div>
        </div>
    );
};

export default ChartCard;