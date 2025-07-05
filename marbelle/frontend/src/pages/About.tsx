import React from 'react';

const About: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">ABOUT MARBELLE</h1>

                    <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">OUR MISSION</h2>
                        <p className="text-gray-600 mb-6">
                            Marbelle is dedicated to providing architects, designers, contractors, and homeowners with
                            the finest natural stone products. We source premium materials from quarries around the
                            world to bring you exceptional quality and beauty.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">PREMIUM QUALITY</h2>
                        <p className="text-gray-600 mb-6">
                            Every piece of stone in our collection is carefully selected for its unique characteristics,
                            durability, and aesthetic appeal. From marble slabs to intricate mosaics, we ensure that
                            each product meets our rigorous quality standards.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">PROFESSIONAL SERVICE</h2>
                        <p className="text-gray-600">
                            Our team of stone specialists is here to help you find the perfect materials for your
                            project. We offer custom quotes, detailed specifications, and professional guidance to
                            ensure your vision becomes reality.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
