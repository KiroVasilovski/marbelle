import { Outlet } from 'react-router-dom';
import AuthHeader from './AuthHeader';

function AuthLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <AuthHeader />
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
}

export default AuthLayout;