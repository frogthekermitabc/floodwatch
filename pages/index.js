import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Timeline from '../components/Timeline';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const GeoJSON = dynamic(
    () => import('react-leaflet').then((mod) => mod.GeoJSON),
    { ssr: false }
);
const ScaleControl = dynamic(
    () => import('react-leaflet').then((mod) => mod.ScaleControl),
    { ssr: false }
);
const ZoomControl = dynamic(
    () => import('react-leaflet').then((mod) => mod.ZoomControl),
    { ssr: false }
);

const MapEffect = dynamic(
    () => import('../components/MapEffect'),
    { ssr: false }
);
const RainLayer = dynamic(
    () => import('../components/RainLayer'),
    { ssr: false }
);

export default function Home() {
    const [districts, setDistricts] = useState(null);
    const [rainfallData, setRainfallData] = useState([]);
    const [userDistrict, setUserDistrict] = useState(null);
    const [permission, setPermission] = useState('default');
    const [lastUpdated, setLastUpdated] = useState(null);

    // New state for selected district and timeline data
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [weatherData, setWeatherData] = useState(null);
    const [loadingWeather, setLoadingWeather] = useState(false);
    const [showRainLayer, setShowRainLayer] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [geocodeResults, setGeocodeResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Register Service Worker
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((reg) => console.log('SW registered:', reg))
                .catch((err) => console.error('SW registration failed:', err));
        }
    }, []);

    // Fetch Districts GeoJSON
    useEffect(() => {
        fetch('/api/districts')
            .then((res) => res.json())
            .then((data) => setDistricts(data))
            .catch((err) => console.error('Failed to load districts:', err));
    }, []);

    // Fetch Rainfall Data & Poll every 5 mins
    useEffect(() => {
        const fetchRain = () => {
            fetch('/api/rain')
                .then((res) => res.json())
                .then((data) => {
                    setRainfallData(data);
                    setLastUpdated(new Date());
                    checkUserDistrictRainfall(data, userDistrict);
                })
                .catch((err) => console.error('Failed to load rainfall:', err));
        };

        fetchRain();
        const interval = setInterval(fetchRain, 5 * 60 * 1000); // 5 mins
        return () => clearInterval(interval);
    }, [userDistrict]);

    // Request Notification Permission
    const requestPermission = () => {
        if (!('Notification' in window)) return;
        Notification.requestPermission().then((perm) => {
            setPermission(perm);
            if (perm === 'granted') {
                new Notification('Flood-Watch Enabled', {
                    body: 'You will be notified if rainfall in your area exceeds 100mm.',
                    icon: '/icon-192.png',
                });
            }
        });
    };

    // Check User Location
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Future: Use turf.js to find exact district
                },
                (err) => console.error('Geolocation error:', err)
            );
        }
    }, []);

    // Helper to find rainfall for a district
    const getRainfall = (districtName) => {
        const record = rainfallData.find(
            (r) =>
                r.districtName.toLowerCase() === districtName.toLowerCase() ||
                districtName.toLowerCase().includes(r.districtName.toLowerCase())
        );
        return record ? record.rainfallMm : 0;
    };

    // Check for alerts
    const checkUserDistrictRainfall = (data, currentDistrict) => {
        if (permission !== 'granted') return;
        const criticalDistricts = data.filter(d => d.rainfallMm >= 100);
        if (criticalDistricts.length > 0) {
            new Notification('Flood Warning!', {
                body: `${criticalDistricts.length} districts are experiencing heavy rainfall (>100mm).`,
                icon: '/icon-192.png',
                tag: 'flood-alert'
            });
        }
    };

    // Calculate centroid of a polygon (simple approximation)
    const getCentroid = (coordinates) => {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        const flatten = (arr) => {
            return arr.reduce((acc, val) =>
                Array.isArray(val[0]) ? acc.concat(flatten(val)) : acc.concat([val]), []
            );
        };

        // Handle MultiPolygon vs Polygon
        const points = flatten(coordinates);

        for (let i = 0; i < points.length; i++) {
            const [x, y] = points[i]; // GeoJSON is [lon, lat]
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }

        return {
            lat: (minY + maxY) / 2,
            lon: (minX + maxX) / 2
        };
    };

    // Handle district click
    const onDistrictClick = async (feature) => {
        const name = feature.properties.name || feature.properties.district || 'Unknown';
        setSelectedDistrict(name);
        setSelectedFeature(feature);
        setLoadingWeather(true);
        setWeatherData(null);

        try {
            // Calculate center for API query
            const center = getCentroid(feature.geometry.coordinates);

            // Fetch Open-Meteo data
            // Params: latitude, longitude, hourly=rain, past_days=1, forecast_days=1
            const res = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${center.lat}&longitude=${center.lon}&hourly=rain&past_days=1&forecast_days=2&timezone=auto`
            );
            const data = await res.json();

            setWeatherData({
                hourly: {
                    time: data.hourly.time,
                    rain: data.hourly.rain
                }
            });
        } catch (err) {
            console.error('Failed to fetch weather details:', err);
        } finally {
            setLoadingWeather(false);
        }
    };

    // Get list of all district names
    const districtList = useMemo(() => {
        if (!districts || !districts.features) return [];
        return districts.features.map(f => ({
            name: f.properties.name || f.properties.district || 'Unknown',
            feature: f
        }));
    }, [districts]);

    // Filter districts based on search
    const filteredDistricts = useMemo(() => {
        if (!searchQuery.trim()) return [];
        return districtList.filter(d =>
            d.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5); // Limit to 5 results
    }, [searchQuery, districtList]);

    // Handle search selection
    const handleSearchSelect = (district) => {
        setSearchQuery('');
        setShowSearchResults(false);
        setGeocodeResults([]);
        onDistrictClick(district.feature);
    };

    // Search for locations using Nominatim (cities, addresses, etc.)
    const searchLocations = async (query) => {
        if (!query.trim() || query.length < 3) {
            setGeocodeResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)},Malaysia&format=json&limit=5&addressdetails=1`
            );
            const data = await response.json();
            setGeocodeResults(data);
        } catch (err) {
            console.error('Geocoding error:', err);
            setGeocodeResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim().length >= 3) {
                searchLocations(searchQuery);
            } else {
                setGeocodeResults([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Handle geocode result selection
    const handleGeocodeSelect = async (result) => {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);

        setSearchQuery('');
        setShowSearchResults(false);
        setGeocodeResults([]);

        setGeocodeResults([]);

        const closestDistrict = findClosestDistrict(lat, lon);
        if (closestDistrict) {
            onDistrictClick(closestDistrict);
        }
    };

    // Helper to find closest district
    const findClosestDistrict = (lat, lon) => {
        if (!districts || !districts.features) return null;

        let closestDistrict = null;
        let minDistance = Infinity;

        for (const feature of districts.features) {
            const centroid = getCentroid(feature.geometry.coordinates);
            const distance = Math.sqrt(
                Math.pow(centroid.lat - lat, 2) + Math.pow(centroid.lon - lon, 2)
            );
            if (distance < minDistance) {
                minDistance = distance;
                closestDistrict = feature;
            }
        }
        return closestDistrict;
    };

    // Handle Locate Me
    const handleLocateMe = () => {
        if (!('geolocation' in navigator)) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const closest = findClosestDistrict(latitude, longitude);
                if (closest) {
                    onDistrictClick(closest);
                } else {
                    alert('Could not find a district near you.');
                }
            },
            (error) => {
                console.error('Error getting location:', error);
                alert('Unable to retrieve your location');
            }
        );
    };


    // Style function for GeoJSON
    const style = (feature) => {
        const districtName = feature.properties.name || feature.properties.district || 'Unknown';
        const rainfall = getRainfall(districtName);

        let color = '#3b82f6'; // blue <= 50
        if (rainfall > 50 && rainfall < 100) color = '#f97316'; // orange 50-100
        if (rainfall >= 100) color = '#ef4444'; // red >= 100

        // Highlight selected
        const isSelected = selectedDistrict === districtName;

        return {
            fillColor: color,
            weight: isSelected ? 3 : 1,
            opacity: 1,
            color: isSelected ? '#000' : 'white',
            dashArray: isSelected ? '' : '3',
            fillOpacity: 0.7,
        };
    };

    const onEachFeature = (feature, layer) => {
        const name = feature.properties.name || feature.properties.district || 'Unknown';
        // Remove bindPopup to use our custom bottom sheet instead
        // layer.bindPopup(...) 

        layer.on({
            click: (e) => {
                // Stop map from zooming if we want, or just let it be
                // L.DomEvent.stopPropagation(e);
                onDistrictClick(feature);
            }
        });
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <Head>
                <title>Malaysia Flood-Watch</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
            </Head>

            {/* Top Center Search Bar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] w-full max-w-md px-4">
                <div className="relative">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search districts, cities, or locations..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowSearchResults(true);
                            }}
                            onFocus={() => setShowSearchResults(true)}
                            onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                            className="w-full px-4 py-3 pr-10 text-sm bg-white border border-gray-300 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {showSearchResults && (filteredDistricts.length > 0 || geocodeResults.length > 0 || isSearching) && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto">
                            {isSearching && (
                                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                    Searching...
                                </div>
                            )}

                            {/* District matches */}
                            {filteredDistricts.length > 0 && (
                                <div>
                                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b">
                                        Districts
                                    </div>
                                    {filteredDistricts.map((district, idx) => (
                                        <button
                                            key={`district-${idx}`}
                                            onClick={() => handleSearchSelect(district)}
                                            className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center"
                                        >
                                            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                            </svg>
                                            {district.name}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Geocode results (cities, locations) */}
                            {geocodeResults.length > 0 && (
                                <div>
                                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b">
                                        Cities & Locations
                                    </div>
                                    {geocodeResults.map((result, idx) => (
                                        <button
                                            key={`geo-${idx}`}
                                            onClick={() => handleGeocodeSelect(result)}
                                            className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                                        >
                                            <div className="flex items-start">
                                                <svg className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <div>
                                                    <div className="font-medium">{result.display_name.split(',')[0]}</div>
                                                    <div className="text-xs text-gray-500 mt-0.5">{result.display_name}</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Header / Controls */}
            <div className="absolute top-20 md:top-4 left-4 z-[1000] bg-black/80 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-xs border border-gray-700">
                <h1 className="text-xl font-bold mb-2 text-white">🇲🇾 Flood-Watch</h1>

                <div className="space-y-2 text-sm text-gray-200">
                    <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                        <span>≤ 50mm (Normal)</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span>
                        <span>50–100mm (Warning)</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                        <span>≥ 100mm (Danger)</span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
                    {permission === 'default' && (
                        <button
                            onClick={requestPermission}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            Enable Alerts
                        </button>
                    )}
                    {permission === 'granted' && (
                        <div className="text-green-400 text-sm flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Alerts Active
                        </div>
                    )}

                    <button
                        onClick={() => setShowRainLayer(!showRainLayer)}
                        className={`w-full py-2 px-4 rounded transition-colors text-sm font-medium flex items-center justify-center ${showRainLayer
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                            }`}
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {showRainLayer ? 'Hide Radar' : 'Show Radar'}
                    </button>



                    <button
                        onClick={handleLocateMe}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Locate Me
                    </button>

                    {lastUpdated && (
                        <p className="text-xs text-gray-400 mt-2">
                            Updated: {lastUpdated.toLocaleTimeString()}
                        </p>
                    )}
                </div>
            </div>

            {/* Map */}
            <div id="map-container" className="flex-1 relative">
                {typeof window !== 'undefined' && (
                    <MapContainer
                        center={[4.2105, 101.9758]} // Center of Malaysia
                        zoom={6}
                        scrollWheelZoom={true}
                        zoomControl={false}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {districts && (
                            <GeoJSON
                                data={districts}
                                style={style}
                                onEachFeature={onEachFeature}
                            />
                        )}
                        <ScaleControl position="bottomleft" />
                        <ZoomControl position="bottomright" />
                        <MapEffect selectedFeature={selectedFeature} />
                        {showRainLayer && <RainLayer />}
                    </MapContainer>
                )}

                {/* Loading Indicator */}
                {loadingWeather && (
                    <div className="absolute inset-0 z-[1500] flex items-center justify-center bg-black bg-opacity-20 pointer-events-none">
                        <div className="bg-white p-3 rounded-full shadow-lg animate-bounce">
                            <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            {/* Timeline Bottom Sheet */}
            {
                selectedDistrict && weatherData && (
                    <Timeline
                        data={weatherData}
                        districtName={selectedDistrict}
                        onClose={() => {
                            setSelectedDistrict(null);
                            setSelectedFeature(null);
                        }}
                    />
                )
            }
        </div >
    );
}
