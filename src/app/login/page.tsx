'use client';

import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { loginUser } from '@/actions/auth';
import ErrorMessage from '@/components/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const result = await loginUser(username, password);

        if (result?.error) {
            setError(result.error || 'Login failed. Please try again.');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <Card className="w-full max-w-lg shadow-2xl rounded-2xl border border-gray-200">
                <CardContent className="p-10 space-y-8">
                    <div className="flex flex-col items-between">
                        <div className="flex justify-center mb-6 gap-6">
                            <Image src="/images/mc-logo.png" alt="MC Logo" width={80} height={80} />
                            <Image src="/images/mc-logo-branch.png" alt="MC Logo" width={200} height={80} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 text-center">MC Report Generator</h1>
                        <h2 className="text-lg text-gray-600 text-center">Login to your account</h2>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-5">
                        <ErrorMessage error={error || ''} closeFn={() => setError('')} />
                        <div>
                            <Label htmlFor="username" className="text-base">
                                Username
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="h-12 text-base"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password" className="text-base">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-12 text-base pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                            {loading ? 'Logging In...' : 'Login'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
