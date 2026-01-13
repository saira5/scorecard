'use client';

import { UserCircle } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';

export default function SimpleNavbar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const hideNavBarUrls = ['/login'];

    const hideNavbar = hideNavBarUrls.some((url) => pathname.startsWith(url));
    if (hideNavbar) return null;

    return (
        <nav className="w-full border-b border-gray-700 bg-slate-900 shadow-sm absolute top-0 left-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Left Section: Logo and Navigation */}
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-xl font-bold text-white hover:text-gray-300 flex items-center gap-3">
                        <Image src="/images/mc-logo.png" alt="MC Logo" width={40} height={40} className="rounded-md" />
                        <Image
                            src="/images/mc-logo-branch-white.png"
                            alt="MC Branch Logo"
                            width={100}
                            height={40}
                            className="rounded-md"
                        />
                        MC Report Generator
                    </Link>

                    {/* Separator */}
                    <div className="h-6 w-px bg-gray-500" />

                    {/* Reports Link */}
                    <Link
                        href="/reports"
                        className="text-white font-semibold px-1 py-1 border border-transparent hover:border-gray-500 hover:bg-slate-800 rounded-md transition-all"
                    >
                        Reports History
                    </Link>
                </div>

                {/* Right Section: Profile / Auth Buttons */}
                <div className="flex items-center gap-4">
                    {session?.user ? (
                        <>
                            <Link href="/profile" className="text-white hover:text-gray-300">
                                <UserCircle size={28} />
                            </Link>
                            <Button
                                variant="destructive"
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => signOut()}
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <Link href="/login">
                            <Button variant="secondary" className="bg-gray-700 text-white hover:bg-gray-600">
                                Login
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
