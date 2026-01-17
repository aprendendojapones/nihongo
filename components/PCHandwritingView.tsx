"use client";

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { supabase } from '@/lib/supabase';
import { useHandwriting } from '@/hooks/useHandwriting';
import { fetchKanjiData, KanjiData } from '@/lib/kanji';
import './handwriting.css';

interface PCHandwritingViewProps {
    targetChar?: string;
    onComplete?: () => void;
}

export default function PCHandwritingView({ targetChar, onComplete }: PCHandwritingViewProps) {
    const { sessionId, currentStroke, clearCanvas, resetStrokeCount, strokeCount, incrementStrokeCount } = useHandwriting();
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [kanjiData, setKanjiData] = useState<KanjiData | null>(null);
    const [lastValidatedStroke, setLastValidatedStroke] = useState<any>(null);
    const [strokeFeedback, setStrokeFeedback] = useState<'correct' | 'wrong' | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (sessionId) {
            const mobileUrl = `${window.location.origin}/write/${sessionId}`;
            QRCode.toDataURL(mobileUrl, {
                width: 300,
                margin: 2,
                color: { dark: '#ff3e3e', light: '#00000000' }
            }).then(url => setQrCodeUrl(url));
        }
    }, [sessionId]);

    useEffect(() => {
        if (targetChar) {
            const ctx = canvasRef.current?.getContext('2d');
            ctx?.clearRect(0, 0, 400, 400);
            resetStrokeCount();
            fetchKanjiData(targetChar).then(data => setKanjiData(data));

            if (sessionId) {
                supabase.channel(`session:${sessionId}`).send({
                    type: 'broadcast',
                    event: 'target_char',
                    payload: { char: targetChar }
                });
            }
        }
    }, [targetChar, sessionId, resetStrokeCount]);

    useEffect(() => {
        if (currentStroke && canvasRef.current) {
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

                if (isCorrect) {
                    setStrokeFeedback('correct');
                    setLastValidatedStroke(currentStroke);
                    incrementStrokeCount();

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

                    if (kanjiData && strokeCount + 1 >= kanjiData.strokes.length) {
                        setTimeout(() => {
                            if (onComplete) onComplete();
                        }, 1000);
                    }
                } else {
                    setStrokeFeedback('wrong');
                    setLastValidatedStroke(currentStroke);
                    setTimeout(() => setStrokeFeedback(null), 500);
                }
            }
        }
    }, [currentStroke, kanjiData, strokeCount, incrementStrokeCount, onComplete, lastValidatedStroke]);

    return (
        <div className="glass-card handwriting-container">
            <header style={{ textAlign: 'center' }}>
                <h2 className="gradient-text">{targetChar ? `Escreva: ${targetChar}` : 'Prática de Escrita'}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sincronizado em tempo real</p>
            </header>

            {!currentStroke && qrCodeUrl && (
                <div style={{ textAlign: 'center' }}>
                    <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Escaneie com seu celular para escrever:</p>
                    <img src={qrCodeUrl} alt="QR Code" style={{ borderRadius: '12px', border: '4px solid var(--glass-border)', background: 'white', padding: '10px' }} />
                </div>
            )}

            <div
                className="handwriting-canvas-container"
                style={{
                    width: '400px',
                    height: '400px',
                    border: `2px solid ${strokeFeedback === 'wrong' ? '#ff3e3e' : 'var(--accent-primary)'}`,
                    boxShadow: strokeFeedback === 'wrong' ? '0 0 30px rgba(255, 62, 62, 0.5)' : '0 0 30px rgba(255, 62, 62, 0.2)',
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
                                stroke="white"
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
                    style={{ position: 'absolute', top: 0, left: 0, maxWidth: '100%', height: 'auto' }}
                />
            </div>

            <div className="handwriting-controls" style={{ width: '100%', maxWidth: '400px' }}>
                <button
                    className="btn-primary"
                    style={{ flex: 1, background: 'transparent', border: '1px solid var(--accent-primary)' }}
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
