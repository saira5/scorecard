import mongoose from 'mongoose';

const mongodbUri = process.env.MONGODB_URI;

if (!mongodbUri) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

async function connectToDb() {
    if (mongoose.connection.readyState === 1) {
        return mongoose;
    }

    await mongoose.connect(mongodbUri!);

    return mongoose;
}

export default connectToDb;
