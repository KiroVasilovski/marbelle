import React from 'react';
import { useTranslation } from 'react-i18next';

const About: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">{t('pages.about.title')}</h1>

                    <div className="bg-white rounded-lg p-8 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('pages.about.missionTitle')}</h2>
                        <p className="text-gray-600 mb-6">{t('pages.about.missionDescription')}</p>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('pages.about.visionTitle')}</h2>
                        <p className="text-gray-600 mb-6">{t('pages.about.visionDescription')}</p>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('pages.about.valuesTitle')}</h2>
                        <p className="text-gray-600">{t('pages.about.valuesDescription')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
