import connectToDb from '@/lib/mongoose';
import User from '@/models/User';
import { hashPassword } from '@/utils/password';

export const GET = async (req: Request) => {
    console.log('Initiating User!');

    await connectToDb();

    const user = await User.findOne({});

    if (user) {
        console.log('User already exists');
        return Response.redirect(new URL('/login', req.url));
    }

    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
        console.error('Admin credentials are not set in environment variables');
        return new Response('Admin credentials are not set', { status: 500 });
    }

    const newUser = new User({
        username: process.env.ADMIN_USERNAME,
        password: hashPassword(process.env.ADMIN_PASSWORD),
    });

    await newUser.save();

    console.log('New user created:', newUser);

    return Response.redirect(new URL('/login', req.url));
};
