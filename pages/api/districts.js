import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    try {
        const filePath = path.join(process.cwd(), 'public', 'malaysia-districts.geojson');
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const geoJson = JSON.parse(fileContents);

        res.status(200).json(geoJson);
    } catch (error) {
        console.error('Error reading GeoJSON:', error);
        res.status(500).json({ error: 'Failed to load district data' });
    }
}
