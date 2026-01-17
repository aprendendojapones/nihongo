"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    LayoutDashboard,
    BookOpen,
    Gamepad2,
    School,
    Settings,
    Home,
    Languages,
    User
} from 'lucide-react';
import { useTranslation } from './TranslationContext';
import './sidebar.css';

const Sidebar = () => {
    const pathname = usePathname();
    const { data: session, update } = useSession();
    const { t, lang, setLang } = useTranslation();
    const user = session?.user as any;
    const [isExpanded, setIsExpanded] = React.useState<boolean>(true);

    // Load sidebar state from localStorage
    React.useEffect(() => {
        const savedState = localStorage.getItem('sidebarExpanded');
        if (savedState !== null) {
            setIsExpanded(savedState === 'true');
        } else {
            // Default behavior: expanded on home, minimized elsewhere
            setIsExpanded(pathname === '/');
        }
    }, [pathname]);

    // Persist sidebar state to localStorage
    const toggleSidebar = () => {
        const newState = !isExpanded;
        { id: 'game', icon: Gamepad2, label: t('game_mode'), href: '/game' },
    ];

const roleItems = [];
if (['director', 'teacher'].includes(effectiveRole)) {
    roleItems.push({ id: 'school', icon: School, label: t('school_panel'), href: '/school' });
}
if (effectiveRole === 'admin') {
    roleItems.push({ id: 'admin', icon: Settings, label: t('admin_panel'), href: '/admin' });
}

const languages: ('pt' | 'jp' | 'en' | 'fil' | 'zh' | 'hi')[] = ['pt', 'jp', 'en', 'fil', 'zh', 'hi'];

return (
    <aside className={`sidebar ${isExpanded ? 'expanded' : 'minimized'}`}>
        <div className="sidebar-header">
            <div className="logo-icon" style={{ color: 'var(--accent-primary)' }}>
                <BookOpen size={32} />
            </div>
            <span className="logo-text gradient-text">Nihongo Master</span>
            <button
                onClick={toggleSidebar}
                className="toggle-btn"
                title={isExpanded ? 'Minimizar' : 'Expandir'}
            >
                {isExpanded ? '◀' : '▶'}
            </button>
        </div>

        <nav className="sidebar-nav">
            {navItems.map((item) => (
                <Link
                    key={item.id}
                    href={item.href}
                    className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                >
                    <item.icon size={24} />
                    <span className="nav-label">{item.label}</span>
                </Link>
            ))}

            {roleItems.length > 0 && (
                <div style={{ margin: '1rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                    {roleItems.map((item) => (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                        >
                            <item.icon size={24} />
                            <span className="nav-label">{item.label}</span>
                        </Link>
                        {
                            languages.map((l) => (
                                <button
                                    key={l}
                                    onClick={() => setLang(l)}
                                    className={`lang-btn ${lang === l ? 'active' : ''}`}
                                >
                                    {l}
                                </button>
                            ))
                        }
                    </div>
                </div>
    </div>
        </aside >
    );
};

export default Sidebar;
