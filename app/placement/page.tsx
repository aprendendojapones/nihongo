"use client";

import PlacementTest from '@/components/PlacementTest';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/components/TranslationContext';
import { ArrowLeft } from 'lucide-react';

export default function PlacementPage() {
    const router = useRouter();
    const { t } = useTranslation();

    const handleComplete = (level: string) => {
        // Redirect to dashboard or show a success message
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                {t('back')}
            </button>

            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold gradient-text mb-2">{t('placement_test')}</h1>
                    <p className="text-gray-400">{t('placement_test_desc')}</p>
                </div>

                <PlacementTest onComplete={handleComplete} />
            </div>
        </div>
    );
}
