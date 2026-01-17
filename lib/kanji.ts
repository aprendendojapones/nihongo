export interface KanjiStroke {
    id: string;
    path: string;
    type: string;
}

export interface KanjiData {
    char: string;
    unicode: string;
    strokes: KanjiStroke[];
}

export async function fetchKanjiData(char: string): Promise<KanjiData | null> {
    try {
        const unicode = char.charCodeAt(0).toString(16).padStart(5, '0');
        const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${unicode}.svg`;

        const response = await fetch(url);
        if (!response.ok) return null;

        const svgText = await response.text();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');

        const strokePaths = svgDoc.querySelectorAll('path');
        const strokes: KanjiStroke[] = Array.from(strokePaths).map((path, index) => ({
            id: path.getAttribute('id') || `stroke-${index}`,
            path: path.getAttribute('d') || '',
            type: path.getAttribute('kvg:type') || ''
        }));

        return {
            char,
            unicode,
            strokes
        };
    } catch (error) {
        console.error('Error fetching Kanji data:', error);
        return null;
    }
}

// Simple distance check between two points
export function getDistance(p1: { x: number, y: number }, p2: { x: number, y: number }) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// Basic stroke validation (start and end points)
// Reference paths are 109x109, user paths are 400x400
export function validateStroke(userPoints: { x: number, y: number }[], refPath: string) {
    if (!userPoints || userPoints.length < 2) return false;

    // Simplified parser for start/end points from SVG path
    // Example: "M14.25,24.95c1.84,0.54...L88.22,20.72"
    const mMatch = refPath.match(/M\s*([\d.]+)[,\s]+([\d.]+)/);
    const lMatch = refPath.match(/[LC]\s*([\d.]+)[,\s]+([\d.]+)\s*$/) || refPath.match(/[\d.]+[,\s]+([\d.]+)\s*$/);

    if (!mMatch) return false;

    const refStart = { x: parseFloat(mMatch[1]) * (400 / 109), y: parseFloat(mMatch[2]) * (400 / 109) };

    // For end point, it's trickier with beziers, but let's try to find the last pair of numbers
    const allCoords = refPath.match(/[\d.]+[,\s]+[\d.]+/g);
    const lastCoord = allCoords ? allCoords[allCoords.length - 1].split(/[,\s]+/) : null;
    const refEnd = lastCoord ? { x: parseFloat(lastCoord[0]) * (400 / 109), y: parseFloat(lastCoord[1]) * (400 / 109) } : refStart;

    const userStart = userPoints[0];
    const userEnd = userPoints[userPoints.length - 1];

    const startDist = getDistance(userStart, refStart);
    const endDist = getDistance(userEnd, refEnd);

    // Threshold of 50 pixels (on a 400x400 canvas)
    const threshold = 60;

    return startDist < threshold && endDist < threshold;
}
