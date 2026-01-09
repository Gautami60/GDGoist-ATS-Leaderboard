import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Button, ErrorMessage, Card } from '../components/UI';

export const ConsentPage = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleAccept = async () => {
        setError('');
        setLoading(true);

        try {
            await api.post('/consent', { consented: true });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to record consent');
        } finally {
            setLoading(false);
        }
    };

    const handleDecline = () => {
        setError('You must accept the consent to use this platform.');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Data Privacy Consent</h1>
                    <p className="mt-2 text-gray-600">Please review and accept our data usage policy</p>
                </div>

                <Card>
                    <div className="prose max-w-none mb-6">
                        <h3 className="text-lg font-semibold mb-4">Consent for Data Processing</h3>

                        <p className="text-gray-700 mb-4">
                            By using the GDGoist ATS Leaderboard platform, you consent to the following:
                        </p>

                        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                            <li>Your resume will be parsed and analyzed to generate an employability score</li>
                            <li>Your score and department information will be displayed on an anonymous leaderboard</li>
                            <li>Your personal information (name, email) will be stored securely and not shared publicly</li>
                            <li>Resume files will be stored in encrypted cloud storage (AWS S3)</li>
                            <li>Only authorized administrators can view your complete profile</li>
                            <li>You can request data deletion at any time by contacting the administrator</li>
                        </ul>

                        <p className="text-gray-700 mb-4">
                            This platform complies with the Digital Personal Data Protection Act (DPDP) and follows
                            privacy-first principles. Your data will only be used for employability assessment and
                            will not be shared with external recruiters or third parties.
                        </p>

                        <p className="text-sm text-gray-600 italic">
                            Timestamp: {new Date().toLocaleString()}
                        </p>
                    </div>

                    {error && <ErrorMessage message={error} />}

                    <div className="flex gap-4 mt-6">
                        <Button
                            onClick={handleDecline}
                            variant="secondary"
                            className="flex-1"
                        >
                            Decline
                        </Button>
                        <Button
                            onClick={handleAccept}
                            disabled={loading}
                            className="flex-1"
                        >
                            {loading ? 'Processing...' : 'Accept & Continue'}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};
