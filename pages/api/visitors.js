```javascript
// In-memory storage for total visitor count
let totalVisitors = 0;

export default function handler(req, res) {
    if (req.method === 'POST') {
        // Increment total count
        totalVisitors++;
        return res.status(200).json({ count: totalVisitors });
    }

    if (req.method === 'GET') {
        // Return current total count
        return res.status(200).json({ count: totalVisitors });
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
}
```
