import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScheduleQueries } from '@/hooks/queries/useScheduleQueries';
import { RecentActivity } from '@/lib/api/scheduledContributions';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
    ArrowLeft,
    Activity,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Filter,
    Calendar,
    Download,
    RefreshCw,
    AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function PaymentActivity() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('date');

    const {
        scheduleStats,
        isScheduleStatsLoading,
        isScheduleStatsError,
        refetchScheduleStats,
    } = useScheduleQueries();

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircle2 className="h-4 w-4 text-green-600" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-600" />;
            case 'pending':
            case 'processing':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            default:
                return <Clock className="h-4 w-4 text-gray-600" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Success
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge variant="destructive" className="bg-red-100 text-red-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Failed
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            case 'processing':
                return (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Processing
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Get activity data from schedule stats
    const activityData = scheduleStats?.recentActivity || [];

    // Filter and sort activity logs
    const filteredAndSortedLogs = activityData
        ?.filter(activity => {
            // Filter by search term
            const matchesSearch = searchTerm === '' || 
                formatCurrency(activity.amount).toLowerCase().includes(searchTerm.toLowerCase()) ||
                activity.contributionType.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Filter by status
            const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;
            
            return matchesSearch && matchesStatus;
        })
        ?.sort((a, b) => {
            switch (sortBy) {
                case 'amount':
                    return b.amount - a.amount;
                case 'date':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'status':
                    return a.status.localeCompare(b.status);
                default:
                    return 0;
            }
        });

    const handleExport = () => {
        // Future implementation for exporting payment logs
        console.log('Export functionality to be implemented');
    };

    if (isScheduleStatsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0066A1]"></div>
            </div>
        );
    }

    if (isScheduleStatsError) {
        return (
            <div className="space-y-6">
                <div className="flex items-center mb-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="mr-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold text-[#212529]">Payment Activity</h1>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-red-800 mb-2">
                        Error Loading Payment Logs
                    </h2>
                    <p className="text-red-600 mb-4">
                        We couldn't load your payment activity. Please try again.
                    </p>
                    <Button onClick={() => refetchScheduleStats()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="mr-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center space-x-2">
                        <Activity className="h-6 w-6 text-[#0066A1]" />
                        <h1 className="text-2xl font-bold text-[#212529]">Payment Activity</h1>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetchScheduleStats()}
                        disabled={isScheduleStatsLoading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isScheduleStatsLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        className="text-[#0066A1] border-[#0066A1] hover:bg-[#0066A1] hover:text-white"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Summary Card */}
            {scheduleStats && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-[#0066A1]" />
                            <span>Payment Summary</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-[#0066A1]">{activityData.length}</p>
                                <p className="text-sm text-gray-600">Total Payments</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">
                                    {activityData.filter(activity => activity.status === 'success').length}
                                </p>
                                <p className="text-sm text-gray-600">Successful</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-600">
                                    {activityData.filter(activity => activity.status === 'failed').length}
                                </p>
                                <p className="text-sm text-gray-600">Failed</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-600">
                                    {activityData.filter(activity => activity.status === 'processing' || activity.status === 'pending').length}
                                </p>
                                <p className="text-sm text-gray-600">Processing</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex-1 relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Search by amount or type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-32">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="success">Success</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="amount">Amount</SelectItem>
                            <SelectItem value="status">Status</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-gray-600">
                <p>
                    Showing {filteredAndSortedLogs?.length || 0} of {activityData.length} payments
                    {searchTerm && ` for "${searchTerm}"`}
                    {filterStatus !== 'all' && ` • ${filterStatus} only`}
                </p>
                {filteredAndSortedLogs?.length === 0 && searchTerm && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                            setSearchTerm('');
                            setFilterStatus('all');
                        }}
                    >
                        Clear filters
                    </Button>
                )}
            </div>

            {/* Payment Activity List */}
            {!activityData || activityData.length === 0 ? (
                <div className="text-center py-12">
                    <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        No Payment Activity Yet
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Your payment history will appear here once you start making scheduled contributions
                    </p>
                    <Button 
                        onClick={() => navigate('/schedules')}
                        className="bg-[#0066A1] hover:bg-[#005085]"
                    >
                        View Schedules
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredAndSortedLogs?.map((activity: RecentActivity, index: number) => (
                        <Card key={activity.id || index} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg">
                                            {getStatusIcon(activity.status)}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="font-semibold text-lg">
                                                    {formatCurrency(activity.amount)}
                                                </h3>
                                                {getStatusBadge(activity.status)}
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{formatDate(new Date(activity.createdAt).getTime())}</span>
                                                </div>
                                                <span>Type: {activity.contributionType.toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">
                                            {formatDate(new Date(activity.createdAt).getTime())}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PaymentActivity;