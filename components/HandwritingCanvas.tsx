"use client";

import { useRef, useState, useEffect } from 'react';
import { RotateCcw, Check } from 'lucide-react';
import { Point, Stroke } from '@/data/character-patterns';
import { analyzeStrokeDirection, recognizeCharacter, getRecognitionFeedback } from '@/lib/handwriting-recognition';

interface HandwritingCanvasProps {
    onRecognize: (result: string) => void;
    expectedChar?: string;
    disabled?: boolean;
}

export default function HandwritingCanvas({ onRecognize, expectedChar, disabled }: HandwritingCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawing, setHasDrawing] = useState(false);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
    const [recognitionFeedback, setRecognitionFeedback] = useState<string>('');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2; // High DPI
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);

        // Set drawing style
        ctx.strokeStyle = '#3effa2';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }, []);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (disabled) return;

        setIsDrawing(true);
        setHasDrawing(true);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

        // Start new stroke
        setCurrentStroke([{ x, y }]);

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing || disabled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

        // Add point to current stroke
        setCurrentStroke(prev => [...prev, { x, y }]);

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (isDrawing && currentStroke.length > 2) {
            // Analyze and save the completed stroke
            const direction = analyzeStrokeDirection(currentStroke);
            const newStroke: Stroke = {
                points: currentStroke,
                direction
            };
            setStrokes(prev => [...prev, newStroke]);
        }

        setIsDrawing(false);
        setCurrentStroke([]);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawing(false);
        setStrokes([]);
        setCurrentStroke([]);
        setRecognitionFeedback('');
    };

    const recognizeDrawing = () => {
        if (!hasDrawing || strokes.length === 0) {
            setRecognitionFeedback('Desenhe algo primeiro!');
            return;
        }

        // Use real recognition
        const results = recognizeCharacter(strokes, expectedChar);

        if (results.length === 0) {
            setRecognitionFeedback('Não consegui reconhecer. Tente novamente.');
            return;
        }

        const topResult = results[0];
        const feedback = getRecognitionFeedback(topResult.confidence);

        setRecognitionFeedback(`${feedback.message} (${Math.round(topResult.confidence * 100)}%)`);

        // If confidence is high enough, accept the result
        if (topResult.confidence >= 0.5) {
            setTimeout(() => {
                onRecognize(topResult.char);
            }, 800);
        } else {
            // Show alternatives
            const alternatives = results.slice(0, 3).map(r => r.char).join(', ');
            setRecognitionFeedback(`Talvez: ${alternatives}? Tente novamente.`);
        }
    };

    return (
        <div className="handwriting-canvas-container">
            <canvas
                ref={canvasRef}
                className="handwriting-canvas"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />

            {recognitionFeedback && (
                <div className="recognition-feedback">
                    {recognitionFeedback}
                </div>
            )}

            <div className="canvas-controls">
                <button
                    className="btn-canvas"
                    onClick={clearCanvas}
                    disabled={!hasDrawing || disabled}
                    title="Limpar"
                >
                    <RotateCcw size={20} />
                </button>

                <button
                    className="btn-canvas btn-submit"
                    onClick={recognizeDrawing}
                    disabled={!hasDrawing || disabled}
                    title="Confirmar"
                >
                    <Check size={20} />
                </button>
            </div>

            <style jsx>{`
                .handwriting-canvas-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    width: 100%;
                    max-width: 400px;
                    margin: 0 auto;
                }

                .handwriting-canvas {
                    width: 100%;
                    height: 300px;
                    border: 2px solid var(--glass-border);
                    border-radius: 12px;
                    background: var(--glass-bg);
                    cursor: crosshair;
                    touch-action: none;
                }

                .canvas-controls {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                }

                .btn-canvas {
                    padding: 0.8rem 1.5rem;
                    border: 2px solid var(--glass-border);
                    border-radius: 8px;
                    background: var(--glass-bg);
                    color: var(--text-primary);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .btn-canvas:hover:not(:disabled) {
                    transform: translateY(-2px);
                    border-color: var(--accent-primary);
                }

                .btn-canvas:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .btn-submit {
                    background: var(--accent-primary);
                    border-color: var(--accent-primary);
                    color: var(--bg-primary);
                }

                .recognition-feedback {
                    text-align: center;
                    padding: 0.8rem;
                    border-radius: 8px;
                    background: rgba(62, 255, 162, 0.1);
                    color: var(--accent-primary);
                    font-size: 0.9rem;
                    min-height: 2.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `}</style>
        </div>
    );
}
