function Products() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Products
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-2">Slabs</h3>
                    <p className="text-gray-600">Premium natural stone slabs for countertops and surfaces.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-2">Tiles</h3>
                    <p className="text-gray-600">Beautiful stone tiles for floors and walls.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-2">Mosaics</h3>
                    <p className="text-gray-600">Intricate mosaic patterns for decorative applications.</p>
                </div>
            </div>
        </div>
    );
}

export default Products;