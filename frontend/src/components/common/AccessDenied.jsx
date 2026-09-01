import React from 'react';
import { Link } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';
import useTranslation from '../../hooks/useTranslation';

const AccessDenied = () => {
    const { t } = useTranslation();
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-md w-full">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-5">
                    <FaLock className="text-red-600" size={28} />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900">{t('accessDenied')}</h1>
                <p className="text-gray-500 mt-2 text-sm">
                    {t('accessDeniedDesc')}
                </p>
                <Link
                    to="/dashboard"
                    className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                    {t('goToDashboard')}
                </Link>
            </div>
        </div>
    );
};

export default AccessDenied;
