export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Fetch CSV data
        const response = await fetch('https://malay-flood.vercel.app/gpm_latest.csv');

        if (!response.ok) {
            throw new Error('Failed to fetch rainfall data');
        }

        const csvText = await response.text();
        const lines = csvText.split('\n');
        const data = [];

        // Parse CSV (assuming header: districtName,rainfallMm)
        // Skip header row if present
        const startIndex = lines[0].toLowerCase().includes('district') ? 1 : 0;

        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const [districtName, rainfallMm] = line.split(',');

            if (districtName) {
                data.push({
                    districtName: districtName.trim(),
                    rainfallMm: parseFloat(rainfallMm) || 0
                });
            }
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching rainfall data:', error);
        // Fallback to empty array or mock data if needed, but returning 200 with empty list is safer than 500
        // The frontend should handle missing data gracefully (e.g. show 0mm)
        res.status(200).json([]);
    }
}
