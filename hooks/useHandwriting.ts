import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface Stroke {
    points: { x: number; y: number }[];
    color: string;
    width: number;
    type?: 'stroke' | 'clear';
}

export function useHandwriting() {
    const [sessionId, setSessionId] = useState<string>('');
    const [submittedImage, setSubmittedImage] = useState<string | null>(null);
    const [strokeCount, setStrokeCount] = useState(0);

    useEffect(() => {
        // Generate or retrieve session ID
        let id = localStorage.getItem('handwriting_session_id');
        if (!id) {
            id = uuidv4();
            localStorage.setItem('handwriting_session_id', id);
        }
        setSessionId(id);
    }, []);

    useEffect(() => {
        if (!sessionId) return;

        const channel = supabase.channel(`handwriting:${sessionId}`)
            .on('broadcast', { event: 'submit' }, (payload) => {
                if (payload.payload && payload.payload.image) {
                    setSubmittedImage(payload.payload.image);
                }
            })
            .on('broadcast', { event: 'clear' }, () => {
                setSubmittedImage(null);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId]);

    const clearCanvas = useCallback(() => {
        setSubmittedImage(null);
    }, []);

    const resetStrokeCount = useCallback(() => {
        setStrokeCount(0);
    }, []);

    const incrementStrokeCount = useCallback(() => {
        setStrokeCount(prev => prev + 1);
    }, []);

    return {
        sessionId,
        submittedImage,
        clearCanvas,
        resetStrokeCount,
        strokeCount,
        incrementStrokeCount
    };
}
