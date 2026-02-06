import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { HIRAGANA_DATA, KATAKANA_DATA, KANJI_N5, VOCAB_N5 } from '@/data/japanese';
import { WorkbookBlock } from '@/types/workbook-schema';

export async function POST() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        // 1. Create Main Course "Japonês N5 (Workbook)"
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .insert({
                title: 'Japonês N5 - Fundamental (Importado)',
                description: 'Conteúdo importado do sistema antigo. Aprenda Hiragana, Katakana e Kanji N5.',
                level: 'N5',
                is_published: true
            })
            .select()
            .single();

        if (courseError) throw courseError;
        const courseId = course.id;

        // 2. Create Module: Hiragana
        const { data: modHiragana } = await supabase.from('modules').insert({
            course_id: courseId, title: 'Domine o Hiragana', order_index: 0
        }).select().single();

        // Create Pages for Hiragana (Grouped by 5 rows for example)
        // For simplicity, let's create one huge page for now, or split by rows (A-K-S-T-N...)
        // Let's split by rows (A, Ka, Sa...)
        const rows = ['a', 'ka', 'sa', 'ta', 'na', 'ha', 'ma', 'ya', 'ra', 'wa'];
        let pageIndex = 0;

        for (const row of rows) {
            const rowChars = HIRAGANA_DATA.filter(c => c.id.startsWith(`h_${row}`));
            if (rowChars.length === 0) continue;

            const blocks: WorkbookBlock[] = [];
            
            // Intro Block
            blocks.push({
                id: `intro_${row}`,
                type: 'text',
                content: `# A Linha do "${row.toUpperCase()}"\n\nVamos aprender os caracteres desta linha.`
            });

            // Character Blocks
            rowChars.forEach(char => {
                blocks.push({
                    id: `char_${char.id}`,
                    type: 'text', // Using text for now, assuming we don't have a 'flashcard' block yet
                    content: `### ${char.char} (${char.romaji})\n\nPratique a escrita deste caractere.`
                });
                
                // Add a simple quiz
                blocks.push({
                    id: `quiz_${char.id}`,
                    type: 'multiple_choice',
                    question: `Qual é a leitura de ${char.char}?`,
                    options: [char.romaji, 'mu', 'ne', 'ro'].sort(() => Math.random() - 0.5),
                    correctAnswer: char.romaji
                });
            });

            await supabase.from('workbook_pages').insert({
                module_id: modHiragana.id,
                title: `Linha do ${row.toUpperCase()}`,
                content: blocks,
                order_index: pageIndex++
            });
        }

        // 3. Create Module: Kanji N5
        const { data: modKanji } = await supabase.from('modules').insert({
            course_id: courseId, title: 'Kanjis Essenciais N5', order_index: 2
        }).select().single();

        const kanjiBlocks: WorkbookBlock[] = [];
        KANJI_N5.forEach(k => {
            kanjiBlocks.push({
                id: `k_${k.id}`,
                type: 'text',
                content: `## ${k.char}\n\n**Significado:** ${k.meaning}\n\n**Leitura:** ${k.romaji}`
            });
            // Trace block placeholder (future)
        });

        // Add 5 Kanjis per page
        for (let i = 0; i < kanjiBlocks.length; i += 5) {
            await supabase.from('workbook_pages').insert({
                module_id: modKanji.id,
                title: `Kanjis Parte ${Math.floor(i/5) + 1}`,
                content: kanjiBlocks.slice(i, i + 5),
                order_index: Math.floor(i/5)
            });
        }

        return NextResponse.json({ success: true, message: 'Content seeded successfully' });

    } catch (error: any) {
        console.error('Seeding error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
