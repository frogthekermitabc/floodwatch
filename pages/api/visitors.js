// In-memory storage for visit timestamps
let visits = [];

export default function handler(req, res) {
    const now = Date.now();
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);

    if (req.method === 'POST') {
        // Add new visit
        visits.push(now);

        // Clean up old visits (older than 24 hours)
        visits = visits.filter(timestamp => timestamp > twentyFourHoursAgo);

        // Return current count
        return res.status(200).json({ count: visits.length });
    }

    if (req.method === 'GET') {
        // Clean up old visits
        visits = visits.filter(timestamp => timestamp > twentyFourHoursAgo);

        // Return current count
        return res.status(200).json({ count: visits.length });
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
}
