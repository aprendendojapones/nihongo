import vision from '@google-cloud/vision';

export interface OCRResult {
    text: string;
    confidence: number;
    provider: 'google' | 'azure';
}

/**
 * Recognize Japanese text from base64 image using Google Cloud Vision API
 */
export async function recognizeWithGoogle(base64Image: string): Promise<OCRResult> {
    try {
        const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
        
        if (!apiKey) {
            throw new Error('Google Cloud Vision API key not configured');
        }

        // Remove data URL prefix if present
        const imageData = base64Image.replace(/^data:image\/\w+;base64,/, '');

        // Create client with API key
        const client = new vision.ImageAnnotatorClient({
            apiKey: apiKey,
        });

        // Perform text detection
        const [result] = await client.textDetection({
            image: { content: imageData },
            imageContext: {
                languageHints: ['ja', 'ja-JP'], // Japanese language hints
            },
        });

        const detections = result.textAnnotations;
        
        if (!detections || detections.length === 0) {
            return {
                text: '',
                confidence: 0,
                provider: 'google',
            };
        }

        // First annotation contains the full detected text
        const fullText = detections[0].description || '';
        
        // Calculate average confidence from all detections
        const avgConfidence = detections.length > 1
            ? detections.slice(1).reduce((sum, d) => sum + (d.confidence || 0), 0) / (detections.length - 1)
            : detections[0].confidence || 0.5;

        return {
            text: fullText.trim(),
            confidence: avgConfidence,
            provider: 'google',
        };
    } catch (error) {
        console.error('Google Vision API error:', error);
        throw error;
    }
}
