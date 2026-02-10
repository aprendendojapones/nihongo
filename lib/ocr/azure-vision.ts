import { ComputerVisionClient } from '@azure/cognitiveservices-computervision';
import { ApiKeyCredentials } from '@azure/ms-rest-js';

export interface OCRResult {
    text: string;
    confidence: number;
    provider: 'google' | 'azure';
}

/**
 * Recognize Japanese text from base64 image using Azure Computer Vision API
 */
export async function recognizeWithAzure(base64Image: string): Promise<OCRResult> {
    try {
        const endpoint = process.env.AZURE_VISION_ENDPOINT;
        const key = process.env.AZURE_VISION_KEY;

        if (!endpoint || !key) {
            throw new Error('Azure Computer Vision credentials not configured');
        }

        // Create client
        const credentials = new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } });
        const client = new ComputerVisionClient(credentials, endpoint);

        // Remove data URL prefix if present
        const imageData = base64Image.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(imageData, 'base64');

        // Perform OCR with Japanese language
        const result = await client.recognizePrintedText(
            true, // detectOrientation
            imageBuffer,
            {
                language: 'ja', // Japanese
            }
        );

        if (!result.regions || result.regions.length === 0) {
            return {
                text: '',
                confidence: 0,
                provider: 'azure',
            };
        }

        // Extract all text from regions
        let fullText = '';
        let totalConfidence = 0;
        let wordCount = 0;

        for (const region of result.regions) {
            for (const line of region.lines || []) {
                for (const word of line.words || []) {
                    fullText += word.text;
                    // Azure doesn't provide confidence per word in this API
                    // We'll use a default confidence
                    totalConfidence += 0.8;
                    wordCount++;
                }
            }
        }

        const avgConfidence = wordCount > 0 ? totalConfidence / wordCount : 0;

        return {
            text: fullText.trim(),
            confidence: avgConfidence,
            provider: 'azure',
        };
    } catch (error) {
        console.error('Azure Vision API error:', error);
        throw error;
    }
}
