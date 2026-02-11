import { recognizeWithGoogle } from './google-vision';
import { recognizeWithAzure } from './azure-vision';

export interface OCRResult {
    text: string;
    confidence: number;
    provider: 'google' | 'azure';
}

/**
 * Recognize text from image using configured OCR provider(s)
 * Supports fallback from Google to Azure if configured
 */
export async function recognizeText(base64Image: string): Promise<OCRResult> {
    const provider = process.env.OCR_PROVIDER || 'both';

    // Try Google first if configured
    if (provider === 'google' || provider === 'both') {
        try {
            const result = await recognizeWithGoogle(base64Image);
            if (result.text && result.confidence > 0.3) {
                return result;
            }
            // If Google returns low confidence or empty, try Azure as fallback
            if (provider === 'both') {
                console.log('Google returned low confidence, trying Azure fallback...');
            }
        } catch (error) {
            console.error('Google Vision failed:', error);
            if (provider === 'google') {
                throw error; // If only Google is configured, throw the error
            }
            // Otherwise, continue to Azure fallback
        }
    }

    // Try Azure if configured or as fallback
    if (provider === 'azure' || provider === 'both') {
        try {
            return await recognizeWithAzure(base64Image);
        } catch (error) {
            console.error('Azure Vision failed:', error);
            throw error;
        }
    }

    throw new Error('No OCR provider configured');
}

import { validateOCRResult } from '@/lib/validation/character-validator';

/**
 * Validate if recognized text matches target character
 * Handles hiragana, katakana, kanji, and romaji
 */
export function validateRecognizedText(recognized: string, target: string): boolean {
    return validateOCRResult(recognized, target);
}
