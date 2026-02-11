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
    const { sessionId, submittedImage, clearCanvas, resetStrokeCount, strokeCount, incrementStrokeCount } = useHandwriting();
    const [useMobile, setUseMobile] = useState(true);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [kanjiData, setKanjiData] = useState<KanjiData | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
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
                const channel = supabase.channel(`handwriting:${sessionId}`);
                
                channel.subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        // Send initial target char
                        channel.send({
                            type: 'broadcast',
                            event: 'target_char',
                            payload: { char: targetChar }
                        });
                    }
                });

                // Listen for requests from mobile
                const requestListener = channel.on('broadcast', { event: 'request_target' }, () => {
                    if (targetChar) {
                        channel.send({
                            type: 'broadcast',
                            event: 'target_char',
                            payload: { char: targetChar }
                        });
                    }
                }).subscribe();

                if (ctx && canvasRef.current) {
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                }
                
                return () => {
                    supabase.removeChannel(requestListener);
                };
            }
        }
    }, [targetChar, sessionId, resetStrokeCount]);

    // Async function to validate drawing with OCR
    const validateWithOCR = async (canvas: HTMLCanvasElement, target: string) => {
        try {
            const imageData = canvas.toDataURL('image/png');
            
            const response = await fetch('/api/ocr/recognize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: imageData,
                    targetChar: target,
                }),
            });

            const result = await response.json();
            return result.isCorrect;
        } catch (error) {
            console.error('OCR recognition failed:', error);
            return false;
        }
    };

    // Handle submitted image from mobile
    useEffect(() => {
        if (submittedImage && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            const img = new Image();
            img.onload = () => {
                if (ctx && canvasRef.current) {
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
                    
                    // Auto-validate after receiving image
                    if (targetChar) {
                        validateWithOCR(canvasRef.current, targetChar).then(handleValidationResult);
                    }
                }
            };
            img.src = submittedImage;
        }
    }, [submittedImage, targetChar]);

    const handleValidationResult = (isCorrect: boolean) => {
        setIsValidating(false);
        if (isCorrect) {
            setStrokeFeedback('correct');
            setFeedbackMessage('Correto!');
            incrementStrokeCount(); // Just to track activity
            
            setTimeout(() => {
                if (onComplete) onComplete();
            }, 1000);
        } else {
            setStrokeFeedback('wrong');
            setFeedbackMessage('Tente novamente');
            setTimeout(() => {
                setStrokeFeedback(null);
                setFeedbackMessage(null);
            }, 2000);
        }
    };

    const [isDrawing, setIsDrawing] = useState(false);
    const [mousePoints, setMousePoints] = useState<{ x: number; y: number }[]>([]);

    const getCoordinates = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e: React.MouseEvent) => {
        if (useMobile) return;
        setIsDrawing(true);
        const { x, y } = getCoordinates(e);
        setMousePoints([{ x, y }]);

        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.strokeStyle = '#ff3e3e';
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing || useMobile) return;
        const { x, y } = getCoordinates(e);
        setMousePoints(prev => [...prev, { x, y }]);

        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const stopDrawing = () => {
        if (!isDrawing || useMobile) return;
        setIsDrawing(false);
        setMousePoints([]);
        // Mouse drawing does NOT auto-validate anymore. Must click confirm.
    };

    return (
        <div className="glass-card handwriting-container">
            <header style={{ textAlign: 'center' }}>
                <h2 className="gradient-text">{targetChar ? `Escreva: ${targetChar}` : 'Prática de Escrita'}</h2>
                <div className="input-toggle" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', margin: '10px 0' }}>
                    <span style={{ fontSize: '0.9rem', color: useMobile ? 'var(--accent-primary)' : 'var(--text-muted)' }}>Celular</span>
                    <label className="switch">
                        <input type="checkbox" checked={!useMobile} onChange={(e) => setUseMobile(!e.target.checked)} />
                        <span className="slider round"></span>
                    </label>
                    <span style={{ fontSize: '0.9rem', color: !useMobile ? 'var(--accent-primary)' : 'var(--text-muted)' }}>Mouse</span>
                </div>
            </header>

            {useMobile && qrCodeUrl && strokeCount === 0 && (
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
                    transition: 'all 0.3s ease',
                    position: 'relative'
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
                    style={{ position: 'absolute', top: 0, left: 0, maxWidth: '100%', height: 'auto', cursor: useMobile ? 'default' : 'crosshair' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
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
                        setStrokeFeedback(null);
                        setFeedbackMessage(null);
                        setMousePoints([]);
                    }}
                >
                    Limpar
                </button>
                <button
                    className="btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => {
                        if (canvasRef.current && targetChar) {
                            setIsValidating(true);
                            validateWithOCR(canvasRef.current, targetChar).then(handleValidationResult);
                        } else if (onComplete) {
                            onComplete();
                        }
                    }}
                    disabled={isValidating}
                >
                    Confirmar
                </button>
            </div>
            {feedbackMessage && (
                <div style={{ 
                    position: 'absolute', 
                    bottom: '80px', 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    background: strokeFeedback === 'correct' ? '#4ade80' : '#ff3e3e',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    {feedbackMessage}
                </div>
            )}
        </div>
    );
}
