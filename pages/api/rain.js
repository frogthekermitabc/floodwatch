// Comprehensive district coordinates covering all Malaysian states
const DISTRICT_COORDS = [
    // Selangor
    { name: 'Kuala Lumpur', lat: 3.139, lon: 101.6869 },
    { name: 'Petaling', lat: 3.0738, lon: 101.5183 },
    { name: 'Klang', lat: 3.0333, lon: 101.45 },
    { name: 'Gombak', lat: 3.2667, lon: 101.65 },
    { name: 'Hulu Langat', lat: 3.0167, lon: 101.85 },
    { name: 'Sepang', lat: 2.7297, lon: 101.7433 },
    { name: 'Kuala Selangor', lat: 3.3333, lon: 101.25 },
    { name: 'Hulu Selangor', lat: 3.5, lon: 101.5 },
    { name: 'Sabak Bernam', lat: 3.7167, lon: 100.9833 },

    // Johor
    { name: 'Johor Bahru', lat: 1.4927, lon: 103.7414 },
    { name: 'Kota Tinggi', lat: 1.7333, lon: 103.9 },
    { name: 'Kluang', lat: 2.0333, lon: 103.3167 },
    { name: 'Mersing', lat: 2.4333, lon: 103.8333 },
    { name: 'Segamat', lat: 2.5167, lon: 102.8167 },
    { name: 'Batu Pahat', lat: 1.85, lon: 102.9333 },
    { name: 'Muar', lat: 2.0442, lon: 102.5689 },
    { name: 'Pontian', lat: 1.4833, lon: 103.3833 },
    { name: 'Tangkak', lat: 2.2667, lon: 102.5833 },
    { name: 'Kulai', lat: 1.6556, lon: 103.6 },

    // Penang
    { name: 'Penang', lat: 5.4164, lon: 100.3327 },
    { name: 'Seberang Perai', lat: 5.3833, lon: 100.4 },

    // Perak
    { name: 'Ipoh', lat: 4.5975, lon: 101.0901 },
    { name: 'Taiping', lat: 4.85, lon: 100.7333 },
    { name: 'Kuala Kangsar', lat: 4.7667, lon: 100.9333 },
    { name: 'Teluk Intan', lat: 4.0275, lon: 101.0211 },
    { name: 'Manjung', lat: 4.2, lon: 100.6333 },

    // Kelantan
    { name: 'Kota Bharu', lat: 6.1248, lon: 102.2386 },
    { name: 'Pasir Mas', lat: 6.05, lon: 102.1333 },
    { name: 'Tanah Merah', lat: 5.8, lon: 102.15 },
    { name: 'Machang', lat: 5.7667, lon: 102.2167 },
    { name: 'Gua Musang', lat: 4.8833, lon: 101.9667 },

    // Terengganu
    { name: 'Kuala Terengganu', lat: 5.3302, lon: 103.1408 },
    { name: 'Kemaman', lat: 4.2333, lon: 103.4167 },
    { name: 'Dungun', lat: 4.7667, lon: 103.4167 },

    // Pahang
    { name: 'Kuantan', lat: 3.8077, lon: 103.326 },
    { name: 'Temerloh', lat: 3.45, lon: 102.4167 },
    { name: 'Bentong', lat: 3.5167, lon: 101.9 },
    { name: 'Raub', lat: 3.7917, lon: 101.8583 },
    { name: 'Jerantut', lat: 3.9333, lon: 102.3667 },

    // Negeri Sembilan
    { name: 'Seremban', lat: 2.7258, lon: 101.9424 },
    { name: 'Port Dickson', lat: 2.5167, lon: 101.8 },
    { name: 'Kuala Pilah', lat: 2.7333, lon: 102.25 },

    // Melaka
    { name: 'Melaka', lat: 2.1896, lon: 102.2501 },

    // Kedah
    { name: 'Alor Setar', lat: 6.1248, lon: 100.3678 },
    { name: 'Sungai Petani', lat: 5.6472, lon: 100.4878 },
    { name: 'Kulim', lat: 5.3667, lon: 100.5667 },
    { name: 'Baling', lat: 5.6833, lon: 100.9167 },

    // Perlis
    { name: 'Kangar', lat: 6.4333, lon: 100.1833 },

    // Sarawak
    { name: 'Kuching', lat: 1.5535, lon: 110.3593 },
    { name: 'Miri', lat: 4.3997, lon: 113.9914 },
    { name: 'Sibu', lat: 2.3, lon: 111.8167 },
    { name: 'Bintulu', lat: 3.1667, lon: 113.0333 },
    { name: 'Sarikei', lat: 2.1167, lon: 111.5167 },
    { name: 'Kapit', lat: 2.0167, lon: 112.9333 },
    { name: 'Samarahan', lat: 1.4667, lon: 110.4333 },
    { name: 'Sri Aman', lat: 1.2333, lon: 111.45 },
    { name: 'Betong', lat: 1.0833, lon: 111.5333 },
    { name: 'Limbang', lat: 4.75, lon: 115.0 },
    { name: 'Mukah', lat: 2.9, lon: 112.0833 },

    // Sabah
    { name: 'Kota Kinabalu', lat: 5.9804, lon: 116.0735 },
    { name: 'Sandakan', lat: 5.8402, lon: 118.1179 },
    { name: 'Tawau', lat: 4.2481, lon: 117.8933 },
    { name: 'Lahad Datu', lat: 5.0322, lon: 118.3401 },
    { name: 'Keningau', lat: 5.3389, lon: 116.1622 },
    { name: 'Beaufort', lat: 5.3472, lon: 115.7469 },
    { name: 'Kudat', lat: 6.8833, lon: 116.8333 },
    { name: 'Semporna', lat: 4.4794, lon: 118.6106 },
    { name: 'Ranau', lat: 5.9597, lon: 116.6833 },
    { name: 'Papar', lat: 5.7333, lon: 115.9333 }
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
