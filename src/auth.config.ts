import { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { getBaseUrl } from './utils';

const authRoutes = ['/login'];

const publicRoutes = ['/login'];

export default {
    providers: [
        Credentials({
            name: 'credentials',
            id: 'credentials',
            credentials: {
                username: {
                    type: 'text',
                    label: 'Username',
                },
                password: {
                    type: 'password',
                    label: 'Password',
                },
            },
            authorize: async (credentials) => {
                if (!credentials) return null;

                const { username, password } = credentials;

                if (!username || !password) {
                    return null;
                }

                try {
                    const res = await fetch(`${getBaseUrl()}/api/authenticate-user`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            username,
                            password,
                        }),
                    });

                    console.log('Made request to authenticate user', {
                        username,
                        response: res,
                    });

                    if (!res.ok) {
                        return null;
                    }

                    const { user } = await res.json();

                    return user;
                } catch (error) {
                    console.error('Error fetching user', error);

                    return null;
                }
            },
        }),
    ],
    callbacks: {
        authorized({ request: { nextUrl }, auth }) {
            const isLoggedIn = !!auth?.user;
            const { pathname } = nextUrl;

            if (isLoggedIn && authRoutes.includes(pathname)) {
                return Response.redirect(new URL('/', nextUrl));
            }

            if (publicRoutes.includes(pathname)) {
                return true;
            }

            return isLoggedIn;
        },
        async jwt({ token, user, session, trigger }) {
            if (trigger === 'update') {
                return { ...token, ...session.user };
            }

            if (user) {
                token.id = user.id;
                token.name = user.username;
                token.username = user.username;
                token.createdAt = user.createdAt;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.name = token.username;
                session.user.username = token.username;
                session.user.createdAt = token.createdAt;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
} satisfies NextAuthConfig;
