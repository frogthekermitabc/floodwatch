import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const MapEffect = ({ selectedFeature }) => {
    const map = useMap();

    useEffect(() => {
        if (selectedFeature) {
            try {
                const bounds = L.geoJSON(selectedFeature).getBounds();
                if (bounds.isValid()) {
                    map.flyToBounds(bounds, {
                        padding: [50, 50],
                        duration: 1.5,
                        easeLinearity: 0.25
                    });
                }
            } catch (e) {
                console.error("Error zooming to feature:", e);
            }
        }
    }, [selectedFeature, map]);

    return null;
};

export default MapEffect;
