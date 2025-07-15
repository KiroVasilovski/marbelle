import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">Marbelle</h3>
                        <p className="text-gray-400">
                            Premium natural stone for architects, designers, and contractors.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Products</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li>
                                <Link to="/products" className="hover:text-white">
                                    Slabs
                                </Link>
                            </li>
                            <li>
                                <Link to="/products" className="hover:text-white">
                                    Tiles
                                </Link>
                            </li>
                            <li>
                                <Link to="/products" className="hover:text-white">
                                    Mosaics
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li>
                                <Link to="/about" className="hover:text-white">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <a href="/contact" className="hover:text-white">
                                    Contact
                                </a>
                            </li>
                            <li>
                                <a href="/careers" className="hover:text-white">
                                    Careers
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li>
                                <a href="/help" className="hover:text-white">
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="/shipping" className="hover:text-white">
                                    Shipping Info
                                </a>
                            </li>
                            <li>
                                <a href="/returns" className="hover:text-white">
                                    Returns
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2024 Marbelle. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
