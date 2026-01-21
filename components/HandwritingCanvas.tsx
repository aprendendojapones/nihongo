"use client";

import { useRef, useState, useEffect } from 'react';
import { RotateCcw, Check } from 'lucide-react';

interface HandwritingCanvasProps {
    onRecognize: (result: string) => void;
    expectedChar?: string;
    disabled?: boolean;
}

export default function HandwritingCanvas({ onRecognize, expectedChar, disabled }: HandwritingCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawing, setHasDrawing] = useState(false);

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

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawing(false);
    };

    const recognizeDrawing = () => {
        if (!hasDrawing) return;

        // For now, we'll use a simple approach: just return the expected character
        // In a real implementation, this would use TensorFlow.js or an API
        // to recognize the drawn character

        if (expectedChar) {
            onRecognize(expectedChar);
        } else {
            // Placeholder: in real implementation, this would analyze the canvas
            onRecognize('あ');
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
            `}</style>
        </div>
    );
}
