import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    try {
        if (req.method === 'POST') {
            // Increment persistent counter
            const count = await kv.incr('visitor_count');
            return res.status(200).json({ count });
        }

        if (req.method === 'GET') {
            // Get current count (default to 0 if null)
            const count = await kv.get('visitor_count') || 0;
            return res.status(200).json({ count });
        }

        // Method not allowed
        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('KV Error:', error);
        // Return 0 if KV is not available (e.g., in local dev without env vars)
        return res.status(200).json({ count: 0 });
    }
}

