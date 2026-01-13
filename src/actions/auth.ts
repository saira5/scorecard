'use server';

import bcryptjs from 'bcryptjs';
import { AuthError } from 'next-auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

import { auth, signIn } from '@/auth';
import connectToDb from '@/lib/mongoose';
import User from '@/models/User';
import { hashPassword } from '@/utils/password';

export const loginUser = async (username: string, password: string) => {
    try {
        await signIn('credentials', {
            username,
            password,
            redirectTo: '/',
        });
    } catch (error) {
        if (isRedirectError(error)) throw error;

        if (error instanceof AuthError) {
            if ('type' in error) {
                switch (error.type) {
                    case 'CredentialsSignin':
                        return { error: 'Invalid credentials' };
                    default:
                        return { error: 'An unexpected error occurred. Please try again.' };
                }
            } else {
                return { error: 'An unexpected error occurred. Please try again.' };
            }
        }

        throw error;
    }
};

export async function updatePassword(currentPassword: string, newPassword: string) {
    try {
        const session = await auth();

        if (!session?.user?.username) {
            return { error: 'Unauthorized' };
        }

        await connectToDb();

        const user = await User.findOne({ username: session.user.username });

        if (!user) return { error: 'User not found' };

        const isPasswordValid = await bcryptjs.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return { error: 'Current password is incorrect' };
        }

        const hashedPassword = hashPassword(newPassword);
        user.password = hashedPassword;

        await user.save();

        return { success: true };
    } catch (error) {
        console.error('Error updating password:', error);
        return { error: 'Internal server error' };
    }
}
