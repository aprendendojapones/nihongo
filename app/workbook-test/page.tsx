"use client";

import WorkbookPageComponent from "@/components/workbook/WorkbookPage";
import { EXAMPLE_WORKBOOK_PAGE } from "@/types/workbook-schema";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WorkbookTestPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#050505] p-6 pt-24">
            <div className="max-w-4xl mx-auto mb-6">
                <button 
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} /> Voltar ao Dashboard
                </button>
            </div>
            
            <div className="bg-[#111] border border-[#333] rounded-xl p-8 shadow-2xl">
                <div className="mb-4 text-xs font-bold text-accent-secondary uppercase tracking-wider">
                    Protótipo de Workbook
                </div>
                <WorkbookPageComponent 
                    page={EXAMPLE_WORKBOOK_PAGE} 
                    onComplete={() => alert('Próxima página (WIP)')} 
                />
            </div>
        </div>
    );
}
