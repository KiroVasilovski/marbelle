import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function Header() {
    return (
        <header className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-gray-900">
                            Marbelle
                        </Link>
                    </div>
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-700 hover:text-gray-900">
                            Home
                        </Link>
                        <Link to="/products" className="text-gray-700 hover:text-gray-900">
                            Products
                        </Link>
                        <Link to="/about" className="text-gray-700 hover:text-gray-900">
                            About
                        </Link>
                    </nav>
                    <div className="flex items-center space-x-4">
                        <Button variant="outline">
                            Login
                        </Button>
                        <Button>
                            Get Quote
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;