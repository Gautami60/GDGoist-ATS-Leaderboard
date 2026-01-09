import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Card, Button, ErrorMessage, SuccessMessage, LoadingSpinner } from '../components/UI';
import api from '../api/axios';
import axios from 'axios';

export const StudentDashboard = () => {
    const [score, setScore] = useState(null);
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch user's data including score
            const response = await api.get('/me');
            console.log('Dashboard data:', response.data);

            // Set score from response
            if (response.data.score) {
                setScore(response.data.score);
            }

            // Set resume status if available
            if (response.data.resumeStatus) {
                setResume(response.data.resumeStatus);
            }

            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!validTypes.includes(file.type)) {
                setError('Only PDF and DOCX files are allowed');
                return;
            }
            setSelectedFile(file);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        setUploadLoading(true);
        setError('');
        setSuccess('');

        try {
            console.log('Step 1: Requesting presigned URL...');
            console.log('File:', selectedFile.name, 'Type:', selectedFile.type, 'Size:', selectedFile.size);

            // Step 1: Request presigned URL
            const urlResponse = await api.post('/resumes/upload-url', {
                filename: selectedFile.name,
                contentType: selectedFile.type,
                size: selectedFile.size
            });

            console.log('Step 1 Complete: Received presigned URL');
            const { uploadUrl, resumeId } = urlResponse.data;
            console.log('Resume ID:', resumeId);
            console.log('Upload URL:', uploadUrl.substring(0, 100) + '...');

            // Step 2: Upload to S3
            console.log('Step 2: Uploading to S3...');
            const s3Response = await axios.put(uploadUrl, selectedFile, {
                headers: {
                    'Content-Type': selectedFile.type
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log('Upload progress:', percentCompleted + '%');
                }
            });

            console.log('Step 2 Complete: S3 upload successful', s3Response.status);

            // Step 3: Notify backend
            console.log('Step 3: Notifying backend...');
            await api.post('/resumes/complete', {
                resumeId,
                size: selectedFile.size
            });

            console.log('Step 3 Complete: Backend notified');
            setSuccess('Resume uploaded successfully! It will be processed shortly.');
            setSelectedFile(null);
            // Reset file input
            document.getElementById('resume-upload').value = '';

            // Refresh dashboard data
            fetchDashboardData();
        } catch (err) {
            console.error('Upload error:', err);
            console.error('Error response:', err.response);
            console.error('Error message:', err.message);

            let errorMessage = 'Upload failed. ';

            if (err.response) {
                // Backend error
                errorMessage += err.response.data?.error || `Server error (${err.response.status})`;
            } else if (err.request) {
                // Network error (likely S3 CORS or connectivity)
                errorMessage += 'Network error. Please check your connection and S3 CORS configuration.';
            } else {
                // Other error
                errorMessage += err.message || 'Unknown error occurred.';
            }

            setError(errorMessage);
        } finally {
            setUploadLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Dashboard</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Total Score Card */}
                    <Card>
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Total Employability Score</h3>
                        <p className="text-3xl font-bold text-gray-900">{score?.totalScore || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Out of 100</p>
                    </Card>

                    {/* ATS Score Card */}
                    <Card>
                        <h3 className="text-sm font-medium text-gray-600 mb-2">ATS Score</h3>
                        <p className="text-3xl font-bold text-blue-600">{score?.atsComponent || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">50% weight</p>
                    </Card>

                    {/* GitHub Score Card */}
                    <Card>
                        <h3 className="text-sm font-medium text-gray-600 mb-2">GitHub Score</h3>
                        <p className="text-3xl font-bold text-gray-400">Coming Soon</p>
                        <p className="text-xs text-gray-500 mt-1">30% weight</p>
                    </Card>
                </div>

                {/* Resume Upload Section */}
                <Card className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Resume</h3>

                    {error && <ErrorMessage message={error} />}
                    {success && <SuccessMessage message={success} />}

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Resume (PDF or DOCX)
                        </label>
                        <input
                            id="resume-upload"
                            type="file"
                            accept=".pdf,.docx"
                            onChange={handleFileSelect}
                            className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
                        />
                        {selectedFile && (
                            <p className="mt-2 text-sm text-gray-600">
                                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                            </p>
                        )}
                    </div>

                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || uploadLoading}
                        className="mt-4"
                    >
                        {uploadLoading ? 'Uploading...' : 'Upload Resume'}
                    </Button>

                    <p className="mt-4 text-sm text-gray-500">
                        Your resume will be analyzed using our ATS scoring system. Results typically appear within a few minutes.
                    </p>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                        <a href="/leaderboard" className="block text-blue-600 hover:text-blue-700">
                            → View Leaderboard
                        </a>
                    </div>
                </Card>
            </div>
        </div>
    );
};
