import { useEffect, useState } from 'react';
import { TileLayer } from 'react-leaflet';

const RainLayer = () => {
    const [timestamp, setTimestamp] = useState(null);

    useEffect(() => {
        const fetchRainData = async () => {
            try {
                const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
                const data = await res.json();

                // Get the latest available past timestamp (radar data)
                if (data.radar && data.radar.past && data.radar.past.length > 0) {
                    const latest = data.radar.past[data.radar.past.length - 1];
                    setTimestamp(latest.time);
                }
            } catch (err) {
                console.error('Failed to fetch rain viewer data:', err);
            }
        };

        fetchRainData();
        // Refresh every 10 minutes
        const interval = setInterval(fetchRainData, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (!timestamp) return null;

    return (
        <TileLayer
            url={`https://tile.rainviewer.com/${timestamp}/256/{z}/{x}/{y}/2/1_1.png`}
            opacity={0.7}
            attribution='&copy; <a href="https://www.rainviewer.com">RainViewer</a>'
        />
    );
};

export default RainLayer;
