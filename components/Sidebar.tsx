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
                    ))}
                </div>
            )}
        </nav>

        <div className="sidebar-footer">
            <div className="lang-switcher">
                <div className="nav-item" style={{ padding: '0.5rem 1rem', cursor: 'default', background: 'transparent' }}>
                    <Languages size={20} />
                    <span className="nav-label" style={{ fontSize: '0.8rem' }}>{t('language')}</span>
                </div>
                <div className="lang-grid">
                    {languages.map((l) => (
                        <button
                            key={l}
                            onClick={() => setLang(l)}
                            className={`lang-btn ${lang === l ? 'active' : ''}`}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    </aside>
    );
};

export default Sidebar;
