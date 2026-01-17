"use client";

import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isHome = pathname === '/';
    const hasSidebar = !!session;

    return (
        <div className="flex">
            <Sidebar />
            <main className={`main-content ${hasSidebar ? (isHome ? 'with-sidebar-expanded' : 'with-sidebar-minimized') : ''}`}>
                {children}
            </main>
        </div>
    );
}
