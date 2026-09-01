import React from 'react';
import { FaWallet } from 'react-icons/fa';
import useTranslation from '../../hooks/useTranslation';

const Footer = () => {
    const { t } = useTranslation();
    const year = new Date().getFullYear();

    return (
        <footer className="mt-8 bg-[#0f172a]">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Brand */}
                <div className="flex items-center gap-2.5">
                    <span className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                        <FaWallet className="text-white" size={18} />
                    </span>
                    <span className="font-bold text-base text-white">{t('appName')}</span>
                </div>

                {/* Copyright - Centered */}
                <p className="text-xs text-gray-400">© {year} {t('appName')}. {t('allRightsReserved')}</p>

                {/* Developer */}
                <div className="flex items-center gap-1 sm:gap-3 text-xs text-gray-400">
                    <p>
                        {t('developedBy')} <span className="font-medium text-white">Majid Baloch</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;