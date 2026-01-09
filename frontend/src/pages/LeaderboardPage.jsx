import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card, LoadingSpinner, ErrorMessage, Button } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export const LeaderboardPage = () => {
    const { user } = useAuth();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [filters, setFilters] = useState({
        department: '',
        graduationYear: ''
    });

    const limit = 20;
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchLeaderboard();
    }, [page, filters]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });

            if (filters.department) params.append('department', filters.department);
            if (filters.graduationYear) params.append('graduationYear', filters.graduationYear);

            const endpoint = isAdmin ? '/leaderboard/admin' : '/leaderboard';
            const response = await api.get(`${endpoint}?${params}`);

            setEntries(response.data.entries || []);
            setTotalCount(response.data.totalCount || 0);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load leaderboard');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1); // Reset to first page when filters change
    };

    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isAdmin ? 'Admin Leaderboard' : 'Leaderboard'}
                    </h2>
                    <p className="text-gray-600 mt-1">
                        {isAdmin ? 'Full access with student details' : 'Anonymous rankings by employability score'}
                    </p>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Department
                            </label>
                            <select
                                value={filters.department}
                                onChange={(e) => handleFilterChange('department', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Departments</option>
                                <option value="Computer Science">Computer Science</option>
                                <option value="Information Technology">Information Technology</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Mechanical">Mechanical</option>
                                <option value="Civil">Civil</option>
                                <option value="Electrical">Electrical</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Graduation Year
                            </label>
                            <select
                                value={filters.graduationYear}
                                onChange={(e) => handleFilterChange('graduationYear', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Years</option>
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                                <option value="2027">2027</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <Button
                                onClick={() => {
                                    setFilters({ department: '', graduationYear: '' });
                                    setPage(1);
                                }}
                                variant="secondary"
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Leaderboard Table */}
                <Card>
                    {loading ? (
                        <LoadingSpinner />
                    ) : error ? (
                        <ErrorMessage message={error} />
                    ) : entries.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No entries found. Try adjusting your filters.
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Rank
                                            </th>
                                            {isAdmin && (
                                                <>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Name
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Email
                                                    </th>
                                                </>
                                            )}
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Score
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Department
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Year
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {entries.map((entry) => (
                                            <tr key={entry.rank} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <span className={`font-semibold ${entry.rank === 1 ? 'text-yellow-600' :
                                                                entry.rank === 2 ? 'text-gray-400' :
                                                                    entry.rank === 3 ? 'text-orange-600' :
                                                                        'text-gray-900'
                                                            }`}>
                                                            #{entry.rank}
                                                        </span>
                                                    </div>
                                                </td>
                                                {isAdmin && (
                                                    <>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {entry.user?.name || 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {entry.user?.email || 'N/A'}
                                                        </td>
                                                    </>
                                                )}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-lg font-semibold text-blue-600">
                                                        {entry.totalScore?.toFixed(2) || '0.00'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {entry.department || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {entry.graduationYear || 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(page * limit, totalCount)}</span> of{' '}
                                    <span className="font-medium">{totalCount}</span> results
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        variant="secondary"
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page >= totalPages}
                                        variant="secondary"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
};
