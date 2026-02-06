
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Manually compile the TS data file into a require-able format or just parse it loosely if it were JSON.
// Since it's TS export, we can't 'require' it directly in Node without ts-node.
// Simpler hack: I will read the file and eval it, or better, since I just wrote it, I could have made it JSON.
// BUT, to follow the pattern, let's just copy the object definition here or require the transpiled version if we were in a build step.
// For this script, I'll allow it to just paste the data struct since it's a one-off seed script. 
// OR simpler: I will rename the previous file to .js for this operation, or just Put certain data inline to ensure reliability.
// Let's rely on reading the file content and doing a quick regex parse or just embedding the data is safer to avoid TS issues in a plain node script.

// NOTE: Ideally, we would use ts-node. I will try to use the previously created file by "requiring" it after basic transformation or just embedding a "Light" version here if reading fails.
// WAIT, I created `d:\nihongo\data\jlpt_expanded.ts`. I cannot require TS in Node.js.
// I will rewrite this script to duplicate the data structure for simplicity in execution, 
// OR I will read the file, strip 'export const JLPT_EXPANDED = ', and JSON.parse (if it was valid JSON, but it has unquoted keys).
// Use 'eval' is risky but works for local Dev scripts.

function loadEnv() {
    try {
        const envPath = path.join(__dirname, '..', '.env.local');
        const envFile = fs.readFileSync(envPath, 'utf8');
        envFile.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) process.env[key.trim()] = value.trim();
        });
    } catch (e) { console.log('Env load error', e.message); }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// EMBEDDED DATA FOR RELIABILITY IN PLAIN NODE SCRIPT
// (I will copy the data structure I just designed)
const JLPT_DATA = {
    N5: {
        kanji: [
            { char: '一', u: 'ichi', m: 'Um' }, { char: '二', u: 'ni', m: 'Dois' }, { char: '三', u: 'san', m: 'Três' },
            { char: '四', u: 'yon/shi', m: 'Quatro' }, { char: '五', u: 'go', m: 'Cinco' }, { char: '六', u: 'roku', m: 'Seis' },
            { char: '七', u: 'nana/shichi', m: 'Sete' }, { char: '八', u: 'hachi', m: 'Oito' }, { char: '九', u: 'kyuu', m: 'Nove' },
            { char: '十', u: 'juu', m: 'Dez' }, { char: '百', u: 'hyaku', m: 'Cem' }, { char: '千', u: 'sen', m: 'Mil' },
            { char: '万', u: 'man', m: 'Dez Mil' }, { char: '円', u: 'en', m: 'Iene' },
            { char: '日', u: 'hi/nichi', m: 'Dia/Sol' }, { char: '月', u: 'tsuki/getsu', m: 'Mês/Lua' },
            { char: '火', u: 'hi/ka', m: 'Fogo' }, { char: '水', u: 'mizu/sui', m: 'Água' },
            { char: '木', u: 'ki/moku', m: 'Árvore' }, { char: '金', u: 'kane/kin', m: 'Ouro/Dinheiro' },
            { char: '土', u: 'tsuchi/do', m: 'Terra' }, { char: '年', u: 'toshi/nen', m: 'Ano' },
            { char: '時', u: 'toki/ji', m: 'Tempo/Hora' }, { char: '分', u: 'fun/bun', m: 'Minuto' },
            { char: '午', u: 'go', m: 'Meio-dia' }, { char: '今', u: 'ima/kon', m: 'Agora' },
            { char: '先', u: 'saki/sen', m: 'Anterior' }, { char: '来', u: 'ku/rai', m: 'Vir/Próximo' },
             { char: '人', u: 'hito/jin', m: 'Pessoa' }, { char: '名', u: 'na/mei', m: 'Nome' },
            { char: '女', u: 'onna/jo', m: 'Mulher' }, { char: '男', u: 'otoko/dan', m: 'Homem' },
            { char: '子', u: 'ko/shi', m: 'Criança' }, { char: '目', u: 'me/moku', m: 'Olho' },
            { char: '耳', u: 'mimi/ji', m: 'Orelha' }, { char: '口', u: 'kuchi/kou', m: 'Boca' },
            { char: '手', u: 'te/shu', m: 'Mão' }, { char: '足', u: 'ashi/soku', m: 'Pé/Perna' },
            { char: '山', u: 'yama/san', m: 'Montanha' }, { char: '川', u: 'kawa/sen', m: 'Rio' },
            { char: '田', u: 'ta/den', m: 'Campo de Arroz' }, { char: '雨', u: 'ame/u', m: 'Chuva' },
        ],
        vocab: [
            { w: 'こんにちは', r: 'Konnichiwa', m: 'Olá (tarde)' }, { w: 'おはよう', r: 'Ohayou', m: 'Bom dia' },
            { w: 'こんばんは', r: 'Konbanwa', m: 'Boa noite' }, { w: 'さようなら', r: 'Sayounara', m: 'Adeus' },
            { w: 'ありがとう', r: 'Arigatou', m: 'Obrigado' }, { w: 'すみません', r: 'Sumimasen', m: 'Com licença' },
            { w: '私', r: 'Watashi', m: 'Eu' }, { w: 'あなた', r: 'Anata', m: 'Você' },
            { w: '家族', r: 'Kazoku', m: 'Família' }, { w: '父', r: 'Chichi', m: 'Pai' },
            { w: '母', r: 'Haha', m: 'Mãe' }, { w: '学校', r: 'Gakkou', m: 'Escola' },
             { w: '先生', r: 'Sensei', m: 'Professor' }, { w: '学生', r: 'Gakusei', m: 'Estudante' },
             { w: '食べる', r: 'Taberu', m: 'Comer' }, { w: '飲む', r: 'Nomu', m: 'Beber' },
             { w: '水', r: 'Mizu', m: 'Água' }, { w: '本', r: 'Hon', m: 'Livro' },
             { w: '大きい', r: 'Ookii', m: 'Grande' }, { w: '小さい', r: 'Chiisai', m: 'Pequeno' }
        ]
    },
    // Adding minimal for others to verify structure
    N4: { kanji: [{ char: '会', u: 'kai', m: 'Encontro' }], vocab: [{ w: '間', r: 'Aida', m: 'Entre' }] },
    N3: { kanji: [{ char: '政', u: 'sei', m: 'Política' }], vocab: [{ w: '愛', r: 'Ai', m: 'Amor' }] },
    N2: { kanji: [{ char: '党', u: 'tou', m: 'Partido' }], vocab: [{ w: '永遠', r: 'Eien', m: 'Eternidade' }] },
    N1: { kanji: [{ char: '氏', u: 'shi', m: 'Sobrenome' }], vocab: [{ w: '意図', r: 'Ito', m: 'Intenção' }] },
};

async function seed() {
    console.log('Starting Official Curriculum Seeding...');

    for (const level of ['N5', 'N4', 'N3', 'N2', 'N1']) {
        const levelData = JLPT_DATA[level];
        if (!levelData) continue;

        console.log(`Processing ${level}...`);

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

        if (cErr) { console.error(`Error creating course ${level}:`, cErr.message); continue; }

        // 2. KANJI Module
        if (levelData.kanji.length > 0) {
            const { data: modKanji, error: mErr } = await supabase
                .from('modules')
                .upsert({ 
                    course_id: course.id, 
                    title: 'Kanji Essencial', 
                    description: `Kanjis do nível ${level}`,
                    order_index: 1 
                }, { onConflict: 'course_id, title' }) // Constraint needs meaningful conflict target.
                // Assuming standard inserts if upsert fails on constraint. 
                // Using select to find ID if exists.
                .select().single();
                
            // If UPSERT by composite key isn't setup in DB constraints, we might duplicate. 
            // For now assume we clean up or it works. Or Search First.
            // Let's Search First to be safe.
            let moduleId = modKanji?.id;
            if (!moduleId) {
                 const { data: existing } = await supabase
                    .from('modules')
                    .select('id')
                    .eq('course_id', course.id)
                    .eq('title', 'Kanji Essencial')
                    .single();
                 
                 if (existing) moduleId = existing.id;
                 else {
                     const { data: newMod } = await supabase
                        .from('modules')
                        .insert({ course_id: course.id, title: 'Kanji Essencial', order_index: 1 })
                        .select().single();
                     moduleId = newMod.id;
                 }
            }

            // 3. Create Pages (Batch of 5 items per page)
            const chunkSize = 5;
            for (let i = 0; i < levelData.kanji.length; i += chunkSize) {
                const chunk = levelData.kanji.slice(i, i + chunkSize);
                const pageTitle = `Lição ${Math.floor(i/chunkSize) + 1} (${chunk[0].char} - ${chunk[chunk.length-1].char})`;
                
                const content = [];
                content.push({ type: 'text', content: `# Kanjis: ${chunk.map(c => c.char).join(', ')}` });
                
                chunk.forEach(k => {
                    content.push({ type: 'text', content: `## ${k.char}\n**Leitura:** ${k.u}\n**Significado:** ${k.m}` });
                    content.push({ 
                        type: 'multiple-choice', 
                        question: `Qual o significado de ${k.char}?`,
                        options: [k.m, 'Casa', 'Comer', 'Água'].sort(() => Math.random() - 0.5), // Dummy options randomized
                        correctAnswer: k.m
                    });
                });

                await supabase.from('workbook_pages').insert({
                    module_id: moduleId,
                    title: pageTitle,
                    content: content,
                    order_index: i
                });
                console.log(`Created Page: ${pageTitle}`);
            }
        }

        // 3. VOCAB Module
        if (levelData.vocab.length > 0) {
             let moduleId;
             const { data: existing } = await supabase
                .from('modules')
                .select('id')
                .eq('course_id', course.id)
                .eq('title', 'Vocabulário Essencial')
                .single();
                 
             if (existing) moduleId = existing.id;
             else {
                 const { data: newMod } = await supabase
                    .from('modules')
                    .insert({ course_id: course.id, title: 'Vocabulário Essencial', order_index: 2 })
                    .select().single();
                 moduleId = newMod.id;
             }
             
             const chunkSize = 10;
             for (let i = 0; i < levelData.vocab.length; i += chunkSize) {
                const chunk = levelData.vocab.slice(i, i + chunkSize);
                const pageTitle = `Vocabulário Parte ${Math.floor(i/chunkSize) + 1}`;
                
                const content = [];
                content.push({ type: 'text', content: `# Lista de Palavras` });
                
                chunk.forEach(v => {
                    content.push({ type: 'text', content: `**${v.w}** (${v.r}): ${v.m}` });
                    // Audio block placeholder
                    // content.push({ type: 'audio', url: '...' }); 
                });
                
                // Review Quiz at end of page
                content.push({ type: 'text', content: `### Revisão Rápida` });
                const quizItem = chunk[0];
                content.push({ 
                    type: 'multiple-choice', 
                    question: `Como se diz "${quizItem.m}" em japonês?`,
                    options: [quizItem.w, 'いいえ', '学生', '本'].sort(() => Math.random() - 0.5),
                    correctAnswer: quizItem.w
                });

                await supabase.from('workbook_pages').insert({
                    module_id: moduleId,
                    title: pageTitle,
                    content: content,
                    order_index: i
                });
                console.log(`Created Page: ${pageTitle}`);
             }
        }
    }
    console.log('Seeding Complete!');
}

seed();
