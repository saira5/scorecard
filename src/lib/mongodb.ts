import { MongoClient, ServerApiVersion } from 'mongodb';

const mongodbUri = process.env.MONGODB_URI;

if (!mongodbUri) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const options = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
};

let client: MongoClient;

if (process.env.NODE_ENV === 'development') {
    const globalWithMongo = global as typeof globalThis & {
        _mongoClient?: MongoClient;
        _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClient) {
        globalWithMongo._mongoClient = new MongoClient(mongodbUri, options);
        globalWithMongo._mongoClientPromise = globalWithMongo._mongoClient.connect();
    }
    client = globalWithMongo._mongoClient;
} else {
    client = new MongoClient(mongodbUri, options);
}

export default client;
