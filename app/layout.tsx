import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const notoTabsJP = Noto_Sans_JP({
    subsets: ["latin"],
    variable: "--font-noto-sans-jp",
    weight: ["400", "700"],
});

export const metadata: Metadata = {
    title: "Nihongo Master | Learn Japanese",
    description: "Master Japanese with gamified learning and real-time handwriting practice.",
};

"use client";

import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isHome = pathname === '/';
    const hasSidebar = !!session;

    return (
        <html lang="pt-BR" className={`${inter.variable} ${notoTabsJP.variable}`}>
            <body>
                <Providers>
                    <div style={{ display: 'flex' }}>
                        <Sidebar />
                        <main className={`main-content ${hasSidebar ? (isHome ? 'with-sidebar-expanded' : 'with-sidebar-minimized') : ''}`}>
                            {children}
                        </main>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
