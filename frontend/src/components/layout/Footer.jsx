import React from 'react';
import { FaWallet } from 'react-icons/fa';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="mt-8 border-t border-[#0f1b3d]/10 dark:border-white/10">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Brand */}
                <div className="flex items-center gap-2.5">
                    <span className="w-10 h-10 bg-[#0f1b3d] dark:bg-[#1e2f5c] rounded-xl flex items-center justify-center shadow-lg shadow-[#0f1b3d]/25 dark:shadow-black/40">
                        <FaWallet className="text-white dark:text-[#aebfea]" size={18} />
                    </span>
                    <span className="font-bold text-base text-[#0f1b3d] dark:text-white">Expense Tracker</span>
                </div>

                {/* Copyright - Centered */}
                <p className="text-xs text-[#3d4a73] dark:text-[#9fb0d9]">© {year} Expense Tracker. All rights reserved.</p>

                {/* Developer */}
                <div className="flex items-center gap-1 sm:gap-3 text-xs text-[#3d4a73] dark:text-[#9fb0d9]">
                    <p>
                        Developed by <span className="font-medium text-[#0f1b3d] dark:text-white">Majid Baloch</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;