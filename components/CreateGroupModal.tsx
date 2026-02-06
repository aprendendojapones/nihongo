"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Loader2 } from 'lucide-react';
import { useTranslation } from '@/components/TranslationContext'; // Assuming context exists

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
    const [groupName, setGroupName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { t } = useTranslation(); // Use translation if available, or fallback

    if (!isOpen) return null;

    const handleCreate = async () => {
        if (!groupName.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/groups/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: groupName })
            });

            const data = await response.json();

            if (data.success && data.checkoutUrl) {
                // Redirect to Stripe Checkout
                window.location.href = data.checkoutUrl;
            } else {
                alert('Erro ao criar grupo: ' + (data.error || 'Erro desconhecido'));
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Erro ao criar grupo. Tente novamente.');
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 w-full max-w-md shadow-2xl relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    ✕
                </button>

                <div className="flex flex-col items-center mb-6">
                    <div className="bg-[#ff4d4d20] p-3 rounded-full mb-3">
                        <Users size={32} className="text-[#ff4d4d]" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Criar Grupo de Estudos</h2>
                    <p className="text-gray-400 text-center mt-2">
                        Torne-se um Líder de Grupo e gerencie seus próprios membros com descontos exclusivos.
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Nome do Grupo</label>
                        <input 
                            type="text" 
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Ex: Guerreiros do Kanji"
                            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff4d4d] transition-colors"
                        />
                    </div>

                    <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#333]">
                        <h4 className="text-sm font-semibold text-white mb-2">Detalhes da Assinatura</h4>
                        <ul className="text-xs text-gray-400 space-y-1">
                            <li>• Acesso total aow painel de gestão</li>
                            <li>• Convide amigos e ganhen descontos progressivos</li>
                            <li>• Monitore o progresso de todos os membros</li>
                        </ul>
                    </div>

                    <button 
                        onClick={handleCreate}
                        disabled={isLoading || !groupName.trim()}
                        className="w-full bg-[#ff4d4d] hover:bg-[#e60000] text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>Criar Grupo e Assinar</>
                        )}
                    </button>
                    
                    <p className="text-xs text-center text-gray-500 mt-4">
                        Ao continuar, você será redirecionado para o pagamento seguro via Stripe.
                    </p>
                </div>
            </div>
        </div>
    );
}
