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
    const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const { t } = useTranslation();

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
        setPoints([{ x, y }]);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx?.beginPath();

        // Send stroke to PC
        if (sessionId && points.length > 0) {
            supabase.channel(`handwriting:${sessionId}`).send({
                type: 'broadcast',
                event: 'stroke',
                payload: {
                    points: points,
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
        setPoints(prev => [...prev, { x, y }]);

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

        if (sessionId) {
            supabase.channel(`handwriting:${sessionId}`).send({
                type: 'broadcast',
                event: 'clear'
            });
        }
    };

    const complete = () => {
        if (sessionId) {
            supabase.channel(`handwriting:${sessionId}`).send({
                type: 'broadcast',
                event: 'complete'
            });
        }
    };

    return (
        <div className="mobile-canvas-container">
            <header className="mobile-header">
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
