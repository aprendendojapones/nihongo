"use client";

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { RefreshCw, Check, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/components/TranslationContext';
import './handwriting.css';

export default function MobileWriteCanvas({ sessionId: propSessionId }: { sessionId?: string }) {
    const searchParams = useSearchParams();
    const sessionId = propSessionId || searchParams.get('session');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const { t } = useTranslation();

    const pointsRef = useRef<{ x: number; y: number }[]>([]);

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

    const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
        setIsDrawing(true);
        const { x, y } = getCoordinates(e);
        pointsRef.current = [{ x, y }];
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx?.beginPath();

        // Send stroke to PC
        if (sessionId && pointsRef.current.length > 0) {
            supabase.channel(`session:${sessionId}`).send({
                type: 'broadcast',
                event: 'stroke',
                payload: {
                    points: pointsRef.current,
                    color: '#ff3e3e',
                    width: 5
                }
            });
        }
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
        pointsRef.current.push({ x, y });

        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#ff3e3e';

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    return (
        <div className="mobile-canvas-container" style={{ height: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, zIndex: 100, background: 'white' }}>
            <header className="mobile-header" style={{ position: 'absolute', top: 10, left: 10, zIndex: 101 }}>
                <h2 className="gradient-text">Escrita</h2>
                <button className="hint-button" onClick={clear}>
                    <Trash2 size={24} />
                </button>
            </header>

            <div className="mobile-canvas-wrapper">
                <canvas
                    ref={canvasRef}
                    className="handwriting-canvas"
                    style={{ width: '100%', height: '100%' }}
                    onTouchStart={startDrawing}
                    onTouchEnd={stopDrawing}
                    onTouchMove={draw}
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
