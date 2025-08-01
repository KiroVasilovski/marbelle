import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Button } from '../../../shared/components/shadcn/button';
import { useDashboard } from '../DashboardContext';
import { useAuth } from '../../auth/AuthContext';

interface DashboardNavItem {
    id: string;
    label: string;
    href: string;
    description: string;
}

const navigationItems: DashboardNavItem[] = [
    {
        id: 'profile',
        label: 'PROFILE',
        href: '/dashboard/profile',
        description: 'Manage your personal information',
    },
    {
        id: 'addresses',
        label: 'ADDRESSES',
        href: '/dashboard/addresses',
        description: 'Manage your delivery addresses',
    },
    {
        id: 'orders',
        label: 'ORDERS',
        href: '/dashboard/orders',
        description: 'View your order history',
    },
    {
        id: 'password',
        label: 'PASSWORD',
        href: '/dashboard/password',
        description: 'Change your password',
    },
];

export const DashboardLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { user } = useDashboard();
    const { logout } = useAuth();

    const isActiveRoute = (href: string): boolean => {
        return location.pathname === href || (href !== '/dashboard' && location.pathname.startsWith(href));
    };

    const getWelcomeMessage = (): string => {
        if (!user) return 'WELCOME TO YOUR DASHBOARD';

        const firstName = user.first_name?.toUpperCase() || '';
        const lastName = user.last_name?.toUpperCase() || '';

        if (firstName && lastName) {
            return `HELLO, ${firstName} ${lastName}`;
        } else if (firstName) {
            return `HELLO, ${firstName}`;
        }

        return 'WELCOME TO YOUR DASHBOARD';
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Mobile header */}
            <div className="lg:hidden bg-white border-b border-neutral-200 px-4 py-3">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-light tracking-wider">DASHBOARD</h1>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-neutral-600"
                    >
                        <span className="text-lg">☰</span>
                    </Button>
                </div>
            </div>

            <div className="flex min-h-screen">
                {/* Sidebar */}
                <div
                    className={`
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white border-r border-neutral-200 transition-transform duration-300 ease-in-out
                `}
                >
                    {/* Sidebar header */}
                    <div className="p-6 border-b border-neutral-200">
                        <div className="flex items-center justify-between lg:justify-start">
                            <Link key="dashbard-welcome" to="/dashboard">
                                <h1 className="text-2xl font-light tracking-wider">DASHBOARD</h1>
                            </Link>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden text-neutral-600"
                            >
                                <span className="text-lg">✕</span>
                            </Button>
                        </div>

                        <p className="text-sm font-medium text-neutral-800 tracking-wide">{getWelcomeMessage()}</p>
                    </div>

                    {/* Navigation */}
                    <nav className="p-6">
                        <div className="space-y-2">
                            {navigationItems.map((item) => (
                                <Link
                                    key={item.id}
                                    to={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                                        block px-4 py-3 rounded text-sm font-medium tracking-wide transition-colors
                                        ${
                                            isActiveRoute(item.href)
                                                ? 'bg-neutral-900 text-white'
                                                : 'text-neutral-700 hover:bg-neutral-100'
                                        }
                                    `}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div>
                                            <div className="font-medium">{item.label}</div>
                                            <div className="text-xs text-neutral-500 mt-0.5">{item.description}</div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Logout button */}
                        <div className="mt-8 pt-6 border-t border-neutral-200">
                            <Button
                                onClick={logout}
                                variant="outline"
                                className="w-full text-neutral-700 hover:bg-neutral-100"
                            >
                                LOGOUT
                            </Button>
                        </div>
                    </nav>
                </div>

                {/* Main content */}
                <div className="flex-1 lg:ml-0">
                    {/* Overlay for mobile */}
                    {sidebarOpen && (
                        <div
                            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}

                    {/* Page content */}
                    <main className="p-6 lg:p-8">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};
