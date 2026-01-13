import bcryptjs from 'bcryptjs';

import connectToDb from '@/lib/mongoose';
import User, { UserDocument } from '@/models/User';

export const POST = async (req: Request) => {
    const { username, password } = await req.json();

    if (!username || !password) {
        console.log('Username or password not provided', {
            username,
            password,
        });

        return Response.json(
            {
                error: 'Username and password are required',
                user: null,
            },
            { status: 400 },
        );
    }

    await connectToDb();

    const user: UserDocument | null = await User.findOne({
        username,
    });

    console.log('Made request to MongoDB to get User', {
        user,
    });

    if (!user) {
        return Response.json(
            {
                error: 'User not found',
                user: null,
            },
            { status: 404 },
        );
    }

    const isPasswordValid = await bcryptjs.compare(password as string, user.password);

    if (!isPasswordValid) {
        console.log('Invalid password');

        return Response.json(
            {
                error: 'Invalid Password',
                user: null,
            },
            { status: 404 },
        );
    }

    return Response.json(
        {
            error: null,
            user: {
                id: user._id,
                username: user.username,
                createdAt: user.createdAt,
            },
        },
        { status: 200 },
    );
};
