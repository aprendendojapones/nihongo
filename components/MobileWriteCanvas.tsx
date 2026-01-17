"use client";

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function MobileWriteCanvas({ sessionId }: { sessionId: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [points, setPoints] = useState<{ x: number, y: number }[]>([]);
    const channelRef = useRef<any>(null);

    useEffect(() => {
        const channel = supabase.channel(`session:${sessionId}`);
        channel.subscribe();
        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId]);

    const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
        setIsDrawing(true);
        const pos = getPos(e);
        setPoints([pos]);
    };

    const draw = (e: React.TouchEvent | React.MouseEvent) => {
        if (!isDrawing) return;
        const pos = getPos(e);
        const newPoints = [...points, pos];
        setPoints(newPoints);

        // Draw locally for immediate feedback
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.strokeStyle = '#ff3e3e';
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        }
    };

    const stopDrawing = async () => {
        if (!isDrawing) return;
        setIsDrawing(false);

        // Send stroke to PC via Broadcast
        if (channelRef.current) {
            await channelRef.current.send({
                type: 'broadcast',
                event: 'stroke',
                payload: { points, color: '#ff3e3e', width: 5 }
            });
        }
    };

    const getPos = (e: React.TouchEvent | React.MouseEvent) => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        // Scale points to match PC canvas (400x400)
        return {
            x: ((clientX - rect.left) / rect.width) * 400,
            y: ((clientY - rect.top) / rect.height) * 400
        };
    };

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#0a0a0c', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid var(--glass-border)' }}>
                <h2 className="gradient-text">Escreva Aqui</h2>
            </div>

            <canvas
                ref={canvasRef}
                width={400}
                height={400}
                style={{ width: '100%', flex: 1, touchAction: 'none', background: '#111' }}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
            />

            <div style={{ padding: '1rem', display: 'flex', gap: '1rem' }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={() => {
                    const ctx = canvasRef.current?.getContext('2d');
                    ctx?.clearRect(0, 0, 400, 400);
                }}>
                    Limpar
                </button>
                <button className="btn-primary" style={{ flex: 1, background: '#444' }}>
                    Confirmar
                </button>
            </div>
        </div>
    );
}
