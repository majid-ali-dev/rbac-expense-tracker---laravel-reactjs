import React from 'react';

/**
 * Premium chart card shell — subtle top accent, soft layered shadow, refined header.
 * Props unchanged — pure visual upgrade.
 */
const ChartCard = ({ title, subtitle, icon: Icon, iconColor = 'bg-blue-500', headerRight, children, className = '' }) => {
    return (
        <div
            className={`group relative bg-white rounded-[26px] border border-gray-100 overflow-hidden
                shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_-8px_rgba(15,23,42,0.08)]
                hover:shadow-[0_1px_2px_rgba(15,23,42,0.05),0_16px_36px_-8px_rgba(15,23,42,0.12)]
                transition-all duration-300 ${className}`}
        >
            {/* subtle top accent line, colored per chart */}
            <div className={`h-[3px] w-full ${iconColor} opacity-70`} />

            <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div className={`relative ${iconColor} p-2.5 rounded-2xl text-white shadow-lg shrink-0`}>
                                <div className="absolute inset-0 rounded-2xl bg-white/10" />
                                <Icon size={16} className="relative" />
                            </div>
                        )}
                        <div>
                            <h3 className="text-[14px] font-bold text-gray-900 tracking-tight">{title}</h3>
                            {subtitle && <p className="text-[11px] text-gray-400 font-medium mt-0.5">{subtitle}</p>}
                        </div>
                    </div>
                    {headerRight}
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
};

export default ChartCard;