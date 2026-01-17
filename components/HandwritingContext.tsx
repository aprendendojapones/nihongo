"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface HandwritingContextType {
    sessionId: string;
    qrCodeUrl: string;
    currentStroke: any;
    strokeCount: number;
    clearCanvas: () => void;
    resetStrokeCount: () => void;
    incrementStrokeCount: () => void;
}

const STROKE_COLORS = [
    '#ff3e3e', // Red
    '#3e8eff', // Blue
    '#3eff3e', // Green
    '#ff8e3e', // Orange
    '#8e3eff', // Purple
    '#3effff', // Cyan
    '#ff3eff', // Pink
    '#8e5e3e', // Brown
];

const HandwritingContext = createContext<HandwritingContextType | undefined>(undefined);

export function HandwritingProvider({ children }: { children: React.ReactNode }) {
    const [sessionId, setSessionId] = useState<string>('');
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [currentStroke, setCurrentStroke] = useState<any>(null);
    const [strokeCount, setStrokeCount] = useState<number>(0);
    const channelRef = useRef<any>(null);

    useEffect(() => {
        // Try to recover session from localStorage
        let id = localStorage.getItem('handwriting_session_id');
        if (!id) {
            id = uuidv4();
            localStorage.setItem('handwriting_session_id', id!);
        }
        setSessionId(id!);

        const channel = supabase
            .channel(`session:${id}`)
            .on('broadcast', { event: 'stroke' }, (payload) => {
                const stroke = payload.payload;
                // Assign color based on stroke count if not already assigned
                if (!stroke.color) {
                    stroke.color = STROKE_COLORS[strokeCount % STROKE_COLORS.length];
                }
                setCurrentStroke(stroke);
                // We don't increment here anymore, the consumer will decide
            })
            .on('broadcast', { event: 'clear' }, () => {
                setCurrentStroke({ type: 'clear' });
                setStrokeCount(0);
            })
            .subscribe();

        channelRef.current = channel;

        return () => {
            // We don't remove the channel here to keep it persistent across page navigations
            // but in a real app we might want to handle cleanup on app close
        };
    }, []);

    const clearCanvas = () => {
        if (channelRef.current) {
            channelRef.current.send({
                type: 'broadcast',
                event: 'clear'
            });
        }
    };

    const resetStrokeCount = () => setStrokeCount(0);
    const incrementStrokeCount = () => setStrokeCount(prev => prev + 1);

    return (
        <HandwritingContext.Provider value={{ sessionId, qrCodeUrl, currentStroke, strokeCount, clearCanvas, resetStrokeCount, incrementStrokeCount }}>
            {children}
        </HandwritingContext.Provider>
    );
}

export function useHandwriting() {
    const context = useContext(HandwritingContext);
    if (context === undefined) {
        throw new Error('useHandwriting must be used within a HandwritingProvider');
    }
    return context;
}
