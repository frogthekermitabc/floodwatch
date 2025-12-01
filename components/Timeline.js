import { useMemo } from 'react';

export default function Timeline({ data, onClose, districtName }) {
    // Data format expected: { hourly: { time: [], rain: [] }, current: { rain: 0 } }

    // Map WMO codes to icons
    const getWeatherIcon = (code) => {
        if (code === 0) return '☀️';
        if (code >= 1 && code <= 3) return '⛅';
        if (code === 45 || code === 48) return '🌫️';
        if (code >= 51 && code <= 67) return '🌧️';
        if (code >= 80 && code <= 82) return '🌧️';
        if (code >= 95 && code <= 99) return '⛈️';
        return '';
    };

    const chartData = useMemo(() => {
        if (!data?.hourly) return [];

        const now = new Date();
        const currentHour = now.getHours();

        // Filter for -12h to +12h from now
        return data.hourly.time.map((t, i) => {
            const date = new Date(t);
            return {
                time: date,
                hour: date.getHours(),
                rain: data.hourly.rain[i] || 0,
                weatherCode: data.hourly.weatherCode ? data.hourly.weatherCode[i] : null,
                isPast: date < now,
                isCurrent: date.getHours() === currentHour
            };
        }).filter(item => {
            const diff = (item.time - now) / (1000 * 60 * 60);
            return diff >= -12 && diff <= 12;
        });
    }, [data]);

    if (!data) return null;

    const maxRain = Math.max(...chartData.map(d => d.rain), 10); // Min scale 10mm

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-[2000] p-6 transition-transform duration-300 transform translate-y-0 max-h-[50vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{districtName}</h2>
                    <p className="text-sm text-gray-500">24-Hour Rainfall Timeline</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="flex items-end space-x-2 h-48 overflow-x-auto pb-2 pt-6">
                {chartData.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center flex-shrink-0 w-8 group">
                        {/* Weather Icon */}
                        <div className="mb-1 text-xs h-4">
                            {getWeatherIcon(item.weatherCode)}
                        </div>

                        <div className="relative w-full flex justify-center items-end h-32 bg-gray-50 rounded-b-sm">
                            <div
                                className={`w-full rounded-t-sm transition-all duration-500 ${item.isCurrent ? 'bg-blue-600 animate-pulse' :
                                    item.isPast ? 'bg-blue-300' : 'bg-blue-400 opacity-50'
                                    }`}
                                style={{ height: `${(item.rain / maxRain) * 100}%` }}
                            >
                                {/* Tooltip */}
                                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                                    {item.rain.toFixed(1)} mm
                                </div>
                            </div>
                        </div>
                        <span className={`text-xs mt-2 ${item.isCurrent ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
                            {item.hour}:00
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex justify-center space-x-6 text-xs text-gray-500">
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-300 mr-2 rounded-sm"></div>
                    <span>Past</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-600 mr-2 rounded-sm"></div>
                    <span>Current</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-400 opacity-50 mr-2 rounded-sm"></div>
                    <span>Forecast</span>
                </div>
            </div>

            <div className="mt-4 text-center">
                <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-400 hover:underline">
                    Weather data by Open-Meteo.com
                </a>
            </div>
        </div>
    );
}
