import { NextRequest, NextResponse } from 'next/server';
import { recognizeText, validateRecognizedText } from '@/lib/ocr';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { image, targetChar } = body;

        if (!image) {
            return NextResponse.json(
                { error: 'Image data is required' },
                { status: 400 }
            );
        }

        // Recognize text from image
        const result = await recognizeText(image);

        // Validate if target character is provided
        let isCorrect = false;
        if (targetChar) {
            isCorrect = validateRecognizedText(result.text, targetChar);
        }

        return NextResponse.json({
            recognized: result.text,
            confidence: result.confidence,
            provider: result.provider,
            isCorrect,
            targetChar,
        });
    } catch (error) {
        console.error('OCR recognition error:', error);
        return NextResponse.json(
            { 
                error: 'Failed to recognize text',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
