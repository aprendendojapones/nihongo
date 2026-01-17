"use client";

import { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export default function PCHandwritingView() {
    const [sessionId, setSessionId] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [currentStroke, setCurrentStroke] = useState<any>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const channelRef = useRef<any>(null);

    useEffect(() => {
        const id = uuidv4();
        setSessionId(id);

        // Generate QR Code for the mobile URL
        const mobileUrl = `${window.location.origin}/write/${id}`;
        QRCode.toDataURL(mobileUrl, { width: 300, margin: 2, color: { dark: '#ff3e3e', light: '#00000000' } })
            .then(url => setQrCodeUrl(url));

        // Subscribe to real-time broadcast for this session
        const channel = supabase
            .channel(`session:${id}`)
            .on('broadcast', { event: 'stroke' }, (payload) => {
                setCurrentStroke(payload.payload);
            })
            .on('broadcast', { event: 'clear' }, () => {
                const ctx = canvasRef.current?.getContext('2d');
                ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
            })
            .subscribe();

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        if (currentStroke && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                // Draw the stroke received from mobile
                const { points, color, width } = currentStroke;
                if (points.length < 2) return;

                ctx.strokeStyle = color || '#fff';
                ctx.lineWidth = width || 3;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                ctx.stroke();
            }
        }
    }, [currentStroke]);

    const clearCanvas = () => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            // Notify other devices to clear
            if (channelRef.current) {
                channelRef.current.send({
                    type: 'broadcast',
                    event: 'clear'
                });
            }
        }
    };

    return (
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
            <h2 className="gradient-text">Prática de Escrita</h2>

            {!currentStroke && qrCodeUrl && (
                <div style={{ textAlign: 'center' }}>
                    <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Escaneie com seu celular para escrever:</p>
                    <img src={qrCodeUrl} alt="QR Code" style={{ borderRadius: '12px', border: '4px solid var(--glass-border)' }} />
                </div>
            )}

            <div style={{ position: 'relative', background: '#000', borderRadius: '12px', border: '2px solid var(--accent-primary)' }}>
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={400}
                    style={{ maxWidth: '100%', height: 'auto' }}
                />
                <button
                    className="btn-primary"
                    style={{ position: 'absolute', bottom: '10px', right: '10px', padding: '8px 16px', fontSize: '0.8rem' }}
                    onClick={clearCanvas}
                >
                    Limpar
                </button>
            </div>
        </div>
    );
}
