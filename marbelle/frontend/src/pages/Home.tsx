import { Button } from '@/shared/components/shadcn/button';
import React from 'react';
import { useTranslation } from 'react-i18next';

const Home: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('pages.home.title')}</h1>
                    <p className="text-xl text-gray-600 mb-8">{t('pages.home.subtitle')}</p>
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('pages.home.discoverTitle')}</h2>
                        <p className="text-gray-600 mb-6">{t('pages.home.discoverDescription')}</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button variant="secondary">{t('pages.home.browseProducts')}</Button>
                            <Button variant="outline">{t('pages.home.requestQuote')}</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
