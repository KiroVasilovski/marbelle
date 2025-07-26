import React, { useEffect } from 'react';
import { Button } from '../../../../shared/components/shadcn/button';
import { useDashboard } from '../../DashboardContext';

export const OrdersPage: React.FC = () => {
    const {
        orders,
        ordersLoading,
        ordersError,
        fetchOrders,
    } = useDashboard();

    // Fetch orders on mount
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).toUpperCase();
    };

    const formatPrice = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const getStatusColor = (status: string): string => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-neutral-100 text-neutral-800';
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-light tracking-wider text-neutral-900">
                            ORDER HISTORY
                        </h1>
                        <p className="text-neutral-600 tracking-wide mt-1">
                            VIEW AND TRACK YOUR ORDERS
                        </p>
                    </div>
                    <Button
                        onClick={() => window.location.href = '/products'}
                        variant="outline"
                    >
                        CONTINUE SHOPPING
                    </Button>
                </div>
            </div>

            {/* Error Display */}
            {ordersError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800 text-sm tracking-wide">{ordersError}</p>
                </div>
            )}

            {/* Loading State */}
            {ordersLoading && (
                <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
                    <p className="text-neutral-600 tracking-wide">LOADING ORDERS...</p>
                </div>
            )}

            {/* Empty State */}
            {!ordersLoading && orders.length === 0 && (
                <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
                    <span className="text-6xl mb-4 block">📦</span>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2 tracking-wide">
                        NO ORDERS YET
                    </h3>
                    <p className="text-neutral-600 mb-6 tracking-wide">
                        YOU HAVEN'T PLACED ANY ORDERS YET. START SHOPPING TO SEE YOUR ORDER HISTORY HERE.
                    </p>
                    <Button onClick={() => window.location.href = '/products'}>
                        START SHOPPING
                    </Button>
                </div>
            )}

            {/* Orders List */}
            {!ordersLoading && orders.length > 0 && (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-lg border border-neutral-200 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-medium tracking-wide text-neutral-900">
                                        ORDER #{order.order_number}
                                    </h3>
                                    <p className="text-sm text-neutral-600 tracking-wide mt-1">
                                        PLACED ON {formatDate(order.created_at)}
                                    </p>
                                </div>
                                
                                <div className="text-right">
                                    <span className={`
                                        inline-block px-3 py-1 text-xs font-medium rounded-full tracking-wide
                                        ${getStatusColor(order.status)}
                                    `}>
                                        {order.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <p className="text-sm font-medium text-neutral-700 tracking-wide">
                                        TOTAL AMOUNT
                                    </p>
                                    <p className="text-lg font-light text-neutral-900 mt-1">
                                        {formatPrice(order.total_amount)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-neutral-700 tracking-wide">
                                        ORDER STATUS
                                    </p>
                                    <p className="text-sm text-neutral-900 mt-1 tracking-wide">
                                        {order.status.toUpperCase()}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-neutral-700 tracking-wide">
                                        LAST UPDATED
                                    </p>
                                    <p className="text-sm text-neutral-900 mt-1 tracking-wide">
                                        {formatDate(order.updated_at)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                                <div className="flex space-x-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => alert('Order details feature coming soon!')}
                                    >
                                        VIEW DETAILS
                                    </Button>
                                    
                                    {order.status.toLowerCase() === 'shipped' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => alert('Order tracking feature coming soon!')}
                                        >
                                            TRACK ORDER
                                        </Button>
                                    )}
                                </div>

                                {(order.status.toLowerCase() === 'delivered') && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => alert('Reorder feature coming soon!')}
                                    >
                                        REORDER
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Order Management Info */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-medium tracking-wide text-blue-900 mb-4">
                    ORDER MANAGEMENT
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-sm font-medium text-blue-800 mb-2 tracking-wide">
                            NEED HELP WITH AN ORDER?
                        </h4>
                        <ul className="text-sm text-blue-700 space-y-1 tracking-wide">
                            <li>• VIEW ORDER DETAILS AND STATUS</li>
                            <li>• TRACK SHIPMENTS IN REAL-TIME</li>
                            <li>• REQUEST CHANGES OR CANCELLATIONS</li>
                            <li>• DOWNLOAD INVOICES AND RECEIPTS</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-blue-800 mb-2 tracking-wide">
                            CONTACT SUPPORT
                        </h4>
                        <p className="text-sm text-blue-700 mb-3 tracking-wide">
                            QUESTIONS ABOUT YOUR ORDER? OUR TEAM IS HERE TO HELP.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alert('Contact support feature coming soon!')}
                            className="text-blue-700 border-blue-300 hover:bg-blue-100"
                        >
                            CONTACT SUPPORT
                        </Button>
                    </div>
                </div>
            </div>

            {/* Coming Soon Features */}
            <div className="mt-6 bg-neutral-50 rounded-lg border border-neutral-200 p-6">
                <h3 className="text-lg font-medium tracking-wide text-neutral-900 mb-4">
                    COMING SOON
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4">
                        <span className="text-2xl block mb-2">📋</span>
                        <h4 className="text-sm font-medium text-neutral-900 tracking-wide">
                            DETAILED ORDER VIEWS
                        </h4>
                        <p className="text-xs text-neutral-600 mt-1 tracking-wide">
                            VIEW COMPLETE ORDER DETAILS
                        </p>
                    </div>

                    <div className="text-center p-4">
                        <span className="text-2xl block mb-2">🚚</span>
                        <h4 className="text-sm font-medium text-neutral-900 tracking-wide">
                            REAL-TIME TRACKING
                        </h4>
                        <p className="text-xs text-neutral-600 mt-1 tracking-wide">
                            TRACK YOUR SHIPMENTS LIVE
                        </p>
                    </div>

                    <div className="text-center p-4">
                        <span className="text-2xl block mb-2">🔄</span>
                        <h4 className="text-sm font-medium text-neutral-900 tracking-wide">
                            EASY REORDERING
                        </h4>
                        <p className="text-xs text-neutral-600 mt-1 tracking-wide">
                            REORDER WITH ONE CLICK
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};