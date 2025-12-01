// Sample district coordinates for major Malaysian districts
const DISTRICT_COORDS = [
    { name: 'Kuala Lumpur', lat: 3.139, lon: 101.6869 },
    { name: 'Petaling', lat: 3.0738, lon: 101.5183 },
    { name: 'Klang', lat: 3.0333, lon: 101.45 },
    { name: 'Gombak', lat: 3.2667, lon: 101.65 },
    { name: 'Hulu Langat', lat: 3.0167, lon: 101.85 },
    { name: 'Sepang', lat: 2.7297, lon: 101.7433 },
    { name: 'Johor Bahru', lat: 1.4927, lon: 103.7414 },
    { name: 'Kota Tinggi', lat: 1.7333, lon: 103.9 },
    { name: 'Penang', lat: 5.4164, lon: 100.3327 },
    { name: 'Ipoh', lat: 4.5975, lon: 101.0901 },
    { name: 'Kota Bharu', lat: 6.1248, lon: 102.2386 },
    { name: 'Kuantan', lat: 3.8077, lon: 103.326 },
    { name: 'Kuching', lat: 1.5535, lon: 110.3593 },
    { name: 'Kota Kinabalu', lat: 5.9804, lon: 116.0735 }
];

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
        // Fetch rainfall data from Open-Meteo for each district
        const rainfallPromises = DISTRICT_COORDS.map(async (district) => {
            try {
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${district.lat}&longitude=${district.lon}&current=rain&timezone=auto`
                );
                const data = await response.json();

                return {
                    districtName: district.name,
                    rainfallMm: data.current?.rain || 0
                };
            } catch (err) {
                console.error(`Error fetching data for ${district.name}:`, err);
                return {
                    districtName: district.name,
                    rainfallMm: 0
                };
            }
        });

        const rainfallData = await Promise.all(rainfallPromises);
        res.status(200).json(rainfallData);
    } catch (error) {
        console.error('Error fetching rainfall data:', error);
        res.status(200).json([]);
    }
}
