"use client";

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function MobileWriteCanvas({ sessionId }: { sessionId: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [points, setPoints] = useState<{ x: number, y: number }[]>([]);
    const [selectedColor, setSelectedColor] = useState('#ff3e3e');
    const channelRef = useRef<any>(null);

    const colors = [
        '#ff3e3e', // Red
        '#3effa2', // Green
        '#3e88ff', // Blue
        '#ffbe3e', // Yellow
        '#ffffff', // White
        '#000000'  // Black
    ];

    useEffect(() => {
        const channel = supabase.channel(`session:${sessionId}`);
        channel
            .on('broadcast', { event: 'clear' }, () => {
                const ctx = canvasRef.current?.getContext('2d');
                ctx?.clearRect(0, 0, 400, 400);
            })
            .subscribe();
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
                payload: { points, color: selectedColor, width: 5 }
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

            <div style={{ padding: '1rem', display: 'flex', gap: '0.8rem', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
                {colors.map(color => (
                    <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        title={`Selecionar cor ${color}`}
                        aria-label={`Selecionar cor ${color}`}
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: color,
                            border: selectedColor === color ? '3px solid white' : '1px solid rgba(255,255,255,0.2)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                ))}
            </div>

            <div style={{ padding: '1rem', display: 'flex', gap: '1rem' }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={() => {
                    const ctx = canvasRef.current?.getContext('2d');
                    ctx?.clearRect(0, 0, 400, 400);

                    // Notify other devices to clear
                    if (channelRef.current) {
                        channelRef.current.send({
                            type: 'broadcast',
                            event: 'clear'
                        });
                    }
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
