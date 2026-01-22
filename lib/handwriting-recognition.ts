// Handwriting recognition utilities
// Simple stroke-based recognition for Japanese characters

import { Point, Stroke, CharacterPattern, ALL_PATTERNS } from '@/data/character-patterns';

/**
 * Analyze stroke direction based on start and end points
 */
/**
 * Analyze stroke direction based on start and end points
 */
export function analyzeStrokeDirection(points: Point[]): Stroke['direction'] {
    if (points.length < 2) return 'curve';

    const start = points[0];
    const end = points[points.length - 1];

    const dx = end.x - start.x;
    const dy = end.y - start.y;

    // Calculate angle in degrees (-180 to 180)
    // 0 is Right, 90 is Down, 180/-180 is Left, -90 is Up
    // Curve detection: Check if path length is significantly longer than distance
    let pathLength = 0;
    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        pathLength += Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }

    const distance = Math.sqrt(dx * dx + dy * dy);

    // If path is 20% longer than straight line, consider it a curve
    // Also ensure it's not just jitter (min length check)
    if (distance > 0.05 && pathLength / distance > 1.2) {
        return 'curve';
    }

    // Calculate angle in degrees (-180 to 180)
    // 0 is Right, 90 is Down, 180/-180 is Left, -90 is Up
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Horizontal: -25 to 25 (Right) OR 155 to 180 / -180 to -155 (Left)
    if (Math.abs(angle) < 25 || Math.abs(angle) > 155) {
        return 'horizontal';
    }

    // Vertical: 65 to 115 (Down) OR -115 to -65 (Up)
    if ((angle > 65 && angle < 115) || (angle > -115 && angle < -65)) {
        return 'vertical';
    }

    // Diagonal Right (\): 25 to 65 (Down-Right) OR -155 to -115 (Up-Left)
    if ((angle >= 25 && angle <= 65) || (angle >= -155 && angle <= -115)) {
        return 'diagonal-right';
    }

    // Diagonal Left (/): 115 to 155 (Down-Left) OR -65 to -25 (Up-Right)
    if ((angle >= 115 && angle <= 155) || (angle >= -65 && angle <= -25)) {
        return 'diagonal-left';
    }

    return 'curve';
}

/**
 * Normalize canvas coordinates to 0-1 range
 */
export function normalizePoints(points: Point[], canvasWidth: number, canvasHeight: number): Point[] {
    return points.map(p => ({
        x: p.x / canvasWidth,
        y: p.y / canvasHeight
    }));
}

/**
 * Count distinct strokes from canvas data
 */
export function countStrokes(strokes: Stroke[]): number {
    return strokes.length;
}

/**
 * Simple recognition based on stroke count and direction
 * Returns top 3 candidates with confidence scores
 */
export function recognizeCharacter(
    strokes: Stroke[],
    expectedChar?: string
): { char: string; confidence: number }[] {

    const strokeCount = strokes.length;

    // If no strokes, return empty
    if (strokeCount === 0) {
        return [];
    }

    // Analyze directions of user strokes
    const userDirections = strokes.map(s => analyzeStrokeDirection(s.points));

    // Filter candidates by stroke count (allow ±1 tolerance)
    const candidates = ALL_PATTERNS.filter(pattern =>
        Math.abs(pattern.strokeCount - strokeCount) <= 1
    );

    if (candidates.length === 0) {
        // No matches, return most common characters with that stroke count
        return ALL_PATTERNS
            .filter(p => p.strokeCount === strokeCount)
            .slice(0, 3)
            .map(p => ({ char: p.char, confidence: 0.3 }));
    }

    // Calculate confidence based on stroke count match, direction match, and complexity
    const results = candidates.map(pattern => {
        let confidence = 0.5; // Base confidence

        // Exact stroke count match
        if (pattern.strokeCount === strokeCount) {
            confidence += 0.2;
        }

        // Direction matching
        if (pattern.expectedDirections && pattern.expectedDirections.length > 0) {
            let directionMatches = 0;
            const minStrokes = Math.min(userDirections.length, pattern.expectedDirections.length);

            for (let i = 0; i < minStrokes; i++) {
                if (userDirections[i] === pattern.expectedDirections[i]) {
                    directionMatches++;
                } else if (
                    // Allow some flexibility between similar directions
                    (userDirections[i] === 'curve' && pattern.expectedDirections[i] !== 'horizontal' && pattern.expectedDirections[i] !== 'vertical') ||
                    (pattern.expectedDirections[i] === 'curve' && userDirections[i] !== 'horizontal' && userDirections[i] !== 'vertical')
                ) {
                    directionMatches += 0.5; // Partial match for curves
                }
            }

            const directionScore = (directionMatches / Math.max(pattern.expectedDirections.length, 1)) * 0.3;
            confidence += directionScore;
        }

        // Bonus if it matches expected character
        if (expectedChar && pattern.char === expectedChar) {
            confidence += 0.1;
        }

        // Adjust for complexity (simpler = easier to match)
        if (pattern.complexity === 'simple') {
            confidence += 0.05;
        }

        return {
            char: pattern.char,
            confidence: Math.min(confidence, 1.0)
        };
    });

    // Sort by confidence and return top 3
    return results
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);
}

/**
 * Get feedback message based on confidence
 */
export function getRecognitionFeedback(confidence: number): {
    message: string;
    type: 'success' | 'warning' | 'error';
} {
    if (confidence >= 0.7) {
        return {
            message: 'Ótimo! Caractere reconhecido.',
            type: 'success'
        };
    } else if (confidence >= 0.5) {
        return {
            message: 'Quase lá! Tente desenhar com mais cuidado.',
            type: 'warning'
        };
    } else {
        return {
            message: 'Não consegui reconhecer. Tente novamente.',
            type: 'error'
        };
    }
}
