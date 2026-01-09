import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Input, Button, ErrorMessage, Card } from '../components/UI';

export const OnboardingPage = () => {
    const [department, setDepartment] = useState('');
    const [graduationYear, setGraduationYear] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const departments = [
        'Computer Science',
        'Information Technology',
        'Electronics',
        'Mechanical',
        'Civil',
        'Electrical',
        'Other'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/onboarding', {
                department,
                graduationYear: parseInt(graduationYear)
            });

            // Update user in context
            updateUser({ ...user, department, graduationYear: parseInt(graduationYear) });
            navigate('/consent');
        } catch (err) {
            setError(err.response?.data?.error || 'Onboarding failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
                    <p className="mt-2 text-gray-600">We need a few details to get started</p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Department
                            </label>
                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Department</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Graduation Year"
                            type="number"
                            value={graduationYear}
                            onChange={(e) => setGraduationYear(e.target.value)}
                            required
                            min="2020"
                            max="2030"
                            placeholder="e.g., 2026"
                        />

                        {error && <ErrorMessage message={error} />}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? 'Saving...' : 'Continue'}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};
