"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';

type Language = 'pt' | 'jp' | 'en' | 'fil' | 'zh' | 'hi';

interface TranslationContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const translations: Record<Language, Record<string, string>> = {
    pt: {
        welcome: "Bem-vindo",
        dashboard: "Painel",
        study: "Estudar",
        handwriting: "Prática de Escrita",
        login: "Entrar com Google",
        logout: "Sair",
        continue_studying: "Continuar Estudando",
        next_lesson: "Próxima Lição",
        global_ranking: "Ranking Global",
        achievements: "Conquistas",
        level: "Nível",
        xp_needed: "Faltam {xp} XP para o nível {next}.",
        learning_path: "Trilha de Aprendizado",
        learning_path_desc: "Siga o caminho para a fluência no japonês.",
        start: "Começar",
        review: "Revisar",
        take_test: "Fazer Provinha",
        locked: "Bloqueado",
        locked_desc: "Conclua a provinha de {level} para desbloquear.",
        final_challenge: "Desafio Final",
        final_challenge_desc: "Conclua todos os níveis para desbloquear o Exame de Proficiência N1 e ganhar o selo de Mestre.",
        back: "Voltar",
        type_romaji: "Digite o romaji...",
        hint: "Dica: {hint}",
        write_pronunciation: "Escreva a pronúncia em romaji",
        test_mode: "Modo Provinha: Sem dicas!",
        test_completed: "Provinha Concluída!",
        level_completed: "Nível Concluído!",
        congrats_test: "Parabéns! Você acertou {percent}% e desbloqueou o próximo nível.",
        congrats_level: "Você ganhou 500 XP e liberou a provinha.",
        try_again: "Tente Novamente",
        fail_test: "Você acertou {percent}%. É necessário pelo menos 80% para passar na provinha.",
        back_to_lessons: "Voltar para Trilhas",
        loading: "Carregando...",
        handwriting_practice_desc: "Pratique a escrita do Kanji acima usando seu celular.",
        days: "Dias",
        school_panel: "Painel da Escola",
        admin_panel: "Painel do Administrador",
        student: "Estudante",
        hero_desc: "Aprenda Japonês do N5 ao N1 com gamificação e prática de escrita em tempo real.",
        jlpt_levels: "Níveis JLPT",
        jlpt_levels_desc: "Conteúdo estruturado do básico ao avançado.",
        game_mode: "Modo Game",
        game_mode_desc: "Aprenda brincando e suba no ranking global.",
        realtime_writing: "Escrita Real-time",
        realtime_writing_desc: "Use seu celular como tablet de escrita para o PC.",
        go_to_dashboard: "Ir para o Painel",
        admin_panel_desc: "Gerenciamento de Escolas e Acessos",
        create_new_school: "Criar Nova Escola",
        school_name_placeholder: "Nome da Escola",
        create: "Criar",
        generate_invite: "Gerar Convite",
        invite_desc: "Selecione uma escola abaixo para gerar um link de convite para Diretor ou Professor.",
        copy_link: "Copiar Link",
        generate_another: "Gerar Outro",
        registered_schools: "Escolas Cadastradas",
        director: "Diretor",
        not_assigned: "Não atribuído",
        invite_director: "Convite Diretor",
        invite_teacher: "Convite Professor",
        school_dashboard: "Painel da Escola",
        teacher: "Professor",
        student_onboarding: "Onboarding de Alunos",
        enrolled_students: "Alunos Matriculados",
        search_student: "Buscar aluno...",
        view_progress: "Ver Progresso",
        no_students: "Nenhum aluno matriculado ainda.",
        school_stats: "Estatísticas da Escola",
        total_students: "Total de Alunos",
        average_level: "Média de Nível",
        onboarding_desc: "Peça para o aluno escanear este código para se vincular automaticamente à sua escola.",
        close: "Fechar",
        level_katakana_title: "Katakana",
        level_katakana_desc: "O alfabeto para palavras estrangeiras.",
        level_hiragana_title: "Hiragana",
        level_hiragana_desc: "A base da escrita japonesa.",
        level_n5_kanji_title: "Basic Kanji (N5)",
        level_n5_kanji_desc: "Os primeiros ideogramas essenciais.",
        level_n5_vocab_title: "Vocabulário N5",
        level_n5_vocab_desc: "Palavras e expressões do dia a dia.",
        level_n5_final_title: "JLPT N5 Final",
        level_n5_final_desc: "O grande teste do nível N5.",
        level_n4_kanji_title: "Kanji N4",
        level_n4_kanji_desc: "Ideogramas de nível intermediário-básico.",
        level_n4_vocab_title: "Vocabulário N4",
        level_n4_vocab_desc: "Palavras para situações cotidianas complexas.",
        level_n4_final_title: "JLPT N4 Final",
        level_n4_final_desc: "O teste definitivo do nível N4.",
        level_n3_title: "JLPT N3",
        level_n3_desc: "Nível intermediário.",
        language: "Idioma",
        wrong: "Errados",
        correct: "Corretos",
        confirm_reset_game: "Deseja reiniciar o progresso deste nível?",
        reset_game: "Reiniciar Jogo"
    },
    jp: {
        welcome: "ようこそ",
        dashboard: "ダッシュボード",
        study: "勉強する",
        handwriting: "書き取り練習",
        login: "Googleでログイン",
        logout: "ログアウト",
        continue_studying: "勉強を続ける",
        next_lesson: "次のレッスン",
        global_ranking: "世界ランキング",
        achievements: "実績",
        level: "レベル",
        xp_needed: "レベル{next}まであと{xp} XPです。",
        learning_path: "学習パス",
        learning_path_desc: "日本語がペラペラになるまでの道を進みましょう。",
        start: "始める",
        review: "復習する",
        take_test: "テストを受ける",
        locked: "ロック中",
        locked_desc: "{level}のテストをクリアしてアンロックしましょう。",
        final_challenge: "最終チャレンジ",
        final_challenge_desc: "すべてのレベルをクリアして、N1試験をアンロックし、マスターバッジを獲得しましょう。",
        back: "戻る",
        type_romaji: "ローマ字を入力...",
        hint: "ヒント: {hint}",
        write_pronunciation: "ローマ字で読み方を書いてください",
        test_mode: "テストモード: ヒントなし！",
        test_completed: "テスト完了！",
        level_completed: "レベル完了！",
        congrats_test: "おめでとうございます！{percent}%正解して、次のレベルをアンロックしました。",
        congrats_level: "500 XPを獲得し、テストが解放されました。",
        try_again: "もう一度挑戦",
        fail_test: "{percent}%正解でした。合格には80%以上必要です。",
        back_to_lessons: "学習パスに戻る",
        loading: "読み込み中...",
        handwriting_practice_desc: "スマホを使って上の漢字の書き取り練習をしましょう。",
        days: "日",
        school_panel: "学校パネル",
        admin_panel: "管理者パネル",
        student: "学生",
        hero_desc: "N5からN1までの日本語を、ゲーム感覚とリアルタイムの書き取り練習で学びましょう。",
        jlpt_levels: "JLPTレベル",
        jlpt_levels_desc: "基礎から応用まで体系化されたコンテンツです。",
        game_mode: "ゲームモード",
        game_mode_desc: "遊びながら学び、世界ランキングを上げましょう。",
        realtime_writing: "リアルタイム書き取り",
        realtime_writing_desc: "スマホをPCの書き取りタブレットとして使えます。",
        go_to_dashboard: "ダッシュボードへ",
        admin_panel_desc: "学校とアクセスの管理",
        create_new_school: "新しい学校を作成",
        school_name_placeholder: "学校名",
        create: "作成",
        generate_invite: "招待状を生成",
        invite_desc: "下の学校を選択して、ディレクターまたは教師の招待リンクを生成します。",
        copy_link: "リンクをコピー",
        generate_another: "別のものを生成",
        registered_schools: "登録済みの学校",
        director: "ディレクター",
        not_assigned: "未割り当て",
        invite_director: "ディレクターを招待",
        invite_teacher: "教師を招待",
        school_dashboard: "学校ダッシュボード",
        teacher: "教師",
        student_onboarding: "学生のオンボーディング",
        enrolled_students: "登録済みの学生",
        search_student: "学生を検索...",
        view_progress: "進捗を確認",
        no_students: "まだ学生が登録されていません。",
        school_stats: "学校の統計",
        total_students: "学生総数",
        average_level: "平均レベル",
        onboarding_desc: "学生にこのコードをスキャンしてもらい、自動的にあなたの学校にリンクさせます。",
        close: "閉じる",
        level_katakana_title: "カタカナ",
        level_katakana_desc: "外来語のための文字です。",
        level_hiragana_title: "ひらがな",
        level_hiragana_desc: "日本語の基本となる文字です。",
        level_n5_kanji_title: "基本漢字 (N5)",
        level_n5_kanji_desc: "最初に覚えるべき重要な漢字です。",
        level_n5_vocab_title: "N5語彙",
        level_n5_vocab_desc: "日常会話で使う言葉です。",
        level_n5_final_title: "JLPT N5 最終テスト",
        level_n5_final_desc: "N5レベルの総仕上げテストです。",
        level_n4_kanji_title: "N4漢字",
        level_n4_kanji_desc: "初中級レベルの漢字です。",
        level_n4_vocab_title: "N4語彙",
        level_n4_vocab_desc: "少し複雑な日常会話の言葉です。",
        level_n4_final_title: "JLPT N4 最終テスト",
        level_n4_final_desc: "N4レベルの総仕上げテストです。",
        level_n3_title: "JLPT N3",
        level_n3_desc: "中級レベルです。",
        language: "言語",
        wrong: "間違い",
        correct: "正解",
        confirm_reset_game: "このレベルの進捗をリセットしますか？",
        reset_game: "ゲームをリセット"
    },
    en: {
        welcome: "Welcome",
        dashboard: "Dashboard",
        study: "Study",
        handwriting: "Handwriting Practice",
        login: "Sign in with Google",
        logout: "Sign out",
        continue_studying: "Continue Studying",
        next_lesson: "Next Lesson",
        global_ranking: "Global Ranking",
        achievements: "Achievements",
        level: "Level",
        xp_needed: "{xp} XP left for level {next}.",
        learning_path: "Learning Path",
        learning_path_desc: "Follow the path to Japanese fluency.",
        start: "Start",
        review: "Review",
        take_test: "Take Test",
        locked: "Locked",
        locked_desc: "Complete {level} test to unlock.",
        final_challenge: "Final Challenge",
        final_challenge_desc: "Complete all levels to unlock the N1 Proficiency Exam and earn the Master badge.",
        back: "Back",
        type_romaji: "Type romaji...",
        hint: "Hint: {hint}",
        write_pronunciation: "Write the pronunciation in romaji",
        test_mode: "Test Mode: No hints!",
        test_completed: "Test Completed!",
        level_completed: "Level Completed!",
        congrats_test: "Congratulations! You scored {percent}% and unlocked the next level.",
        congrats_level: "You earned 500 XP and unlocked the test.",
        try_again: "Try Again",
        fail_test: "You scored {percent}%. At least 80% is required to pass the test.",
        back_to_lessons: "Back to Path",
        loading: "Loading...",
        handwriting_practice_desc: "Practice writing the Kanji above using your mobile device.",
        days: "Days",
        school_panel: "School Panel",
        admin_panel: "Admin Panel",
        student: "Student",
        hero_desc: "Learn Japanese from N5 to N1 with gamification and real-time handwriting practice.",
        jlpt_levels: "JLPT Levels",
        jlpt_levels_desc: "Structured content from basic to advanced.",
        game_mode: "Game Mode",
        game_mode_desc: "Learn while playing and climb the global ranking.",
        realtime_writing: "Real-time Writing",
        realtime_writing_desc: "Use your mobile as a writing tablet for your PC.",
        go_to_dashboard: "Go to Dashboard",
        admin_panel_desc: "School and Access Management",
        create_new_school: "Create New School",
        school_name_placeholder: "School Name",
        create: "Create",
        generate_invite: "Generate Invite",
        invite_desc: "Select a school below to generate an invite link for a Director or Teacher.",
        copy_link: "Copy Link",
        generate_another: "Generate Another",
        registered_schools: "Registered Schools",
        director: "Director",
        not_assigned: "Not assigned",
        invite_director: "Invite Director",
        invite_teacher: "Invite Teacher",
        school_dashboard: "School Dashboard",
        teacher: "Teacher",
        student_onboarding: "Student Onboarding",
        enrolled_students: "Enrolled Students",
        search_student: "Search student...",
        view_progress: "View Progress",
        no_students: "No students enrolled yet.",
        school_stats: "School Statistics",
        total_students: "Total Students",
        average_level: "Average Level",
        onboarding_desc: "Ask the student to scan this code to automatically link to your school.",
        close: "Close",
        level_katakana_title: "Katakana",
        level_katakana_desc: "The alphabet for foreign words.",
        level_hiragana_title: "Hiragana",
        level_hiragana_desc: "The foundation of Japanese writing.",
        level_n5_kanji_title: "Basic Kanji (N5)",
        level_n5_kanji_desc: "The first essential characters.",
        level_n5_vocab_title: "N5 Vocabulary",
        level_n5_vocab_desc: "Everyday words and expressions.",
        level_n5_final_title: "JLPT N5 Final",
        level_n5_final_desc: "The big test for N5 level.",
        level_n4_kanji_title: "N4 Kanji",
        level_n4_kanji_desc: "Intermediate-basic characters.",
        level_n4_vocab_title: "N4 Vocabulary",
        level_n4_vocab_desc: "Words for complex daily situations.",
        level_n4_final_title: "JLPT N4 Final",
        level_n4_final_desc: "The definitive test for N4 level.",
        level_n3_title: "JLPT N3",
        level_n3_desc: "Intermediate level.",
        language: "Language",
        wrong: "Wrong",
        correct: "Correct",
        confirm_reset_game: "Reset progress for this level?",
        reset_game: "Reset Game"
    },
    fil: { welcome: "Maligayang pagdating" },
    zh: { welcome: "欢迎" },
    hi: { welcome: "स्वागत है" }
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLang] = useState<Language>('pt');
    const { data: session } = useSession();
    const user = session?.user as any;

    // Load language preference
    useEffect(() => {
        const loadLang = async () => {
            if (user?.id) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('language_pref')
                    .eq('id', user.id)
                    .single();

                if (data?.language_pref && translations[data.language_pref as Language]) {
                    setLang(data.language_pref as Language);
                    return;
                }
            }

            // Fallback to local storage or system lang
            const savedLang = localStorage.getItem('preferred_language') as Language;
            if (savedLang && translations[savedLang]) {
                setLang(savedLang);
            } else {
                const systemLang = navigator.language.split('-')[0] as Language;
                if (translations[systemLang]) {
                    setLang(systemLang);
                }
            }
        };

        loadLang();
    }, [user?.id]);

    const handleSetLang = async (newLang: Language) => {
        setLang(newLang);
        localStorage.setItem('preferred_language', newLang);

        if (user?.id) {
            await supabase
                .from('profiles')
                .update({ language_pref: newLang })
                .eq('id', user.id);
        }
    };

    const t = (key: string, params?: Record<string, string | number>) => {
        let text = translations[lang][key] || translations['en'][key] || key;

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                text = text.replace(`{${key}}`, String(value));
            });
        }

        return text;
    };

    return (
        <TranslationContext.Provider value={{ lang, setLang: handleSetLang, t }}>
            {children}
        </TranslationContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(TranslationContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within a TranslationProvider');
    }
    return context;
}
