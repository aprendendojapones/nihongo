"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { WorkbookPage, WorkbookBlock, BlockType } from '@/types/workbook-schema';
import { ArrowLeft, Save, Plus, MoveUp, MoveDown, Trash, Type, Volume2, HelpCircle, List } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import WorkbookPageComponent from '@/components/workbook/WorkbookPage';

export default function WorkbookEditorPage() {
    const params = useParams();
    const router = useRouter();
    const pageId = params.pageId as string;

    const [page, setPage] = useState<WorkbookPage | null>(null);
    const [blocks, setBlocks] = useState<WorkbookBlock[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Editor State
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    useEffect(() => {
        fetchPage();
    }, [pageId]);

    const fetchPage = async () => {
        try {
            const { data, error } = await supabase
                .from('workbook_pages')
                .select('*')
                .eq('id', pageId)
                .single();
            
            if (error) throw error;
            
            // Map DB structure to Schema (DB 'content' -> Schema 'blocks')
            const loadedPage: WorkbookPage = {
                id: data.id,
                title: data.title,
                orderIndex: data.order_index,
                blocks: data.content || []
            };

            setPage(loadedPage);
            setBlocks(loadedPage.blocks);

        } catch (error) {
            console.error('Error fetching page:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!page) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('workbook_pages')
                .update({
                    content: blocks, // Save blocks as JSONB
                    updated_at: new Date().toISOString()
                })
                .eq('id', pageId);

            if (error) throw error;
            alert('Página salva com sucesso!');
        } catch (error) {
            console.error('Error saving page:', error);
            alert('Erro ao salvar.');
        } finally {
            setSaving(false);
        }
    };

    const addBlock = (type: BlockType) => {
        const newBlock: WorkbookBlock = {
            id: `b_${Date.now()}`,
            type,
            content: type === 'text' ? 'Novo texto...' : undefined,
            question: type === 'fill_blank' || type === 'multiple_choice' ? 'Nova pergunta...' : undefined,
            options: type === 'multiple_choice' ? ['Opção 1', 'Opção 2'] : undefined,
            japanese: type === 'audio_example' ? 'Exemplo em Japonês' : undefined,
            translation: type === 'audio_example' ? 'Tradução' : undefined
        };
        setBlocks([...blocks, newBlock]);
        setSelectedBlockId(newBlock.id);
    };

    const updateBlock = (id: string, updates: Partial<WorkbookBlock>) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    const deleteBlock = (id: string) => {
        if (confirm('Tem certeza que deseja remover este bloco?')) {
            setBlocks(blocks.filter(b => b.id !== id));
            if (selectedBlockId === id) setSelectedBlockId(null);
        }
    };

    const moveBlock = (index: number, direction: -1 | 1) => {
        if (index + direction < 0 || index + direction >= blocks.length) return;
        const newBlocks = [...blocks];
        const temp = newBlocks[index];
        newBlocks[index] = newBlocks[index + direction];
        newBlocks[index + direction] = temp;
        setBlocks(newBlocks);
    };

    if (loading) return <div className="p-8 text-white">Carregando editor...</div>;
    if (!page) return <div className="p-8 text-white">Página não encontrada.</div>;

    const selectedBlock = blocks.find(b => b.id === selectedBlockId);

    return (
        <div className="flex h-screen bg-[#050505] overflow-hidden">
            {/* Sidebar - Tools & Properties */}
            <div className="w-80 bg-[#111] border-r border-[#333] flex flex-col">
                <div className="p-4 border-b border-[#333] flex items-center justify-between">
                    <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
                        <ArrowLeft size={20} />
                    </button>
                    <span className="font-bold text-gray-200">Editor</span>
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="bg-accent-primary hover:bg-accent-secondary text-white p-2 rounded disabled:opacity-50"
                    >
                        <Save size={20} />
                    </button>
                </div>

                <div className="p-4 border-b border-[#333]">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Adicionar Bloco</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => addBlock('text')} className="flex flex-col items-center p-3 bg-[#222] hover:bg-[#333] rounded gap-2 text-xs text-gray-300">
                            <Type size={20} /> Texto
                        </button>
                        <button onClick={() => addBlock('audio_example')} className="flex flex-col items-center p-3 bg-[#222] hover:bg-[#333] rounded gap-2 text-xs text-gray-300">
                            <Volume2 size={20} /> Áudio
                        </button>
                        <button onClick={() => addBlock('fill_blank')} className="flex flex-col items-center p-3 bg-[#222] hover:bg-[#333] rounded gap-2 text-xs text-gray-300">
                            <HelpCircle size={20} /> Lacunas
                        </button>
                        <button onClick={() => addBlock('multiple_choice')} className="flex flex-col items-center p-3 bg-[#222] hover:bg-[#333] rounded gap-2 text-xs text-gray-300">
                            <List size={20} /> Quiz
                        </button>
                    </div>
                </div>

                {/* Properties Panel */}
                <div className="flex-1 overflow-y-auto p-4">
                    {selectedBlock ? (
                        <div className="animate-fade-in space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-accent-primary uppercase text-xs">Editando: {selectedBlock.type}</h3>
                                <button onClick={() => deleteBlock(selectedBlock.id)} className="text-red-500 hover:text-red-400">
                                    <Trash size={16} />
                                </button>
                            </div>

                            {/* Dynamic Fields based on Type */}
                            {selectedBlock.type === 'text' && (
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Conteúdo (Markdown)</label>
                                    <textarea 
                                        value={selectedBlock.content || ''}
                                        onChange={(e) => updateBlock(selectedBlock.id, { content: e.target.value })}
                                        className="w-full h-40 bg-[#000] border border-[#444] rounded p-2 text-sm text-white font-mono"
                                    />
                                </div>
                            )}

                            {selectedBlock.type === 'audio_example' && (
                                <>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Japonês</label>
                                        <input 
                                            value={selectedBlock.japanese || ''}
                                            onChange={(e) => updateBlock(selectedBlock.id, { japanese: e.target.value })}
                                            className="w-full bg-[#000] border border-[#444] rounded p-2 text-sm text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Tradução</label>
                                        <input 
                                            value={selectedBlock.translation || ''}
                                            onChange={(e) => updateBlock(selectedBlock.id, { translation: e.target.value })}
                                            className="w-full bg-[#000] border border-[#444] rounded p-2 text-sm text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">URL do Áudio</label>
                                        <input 
                                            value={selectedBlock.url || ''}
                                            onChange={(e) => updateBlock(selectedBlock.id, { url: e.target.value })}
                                            className="w-full bg-[#000] border border-[#444] rounded p-2 text-sm text-white"
                                        />
                                    </div>
                                </>
                            )}
                            
                            {(selectedBlock.type === 'fill_blank' || selectedBlock.type === 'multiple_choice') && (
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Pergunta</label>
                                    <input 
                                        value={selectedBlock.question || ''}
                                        onChange={(e) => updateBlock(selectedBlock.id, { question: e.target.value })}
                                        className="w-full bg-[#000] border border-[#444] rounded p-2 text-sm text-white"
                                    />
                                </div>
                            )}

                             {/* Add logic for options/correctAnswer editor here if needed */}
                        </div>
                    ) : (
                        <div className="text-gray-500 text-sm text-center mt-10">
                            Selecione um bloco na visualização para editar.
                        </div>
                    )}
                </div>
            </div>

            {/* Main Preview Area */}
            <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-8 flex justify-center">
                <div className="w-full max-w-3xl bg-[#111] min-h-[80vh] rounded-xl shadow-2xl border border-[#222] relative">
                    <div className="absolute top-0 left-0 w-full h-8 bg-[#222] rounded-t-xl flex items-center px-4 gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="ml-auto text-xs text-gray-500">Preview: {page.title}</span>
                    </div>

                    <div className="p-8 pt-12 space-y-4">
                        {blocks.map((block, index) => (
                            <div 
                                key={block.id} 
                                onClick={() => setSelectedBlockId(block.id)}
                                className={`relative group border rounded-lg transition-all ${
                                    selectedBlockId === block.id 
                                        ? 'border-accent-primary ring-1 ring-accent-primary' 
                                        : 'border-transparent hover:border-gray-700'
                                }`}
                            >
                                {/* Tooltip controls for sorting */}
                                {selectedBlockId === block.id && (
                                    <div className="absolute right-2 top-2 z-10 flex gap-1 bg-[#222] rounded p-1 shadow">
                                        <button onClick={(e) => { e.stopPropagation(); moveBlock(index, -1); }} className="p-1 hover:bg-[#444] rounded">
                                            <MoveUp size={14} />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); moveBlock(index, 1); }} className="p-1 hover:bg-[#444] rounded">
                                            <MoveDown size={14} />
                                        </button>
                                    </div>
                                )}

                                {/* Render using the actual component but ignoring interactions if needed, 
                                    or just letting it act as preview */}
                                <div className="pointer-events-none">
                                    <WorkbookPageComponent 
                                        page={{ ...page, blocks: [block] }} 
                                        onComplete={() => {}} 
                                    />
                                </div>
                            </div>
                        ))}

                        {blocks.length === 0 && (
                            <div className="text-center py-20 text-gray-600 border-2 border-dashed border-[#333] rounded-lg">
                                Adicione blocos usando o menu lateral.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
