import { MongoClient } from 'mongodb';

let cachedClient = null;

async function connectToDatabase() {
    if (cachedClient) return cachedClient;
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    cachedClient = client;
    return client;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

    try {
        const client = await connectToDatabase();
        // Since your URI points to the cluster, we specify the 'portfolio' DB here
        const db = client.db('portfolio');
        const collection = db.collection('inquiries');

        const { name, email, message } = req.body;
        
        await collection.insertOne({
            name,
            email,
            message,
            receivedAt: new Date()
        });

        return res.status(200).json({ success: true, message: 'Sync Successful!' });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Database Sync Failed' });
    }
}