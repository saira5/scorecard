'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'sonner';

import { updatePassword } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
    const { data: session, status } = useSession();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    if (status === 'loading') {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    const username = session?.user?.name ?? 'Unknown';

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentPassword) {
            toast.error('Please enter your current password.');
            return;
        }

        if (newPassword.length < 3) {
            toast.error('New password must be at least 3 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        setLoading(true);
        const result = await updatePassword(currentPassword, newPassword);
        setLoading(false);

        if (result?.error) {
            toast.error(result.error || 'Failed to update password');
        } else {
            toast.success('Password updated successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <Card className="w-full max-w-md shadow-lg rounded-2xl">
                <CardContent className="p-8 space-y-6">
                    <h1 className="text-3xl font-bold text-center text-gray-800">Profile</h1>

                    <div className="text-center">
                        <p className="text-sm text-gray-500">Username</p>
                        <p className="text-xl font-semibold text-gray-800">{username}</p>
                    </div>

                    <hr className="my-4" />

                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-700">Change Password</h2>

                        <div>
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
