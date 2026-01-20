"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { supabase } from '@/lib/supabase';
import { useHandwriting } from '@/hooks/useHandwriting';
import { fetchKanjiData, KanjiData, validateStroke } from '@/lib/kanji';
import './handwriting.css';

interface PCHandwritingViewProps {
    targetChar?: string;
    onComplete?: () => void;
}

export default function PCHandwritingView({ targetChar, onComplete }: PCHandwritingViewProps) {
    const { sessionId, currentStroke, clearCanvas, resetStrokeCount, strokeCount, incrementStrokeCount } = useHandwriting();
    const [inputMode, setInputMode] = useState<'mobile' | 'mouse'>('mobile');
    const [isDrawing, setIsDrawing] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pointsRef = useRef<{ x: number; y: number }[]>([]);

    useEffect(() => {
        if (sessionId && inputMode === 'mobile') {
            const mobileUrl = `${window.location.origin}/write/${sessionId}`;
            QRCode.toDataURL(mobileUrl, {
                width: 300,
                margin: 2,
                color: { dark: '#ff3e3e', light: '#00000000' }
            }).then(url => setQrCodeUrl(url));
        }
    }, [sessionId, inputMode]);

    const [kanjiData, setKanjiData] = useState<KanjiData | null>(null);
    const [strokeFeedback, setStrokeFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [lastValidatedStroke, setLastValidatedStroke] = useState<any>(null);

    useEffect(() => {
        if (targetChar) {
            fetchKanjiData(targetChar).then(setKanjiData);
        }
    }, [targetChar]);

    // Mouse Mode Drawing Logic
    const startDrawing = (e: React.MouseEvent) => {
        if (inputMode !== 'mouse') return;
        setIsDrawing(true);
        const { x, y } = getCoordinates(e);
        pointsRef.current = [{ x, y }];

        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing || inputMode !== 'mouse') return;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        const { x, y } = getCoordinates(e);
        pointsRef.current.push({ x, y });

        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#ff3e3e';

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing || inputMode !== 'mouse') return;
        setIsDrawing(false);

        // Validate locally
        if (kanjiData && kanjiData.strokes[strokeCount]) {
            const isCorrect = validateStroke(pointsRef.current, kanjiData.strokes[strokeCount].path);
            handleValidationResult(isCorrect, { points: pointsRef.current, color: '#ff3e3e', width: 5 });
        }
    };

    const getCoordinates = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const handleValidationResult = useCallback((isCorrect: boolean, stroke: any) => {
        if (isCorrect) {
            setStrokeFeedback('correct');
            incrementStrokeCount();
            if (kanjiData && strokeCount + 1 >= kanjiData.strokes.length) {
                setTimeout(() => {
                    if (onComplete) onComplete();
                }, 1000);
            }
        } else {
            setStrokeFeedback('wrong');
            setTimeout(() => setStrokeFeedback(null), 500);
            // Clear the wrong stroke
            const ctx = canvasRef.current?.getContext('2d');
            // In a real app, we'd redraw valid strokes. For now, just clear and let user retry.
            // Ideally we should keep a history of valid strokes to redraw.
        }
    }, [kanjiData, strokeCount, incrementStrokeCount, onComplete]);

    useEffect(() => {
        if (currentStroke && canvasRef.current && inputMode === 'mobile') {
            // ... (existing mobile stroke handling)
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                if (currentStroke.type === 'clear') {
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    setLastValidatedStroke(null);
                    return;
                }

                if (currentStroke === lastValidatedStroke) return;

                const isCorrect = kanjiData && kanjiData.strokes[strokeCount]
                    ? validateStroke(currentStroke.points, kanjiData.strokes[strokeCount].path)
                    : true;

                handleValidationResult(isCorrect, currentStroke);
                setLastValidatedStroke(currentStroke);

                if (isCorrect) {
                    // Draw the stroke
                    const { points, color, width } = currentStroke;
                    if (!points || points.length < 2) return;

                    ctx.strokeStyle = color || '#ff3e3e';
                    ctx.lineWidth = width || 5;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = color || '#ff3e3e';

                    ctx.beginPath();
                    ctx.moveTo(points[0].x, points[0].y);
                    for (let i = 1; i < points.length; i++) {
                        ctx.lineTo(points[i].x, points[i].y);
                    }
                    ctx.stroke();
                }
            }
        }
    }, [currentStroke, kanjiData, strokeCount, inputMode, handleValidationResult, lastValidatedStroke]);

    return (
        <div className="glass-card handwriting-container">
            <header style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <h2 className="gradient-text">{targetChar ? `Escreva: ${targetChar}` : 'Prática de Escrita'}</h2>
                <div className="mode-toggle" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <button
                        className={`handwriting-btn ${inputMode === 'mobile' ? 'active' : ''}`}
                        onClick={() => setInputMode('mobile')}
                    >
                        📱 Celular
                    </button>
                    <button
                        className={`handwriting-btn ${inputMode === 'mouse' ? 'active' : ''}`}
                        onClick={() => setInputMode('mouse')}
                    >
                        🖱️ Mouse/Touch
                    </button>
                </div>
            </header>

            {inputMode === 'mobile' && qrCodeUrl && (
                <div className="qr-code-container" style={{ marginBottom: '1rem', textAlign: 'center' }}>
                    <p style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Escaneie para escrever:</p>
                    <img src={qrCodeUrl} alt="Scan to write" style={{ borderRadius: '12px', border: '4px solid var(--glass-border)', background: 'white', padding: '10px' }} />
                </div>
            )}

            <div
                className="handwriting-canvas-container"
                style={{
                    width: '400px',
                    height: '400px',
                    position: 'relative',
                    border: `2px solid ${strokeFeedback === 'wrong' ? '#ff3e3e' : 'var(--accent-primary)'}`,
                    boxShadow: strokeFeedback === 'wrong' ? '0 0 30px rgba(255, 62, 62, 0.5)' : '0 0 30px rgba(255, 62, 62, 0.2)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'white',
                    transition: 'all 0.3s ease'
                }}
            >
                {kanjiData && (
                    <svg
                        viewBox="0 0 109 109"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0.1,
                            pointerEvents: 'none'
                        }}
                    >
                        {kanjiData.strokes.map((s) => (
                            <path
                                key={s.id}
                                d={s.path}
                                fill="none"
                                stroke="black"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        ))}
                    </svg>
                )}

                <canvas
                    ref={canvasRef}
                    width={400}
                    height={400}
                    className="handwriting-canvas"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: inputMode === 'mouse' ? 'crosshair' : 'default' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                />

                {strokeFeedback && (
                    <div className={`feedback-overlay ${strokeFeedback}`} style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '4rem', pointerEvents: 'none',
                        background: strokeFeedback === 'correct' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 62, 62, 0.2)'
                    }}>
                        {strokeFeedback === 'correct' ? '✨' : '❌'}
                    </div>
                )}
            </div>

            <div className="handwriting-controls" style={{ width: '100%', maxWidth: '400px', marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button
                    className="btn-primary"
                    style={{ flex: 1, background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--text-primary)' }}
                    onClick={() => {
                        const ctx = canvasRef.current?.getContext('2d');
                        ctx?.clearRect(0, 0, 400, 400);
                        clearCanvas();
                        resetStrokeCount();
                        setLastValidatedStroke(null);
                        setStrokeFeedback(null);
                    }}
                >
                    Limpar
                </button>
                <button
                    className="btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => {
                        if (onComplete) onComplete();
                    }}
                >
                    Confirmar
                </button>
            </div>
        </div>
    );
}
