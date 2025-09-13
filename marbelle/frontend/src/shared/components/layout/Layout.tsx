import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

function Layout() {
    const location = useLocation();
    const isProductDetailPage = /^\/products\/\d+$/.test(location.pathname);

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header isProductDetailPage={isProductDetailPage} />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default Layout;
