"use client";

import { useEffect, useState } from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { useTranslation } from '@/components/TranslationContext';

export default function InAppBrowserWarning() {
    const [isInAppBrowser, setIsInAppBrowser] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

        // Detect Facebook, Messenger, Instagram, LinkedIn, Line
        const isInstagram = /Instagram/i.test(userAgent);
        const isFacebook = /FBAN|FBAV/i.test(userAgent);
        const isMessenger = /Messenger/i.test(userAgent); // Sometimes covered by FB, but good to be explicit
        const isLine = /Line/i.test(userAgent);
        const isLinkedin = /LinkedIn/i.test(userAgent);

        if (isInstagram || isFacebook || isMessenger || isLine || isLinkedin) {
            setIsInAppBrowser(true);
        }
    }, []);

    if (!isInAppBrowser) return null;

    return (
        <div className="in-app-warning-overlay">
            <div className="glass-card warning-card">
                <div className="warning-icon">
                    <AlertTriangle size={48} color="#ffcc00" />
                </div>
                <h2>Atenção!</h2>
                <p>
                    Detectamos que você está usando um navegador interno (Instagram, Facebook, etc).
                    O login com Google <strong>não funcionará</strong> por motivos de segurança.
                </p>
                <div className="instruction-box">
                    <p>Por favor, abra este site no seu navegador padrão:</p>
                    <div className="steps">
                        <span>1. Toque nos <strong>3 pontinhos</strong> (ou ícone de compartilhar) no canto da tela.</span>
                        <span>2. Escolha <strong>"Abrir no Navegador"</strong> ou "Open in Chrome/Safari".</span>
                    </div>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => setIsInAppBrowser(false)}
                >
                    Entendi, vou tentar
                </button>
            </div>

            <style jsx>{`
                .in-app-warning-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.9);
                    z-index: 99999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    backdrop-filter: blur(8px);
                }

                .warning-card {
                    max-width: 400px;
                    width: 100%;
                    padding: 2rem;
                    text-align: center;
                    border: 2px solid #ffcc00;
                    animation: slideUp 0.4s ease;
                }

                .warning-icon {
                    margin-bottom: 1.5rem;
                    display: flex;
                    justify-content: center;
                }

                h2 {
                    color: white;
                    margin-bottom: 1rem;
                    font-size: 1.8rem;
                }

                p {
                    color: var(--text-muted);
                    margin-bottom: 1.5rem;
                    line-height: 1.6;
                }

                strong {
                    color: #ff3e3e;
                }

                .instruction-box {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 1.5rem;
                    border-radius: 12px;
                    margin-bottom: 2rem;
                    text-align: left;
                }

                .instruction-box p {
                    color: white;
                    margin-bottom: 1rem;
                    font-weight: bold;
                }

                .steps {
                    display: flex;
                    flex-direction: column;
                    gap: 0.8rem;
                    font-size: 0.95rem;
                    color: var(--text-muted);
                }

                .steps span {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .steps strong {
                    color: var(--accent-secondary);
                }

                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
