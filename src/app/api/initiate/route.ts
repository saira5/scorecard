import connectToDb from '@/lib/mongoose';
import User from '@/models/User';
import { hashPassword } from '@/utils/password';

export const GET = async (_req: Request) => {
    console.log('Initiating User!');

    await connectToDb();

    // Clean up environment variables in case they have quotes
    const adminUsername = process.env.ADMIN_USERNAME?.replace(/['"]/g, '');
    const adminPassword = process.env.ADMIN_PASSWORD?.replace(/['"]/g, '');

    if (!adminUsername || !adminPassword) {
        console.error('Admin credentials are not set in environment variables');
        return new Response('Admin credentials are not set', { status: 500 });
    }

    const user = await User.findOne({ username: adminUsername });

    if (user) {
        console.log('User already exists, updating password');
        user.password = hashPassword(adminPassword);
        await user.save();
        return Response.json({ message: 'Admin password updated successfully', username: adminUsername });
    }

    const newUser = new User({
        username: adminUsername,
        password: hashPassword(adminPassword),
    });

    await newUser.save();

    console.log('New user created:', newUser);

    return Response.json({ message: 'Admin user created successfully', username: adminUsername });
};
