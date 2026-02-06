"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import WorkbookPage from '@/components/workbook/WorkbookPage';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { WorkbookPage as WorkbookPageType } from '@/types/workbook-schema';

export default function WorkbookPlayerPage({ params }: { params: Promise<{ pageId: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const [pageData, setPageData] = useState<WorkbookPageType | null>(null);
    const [loading, setLoading] = useState(true);
    const [nextPageId, setNextPageId] = useState<string | null>(null);
    const [prevPageId, setPrevPageId] = useState<string | null>(null);

    useEffect(() => {
        fetchPage();
    }, [resolvedParams.pageId]);

    const fetchPage = async () => {
        try {
            setLoading(true);
            // 1. Fetch Page & Content
            const { data: page, error } = await supabase
                .from('workbook_pages')
                .select('*')
                .eq('id', resolvedParams.pageId)
                .single();

            if (error) throw error;

            // 2. Determine Next/Prev Pages (simple sibling check)
            // Ideally we'd query the whole module's pages to find neighbors, but keeping it simple for now
            // Or we pass this context from the previous screen.
            // For now, let's just fetch the module pages to find neighbors
            const { data: neighbors } = await supabase
                .from('workbook_pages')
                .select('id, order_index')
                .eq('module_id', page.module_id)
                .order('order_index', { ascending: true });
            
            if (neighbors) {
                const currentIndex = neighbors.findIndex((n: any) => n.id === page.id);
                if (currentIndex > 0) setPrevPageId(neighbors[currentIndex - 1].id);
                if (currentIndex < neighbors.length - 1) setNextPageId(neighbors[currentIndex + 1].id);
            }

            setPageData(page.content as WorkbookPageType);

        } catch (error) {
            console.error('Error loading page:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-purple-500" size={48} />
            </div>
        );
    }

    if (!pageData) return <div>Página não encontrada</div>;

    const handleComplete = async () => {
        // Mark as complete in DB
        const { error } = await supabase.from('user_workbook_progress').upsert({
            user_id: (await supabase.auth.getSession()).data.session?.user.id,
            page_id: resolvedParams.pageId,
            completed: true,
            completed_at: new Date().toISOString()
        });

        if (nextPageId) {
            router.push(`/workbook/${nextPageId}`);
        } else {
            // End of module
            router.back();
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8">
            <button 
                onClick={() => router.back()}
                className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <ChevronLeft size={20} /> Voltar ao Curso
            </button>

            <div className="max-w-4xl mx-auto">
                <WorkbookPage 
                    page={pageData} 
                    onComplete={handleComplete}
                />
            </div>
        </div>
    );
}
