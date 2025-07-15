import React from 'react';

const Home: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">WELCOME TO MARBELLE</h1>
                    <p className="text-xl text-gray-600 mb-8">PREMIUM NATURAL STONE FOR ARCHITECTS AND DESIGNERS</p>
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">DISCOVER OUR COLLECTION</h2>
                        <p className="text-gray-600 mb-6">
                            Explore our curated selection of natural stone products including slabs, tiles, and mosaics.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer">
                                BROWSE PRODUCTS
                            </button>
                            <button className="border border-black text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors cursor-pointer">
                                REQUEST QUOTE
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
