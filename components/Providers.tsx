"use client";

import { SessionProvider } from "next-auth/react";
import { HandwritingProvider } from "./HandwritingContext";
import { TranslationProvider } from "./TranslationContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <TranslationProvider>
                <HandwritingProvider>
                    {children}
                </HandwritingProvider>
            </TranslationProvider>
        </SessionProvider>
    );
}
