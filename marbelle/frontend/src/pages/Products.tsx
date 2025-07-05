import React from 'react';

const Products: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-16">
                <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">PRODUCT CATALOG</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="h-48 bg-gray-300"></div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">MARBLE SLABS</h3>
                            <p className="text-gray-600 mb-4">
                                Premium marble slabs for countertops, flooring, and feature walls.
                            </p>
                            <button className="bg-black text-white px-4 py-2 rounded font-semibold hover:bg-gray-800 transition-colors cursor-pointer">
                                VIEW COLLECTION
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="h-48 bg-gray-300"></div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">NATURAL TILES</h3>
                            <p className="text-gray-600 mb-4">
                                Elegant natural stone tiles for walls, floors, and decorative applications.
                            </p>
                            <button className="bg-black text-white px-4 py-2 rounded font-semibold hover:bg-gray-800 transition-colors cursor-pointer">
                                VIEW COLLECTION
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="h-48 bg-gray-300"></div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">MOSAIC PATTERNS</h3>
                            <p className="text-gray-600 mb-4">
                                Intricate mosaic designs for backsplashes and accent features.
                            </p>
                            <button className="bg-black text-white px-4 py-2 rounded font-semibold hover:bg-gray-800 transition-colors cursor-pointer">
                                VIEW COLLECTION
                            </button>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-gray-600 mb-6">CAN&apos;T FIND WHAT YOU&apos;RE LOOKING FOR?</p>
                    <button className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer">
                        REQUEST CUSTOM QUOTE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Products;
