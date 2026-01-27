"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    LayoutDashboard,
    BookOpen,
    Calculator,
    Gamepad2,
    School,
    Settings,
    Home,
    Languages,
    User,
    Trophy,
    GraduationCap
} from 'lucide-react';
import { useTranslation } from './TranslationContext';
import './sidebar.css';

const Sidebar = () => {
    const pathname = usePathname();
    const { data: session, update } = useSession();
    const { t, lang, setLang } = useTranslation();
    const user = session?.user as any;
    const [dbRole, setDbRole] = React.useState<string | null>(null);
    const [isExpanded, setIsExpanded] = React.useState<boolean>(true);
    const [hasOtherSubjects, setHasOtherSubjects] = React.useState<boolean>(false);

    // Load sidebar state from localStorage
    React.useEffect(() => {
        const savedState = localStorage.getItem('sidebarExpanded');
        if (savedState !== null) {
            setIsExpanded(savedState === 'true');
        }
    }, []);

    // Persist sidebar state to localStorage
    const toggleSidebar = () => {
        const newState = !isExpanded;
        setIsExpanded(newState);
        localStorage.setItem('sidebarExpanded', String(newState));
        window.dispatchEvent(new Event('sidebarToggle'));
    };

    // Fetch role from database and check for other subjects
    React.useEffect(() => {
        const fetchRole = async () => {
            if (session?.user?.email) {
                const { supabase } = await import('@/lib/supabase');
                const { data } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('email', session.user.email)
                    .single();
                if (data?.role) {
                    setDbRole(data.role);
                    console.log('Sidebar - Fetched role from DB:', data.role);
                }

                // Check if there are visible subjects (other than Japanese)
                const { data: subjects } = await supabase
                    .from('subjects')
                    .select('id, visibility_level')
                    .eq('visible', true)
                    .neq('slug', 'japanese');

                const canSee = (visibilityLevel: string) => {
                    const role = data?.role || 'student';
                    if (role === 'admin') return true;
                    if (role === 'teacher' || role === 'director') {
                        return visibilityLevel === 'everyone' || visibilityLevel === 'staff';
                    }
                    return visibilityLevel === 'everyone';
                };

                const visibleSubjects = subjects?.filter(s => canSee(s.visibility_level || 'everyone')) || [];
                setHasOtherSubjects(visibleSubjects.length > 0);
            }
        };
        fetchRole();
    }, [session?.user?.email]);

    if (!session) return null;

    const isHome = pathname === '/';

    // Use role from session or database
    const effectiveRole = user?.role || dbRole;
    console.log('Sidebar rendering. Effective Role:', effectiveRole, 'Path:', pathname);

    const navItems = [
        { id: 'home', icon: Home, label: t('welcome'), href: '/' },
        { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard'), href: '/dashboard' },
        { id: 'profile', icon: User, label: t('profile'), href: '/profile' },
        { id: 'lessons', icon: BookOpen, label: t('learning_path'), href: '/lessons' },
        { id: 'math', icon: Calculator, label: t('math'), href: '/math' },
        { id: 'game', icon: Gamepad2, label: t('game_mode'), href: '/games' },
        { id: 'rankings', icon: Trophy, label: t('ranking'), href: '/rankings' },
    ];

    const roleItems = [];
    if (['director', 'teacher'].includes(effectiveRole)) {
        roleItems.push({ id: 'school', icon: School, label: t('school_panel'), href: '/school' });
    }
    if (effectiveRole === 'admin') {
        roleItems.push({ id: 'admin', icon: Settings, label: t('admin_panel'), href: '/admin' });
        roleItems.push({ id: 'subjects', icon: GraduationCap, label: `${t('subjects')} *`, href: '/admin/games' });
    }

    // Add "Other Subjects" for students if there are visible subjects
    const studentItems = [];
    if (hasOtherSubjects && effectiveRole === 'student') {
        studentItems.push({ id: 'other-subjects', icon: GraduationCap, label: t('subjects'), href: '/subjects' });
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
                        ))}
                    </div>
                )}

                {studentItems.length > 0 && (
                    <div style={{ margin: '1rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                        {studentItems.map((item) => (
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
