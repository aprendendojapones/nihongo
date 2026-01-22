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
    manifest: "/manifest.json",
    themeColor: "#ff3e3e",
    viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Nihongo Master",
    },
};

import ClientLayout from "@/components/ClientLayout";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" className={`${inter.variable} ${notoTabsJP.variable}`}>
            <body>
                <Providers>
                    <ClientLayout>
                        {children}
                    </ClientLayout>
                </Providers>
            </body>
        </html>
    );
}
