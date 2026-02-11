"use client";

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { RefreshCw, Check, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/components/TranslationContext';
import { fetchKanjiData, KanjiData } from '@/lib/kanji';
import './handwriting.css';

export default function MobileWriteCanvas({ sessionId: propSessionId }: { sessionId?: string }) {
    const searchParams = useSearchParams();
    const sessionId = propSessionId || searchParams.get('session');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);

    const { t } = useTranslation();
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
    const [targetChar, setTargetChar] = useState<string>('');
    const [kanjiData, setKanjiData] = useState<KanjiData | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    // Subscribe to Supabase channel for broadcasting
    // Subscribe to Supabase channel
    useEffect(() => {
        if (!sessionId) return;

        const channel = supabase.channel(`handwriting:${sessionId}`);
        
        channel.on('broadcast', { event: 'target_char' }, (payload) => {
            if (payload.payload && payload.payload.char) {
                setTargetChar(payload.payload.char);
            }
        }).subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                // Request current target char in case we joined late
                channel.send({
                    type: 'broadcast',
                    event: 'request_target',
                    payload: {}
                });
            }
        });

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId]);

    // Fetch Kanji Data when target char changes
    useEffect(() => {
        if (targetChar) {
            fetchKanjiData(targetChar).then(data => setKanjiData(data));
        }
    }, [targetChar]);

    const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
        setIsDrawing(true);
        const { x, y } = getCoordinates(e);
        setPoints([{ x, y }]);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx?.beginPath();

        // Send stroke to PC with normalized coordinates (0-1 range)
        if (sessionId && points.length > 0 && channelRef.current) {
            const normalizedPoints = points.map(p => ({
                x: p.x / canvas.width,
                y: p.y / canvas.height
            }));

            channelRef.current.send({
                type: 'broadcast',
                event: 'stroke',
                payload: {
                    points: normalizedPoints,
                    color: '#ff3e3e',
                    width: 5,
                    type: 'draw'
                }
            });
        }
        setPoints([]);
    };

    const getCoordinates = (e: React.TouchEvent | React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
        return { x, y };
    };

    const draw = (e: React.TouchEvent | React.MouseEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { x, y } = getCoordinates(e);
        const newPoints = [...points, { x, y }];
        setPoints(newPoints);

        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#ff3e3e';

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const clear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);

        if (sessionId && channelRef.current) {
            channelRef.current.send({
                type: 'broadcast',
                event: 'clear',
                payload: { type: 'clear' }
            });
        }
    };

    const complete = () => {
        const canvas = canvasRef.current;
        if (sessionId && canvas) {
            // Send the full image as base64
            const dataUrl = canvas.toDataURL('image/png');
            
            supabase.channel(`handwriting:${sessionId}`).send({
                type: 'broadcast',
                event: 'submit',
                payload: { image: dataUrl }
            });
        }
    };

    return (
        <div className="mobile-canvas-container">
            <header className="mobile-header">
                <h2 className="gradient-text">Escrita</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="hint-button" onClick={clear}>
                        <Trash2 size={24} />
                    </button>
                    <button className="hint-button" onClick={complete} style={{ backgroundColor: '#4ade80' }}>
                        <Check size={24} />
                    </button>
                </div>
            </header>

            <div className="mobile-canvas-wrapper" style={{ position: 'relative' }}>
                {kanjiData && (
                    <svg
                        viewBox="0 0 109 109"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0.2,
                            pointerEvents: 'none',
                            zIndex: 0
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
                    className="handwriting-canvas"
                    style={{ width: '100%', height: '100%', touchAction: 'none', position: 'relative', zIndex: 1 }}
                    onTouchStart={(e) => {
                        e.preventDefault(); // Prevent scrolling
                        startDrawing(e);
                    }}
                    onTouchEnd={(e) => {
                        e.preventDefault();
                        stopDrawing();
                    }}
                    onTouchMove={(e) => {
                        e.preventDefault(); // Prevent scrolling
                        draw(e);
                    }}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseMove={draw}
                />
            </div>

            <footer className="mobile-controls">
                <button className="btn-primary btn-mobile btn-outline" onClick={clear}>
                    <RefreshCw size={20} /> {t('clear')}
                </button>
                <button className="btn-primary btn-mobile" onClick={complete}>
                    <Check size={20} /> {t('confirm')}
                </button>
            </footer>
        </div>
    );
}
