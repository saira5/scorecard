import { AlertTriangle, CircleAlert, CircleCheck, Info, Loader } from 'lucide-react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';

import './globals.css';
import NavBar from '@/components/NavBar';
import CustomSessionProvider from '@/components/SessionProvider';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'MC Report Generator',
    description: "A tool to merge McDonald's report files into a single file",
    icons: {
        icon: '/images/mc-logo.png',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <CustomSessionProvider>
            <html lang="en">
                <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100`}>
                    <NavBar />
                    <div className="*:pt-20">{children}</div>
                    <Toaster
                        position="top-right"
                        icons={{
                            success: <CircleCheck className="h-5 w-5 text-green-500" />,
                            info: <Info className="h-5 w-5 text-blue-500" />,
                            warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
                            error: <CircleAlert className="h-5 w-5 text-red-500" />,
                            loading: <Loader className="h-5 w-5 text-gray-500 animate-spin" />,
                        }}
                        closeButton={true}
                    />
                </body>
            </html>
        </CustomSessionProvider>
    );
}
