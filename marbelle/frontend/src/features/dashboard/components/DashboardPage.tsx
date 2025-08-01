import React from 'react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../DashboardContext';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';

interface DashboardCard {
    title: string;
    description: string;
    href: string;
    count?: number;
    status?: string;
}

export const DashboardPage: React.FC = () => {
    const { profileLoading, user, addresses, orders } = useDashboard();

    const getDashboardCards = (): DashboardCard[] => {
        return [
            {
                title: 'PROFILE',
                description: 'Manage your personal information and account details',
                href: '/dashboard/profile',
                status: getAccountCompletionState() ? 'All set!' : 'Finish setting up',
            },
            {
                title: 'ADDRESSES',
                description: 'Manage your delivery and billing addresses',
                href: '/dashboard/addresses',
                count: addresses.length,
            },
            {
                title: 'ORDERS',
                description: 'View your order history and track shipments',
                href: '/dashboard/orders',
                count: orders.length,
            },
            {
                title: 'PASSWORD',
                description: 'Change your password and security settings',
                href: '/dashboard/password',
                status: 'Secure',
            },
        ];
    };

    const getAccountCompletionState = (): boolean => {
        if (!user) return false;

        return !!user.first_name && !!user.last_name && !!user.email && !!user.phone && addresses.length > 0;
    };

    const getWelcomeMessage = (): string => {
        if (!user) return 'WELCOME TO YOUR DASHBOARD';

        const time = new Date().getHours();
        let greeting = 'WELCOME';

        if (time < 12) greeting = 'GOOD MORNING';
        else if (time < 18) greeting = 'GOOD AFTERNOON';
        else greeting = 'GOOD EVENING';

        const firstName = user.first_name?.toUpperCase() || '';
        return firstName ? `${greeting}, ${firstName}` : greeting;
    };

    const dashboardCards = getDashboardCards();

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-light tracking-wider text-neutral-900 mb-2">{getWelcomeMessage()}</h1>
                <p className="text-neutral-600 tracking-wide">Manage your account and your activity</p>
            </div>

            {profileLoading ? (
                <div className="relative min-h-[300px] flex items-center justify-center">
                    <LoadingSpinner size="md" />
                </div>
            ) : (
                <>
                    {/* Account Status Banner */}
                    {!getAccountCompletionState() && (
                        <div className="bg-white rounded border border-neutral-200 p-6 mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-medium tracking-wide text-neutral-900 mb-3">
                                        COMPLETE YOUR PROFILE
                                    </h2>
                                    <div className="flex items-center flex-wrap gap-2 text-sm text-neutral-600 tracking-wide">
                                        <p className="mb-0">Add the missing information to your profile:</p>
                                        {!user?.phone && (
                                            <Link to="/dashboard/profile">
                                                <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium tracking-wide cursor-pointer hover:bg-blue-200">
                                                    ADD PHONE
                                                </span>
                                            </Link>
                                        )}
                                        {addresses.length === 0 && (
                                            <Link to="/dashboard/addresses">
                                                <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium tracking-wide cursor-pointer hover:bg-blue-200">
                                                    ADD ADDRESS
                                                </span>
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right"></div>
                            </div>
                        </div>
                    )}

                    {/* Quick Stats */}
                    <div className="bg-gray-200 rounded border border-neutral-200 p-5 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded border border-neutral-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-neutral-600 tracking-wide uppercase">
                                            Total orders
                                        </p>
                                        <p className="text-2xl font-light text-neutral-900 mt-2">{orders.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded border border-neutral-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-neutral-600 tracking-wide uppercase">
                                            Saved addresses
                                        </p>
                                        <p className="text-2xl font-light text-neutral-900 mt-2">{addresses.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded border border-neutral-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-neutral-600 tracking-wide uppercase">
                                            Account type
                                        </p>
                                        <p className="text-lg font-light text-neutral-900 mt-2 tracking-wide">
                                            {user?.is_business_customer ? 'BUSINESS' : 'PERSONAL'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dashboard Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {dashboardCards.map((card) => (
                            <Link
                                key={card.title}
                                to={card.href}
                                className="group bg-white rounded border border-neutral-200 p-6 hover:border-neutral-400 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <h3 className="text-lg font-medium tracking-wide text-neutral-900">
                                                {card.title}
                                            </h3>
                                        </div>

                                        <p className="text-sm text-neutral-600 mb-4 tracking-wide">
                                            {card.description}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                {card.count !== undefined && (
                                                    <span className="text-sm font-medium text-neutral-900 tracking-wide">
                                                        {card.count} ITEM{card.count !== 1 ? 'S' : ''}
                                                    </span>
                                                )}
                                                {card.status && (
                                                    <span
                                                        className={`
                                                    text-xs px-2 py-1 rounded-full font-medium tracking-wide
                                                    ${
                                                        getAccountCompletionState() || card.status === 'SECURE'
                                                            ? 'bg-green-100 text-green-800 uppercase'
                                                            : 'bg-yellow-100 text-yellow-800 uppercase'
                                                    }
                                                `}
                                                    >
                                                        {card.status}
                                                    </span>
                                                )}
                                            </div>

                                            <span className="text-neutral-400 group-hover:text-neutral-600 transition-colors text-lg">
                                                →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
