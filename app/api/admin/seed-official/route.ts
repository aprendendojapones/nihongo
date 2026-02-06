
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { JLPT_EXPANDED } from '@/data/jlpt_expanded';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
    try {
        const JLPT_DATA = JLPT_EXPANDED as any;
        const results = [];

        for (const level of ['N5', 'N4', 'N3', 'N2', 'N1']) {
            const levelData = JLPT_DATA[level];
            if (!levelData) continue;

            // 1. Ensure Course Exists
            const { data: course, error: cErr } = await supabase
                .from('courses')
                .upsert({ 
                    title: `JLPT ${level} Oficial`, 
                    description: `Curso completo de preparação para ${level}.`, 
                    level: level,
                    is_published: true
                }, { onConflict: 'title' })
                .select()
                .single();

            if (cErr) {
                 console.error(`Error creating course ${level}:`, cErr);
                 continue;
            }

            // 2. KANJI Module
            if (levelData.kanji.length > 0) {
                // Find or Create Module for Kanji
                let moduleId;
                const { data: existingKanji } = await supabase
                    .from('modules')
                    .select('id')
                    .eq('course_id', course.id)
                    .eq('title', 'Kanji Essencial')
                    .single();
                 
                if (existingKanji) {
                    moduleId = existingKanji.id;
                } else {
                     const { data: newMod } = await supabase
                        .from('modules')
                        .insert({ course_id: course.id, title: 'Kanji Essencial', order_index: 1 })
                        .select().single();
                     moduleId = newMod?.id;
                }

                if (moduleId) {
                    const chunkSize = 5;
                    for (let i = 0; i < levelData.kanji.length; i += chunkSize) {
                        const chunk = levelData.kanji.slice(i, i + chunkSize);
                        const pageTitle = `Kanjis ${i+1}-${i+chunk.length}`;
                        
                        const content = [];
                        content.push({ type: 'text', content: `# Kanjis: ${chunk.map((c:any) => c.char).join(', ')}` });
                        
                        chunk.forEach((k:any) => {
                            content.push({ type: 'text', content: `## ${k.char}\n**Leitura:** ${k.u}\n**Significado:** ${k.m}` });
                            content.push({ 
                                type: 'multiple-choice', 
                                question: `Qual o significado de ${k.char}?`,
                                options: [k.m, 'Casa', 'Comer', 'Água'].sort(() => Math.random() - 0.5),
                                correctAnswer: k.m
                            });
                        });

                        await supabase.from('workbook_pages').upsert({
                            module_id: moduleId,
                            title: pageTitle,
                            content: content,
                            order_index: i
                        }, { onConflict: 'module_id, title' });
                    }
                }
            }

            // 3. VOCAB Module
            if (levelData.vocab.length > 0) {
                 let moduleId;
                 const { data: existingVocab } = await supabase
                    .from('modules')
                    .select('id')
                    .eq('course_id', course.id)
                    .eq('title', 'Vocabulário Essencial')
                    .single();
                 
                 if (existingVocab) {
                     moduleId = existingVocab.id;
                 } else {
                     const { data: newMod } = await supabase
                        .from('modules')
                        .insert({ course_id: course.id, title: 'Vocabulário Essencial', order_index: 2 })
                        .select().single();
                     moduleId = newMod?.id;
                 }
                 
                 if (moduleId) {
                     const chunkSize = 10;
                     for (let i = 0; i < levelData.vocab.length; i += chunkSize) {
                        const chunk = levelData.vocab.slice(i, i + chunkSize);
                        const pageTitle = `Vocabulário Parte ${Math.floor(i/chunkSize) + 1}`;
                        
                        const content = [];
                        content.push({ type: 'text', content: `# Lista de Palavras` });
                        
                        chunk.forEach((v:any) => {
                            content.push({ type: 'text', content: `**${v.w}** (${v.r}): ${v.m}` });
                        });
                        
                        // Quiz
                        const quizItem = chunk[0];
                        content.push({ type: 'text', content: `### Revisão Rápida` });
                        content.push({ 
                            type: 'multiple-choice', 
                            question: `Como se diz "${quizItem.m}" em japonês?`,
                            options: [quizItem.w, 'いいえ', '学生', '本'].sort(() => Math.random() - 0.5),
                            correctAnswer: quizItem.w
                        });

                        await supabase.from('workbook_pages').upsert({
                            module_id: moduleId,
                            title: pageTitle,
                            content: content,
                            order_index: i
                        }, { onConflict: 'module_id, title' });
                     }
                 }
            }
            results.push(level);
        }

        return NextResponse.json({ success: true, seeded: results });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
