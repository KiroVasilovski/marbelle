import React from 'react';
import { useTranslation } from 'react-i18next';

const Products: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-16">
                <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">{t('pages.products.title')}</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="h-48 bg-gray-300"></div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('pages.products.slabs.title')}</h3>
                            <p className="text-gray-600 mb-4">{t('pages.products.slabs.description')}</p>
                            <button className="bg-black text-white px-4 py-2 rounded font-semibold hover:bg-gray-800 transition-colors cursor-pointer">
                                {t('pages.products.slabs.button.title')}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="h-48 bg-gray-300"></div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('pages.products.tiles.title')}</h3>
                            <p className="text-gray-600 mb-4">{t('pages.products.tiles.description')}</p>
                            <button className="bg-black text-white px-4 py-2 rounded font-semibold hover:bg-gray-800 transition-colors cursor-pointer">
                                {t('pages.products.tiles.button.title')}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="h-48 bg-gray-300"></div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {t('pages.products.mosaics.title')}
                            </h3>
                            <p className="text-gray-600 mb-4">{t('pages.products.mosaics.description')}</p>
                            <button className="bg-black text-white px-4 py-2 rounded font-semibold hover:bg-gray-800 transition-colors cursor-pointer">
                                {t('pages.products.mosaics.button.title')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-gray-600 mb-6">{t('pages.products.custom.title')}</p>
                    <button className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer">
                        {t('pages.products.custom.button.title')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Products;
