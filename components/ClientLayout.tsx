"use client";

import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const hasSidebar = !!session;
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        const savedState = localStorage.getItem('sidebarExpanded');
        if (savedState !== null) {
            setIsExpanded(savedState === 'true');
        } else {
            setIsExpanded(pathname === '/');
        }

        // Listen for storage changes
        const handleStorageChange = () => {
            const newState = localStorage.getItem('sidebarExpanded');
            if (newState !== null) {
                setIsExpanded(newState === 'true');
            }
        };

        window.addEventListener('storage', handleStorageChange);
        // Custom event for same-tab updates
        window.addEventListener('sidebarToggle', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('sidebarToggle', handleStorageChange);
        };
    }, [pathname]);

    return (
        <div className="flex">
            <Sidebar />
            <main className={`main-content ${hasSidebar ? (isExpanded ? 'with-sidebar-expanded' : 'with-sidebar-minimized') : ''}`}>
                {children}
            </main>
        </div>
    );
}
