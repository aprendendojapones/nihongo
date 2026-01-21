// Handwriting recognition utilities
// Simple stroke-based recognition for Japanese characters

import { Point, Stroke, CharacterPattern, ALL_PATTERNS } from '@/data/character-patterns';

/**
 * Analyze stroke direction based on start and end points
 */
export function analyzeStrokeDirection(points: Point[]): Stroke['direction'] {
    if (points.length < 2) return 'curve';

    const start = points[0];
    const end = points[points.length - 1];

    const dx = end.x - start.x;
    const dy = end.y - start.y;

    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Determine direction based on angle
    if (Math.abs(angle) < 30 || Math.abs(angle) > 150) {
        return 'horizontal';
    } else if (Math.abs(angle - 90) < 30 || Math.abs(angle + 90) < 30) {
        return 'vertical';
    } else if (angle > 0 && angle < 90) {
        return 'diagonal-right';
    } else if (angle < 0 && angle > -90) {
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
 * Simple recognition based on stroke count
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

    // Calculate confidence based on stroke count match and complexity
    const results = candidates.map(pattern => {
        let confidence = 0.5; // Base confidence

        // Exact stroke count match
        if (pattern.strokeCount === strokeCount) {
            confidence += 0.3;
        }

        // Bonus if it matches expected character
        if (expectedChar && pattern.char === expectedChar) {
            confidence += 0.2;
        }

        // Adjust for complexity (simpler = easier to match)
        if (pattern.complexity === 'simple') {
            confidence += 0.1;
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
