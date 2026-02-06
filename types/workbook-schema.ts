export type BlockType = 'text' | 'image' | 'audio_example' | 'fill_blank' | 'multiple_choice' | 'kanji_trace';

export interface WorkbookBlock {
    id: string;
    type: BlockType;
    content?: string; // Markdown supported for text
    url?: string; // For images/audio
    
    // For specific types
    japanese?: string; // For audio_example
    translation?: string; // For audio_example
    
    question?: string; // For exercises
    options?: string[]; // For multiple_choice
    correctAnswer?: string | number; // For automated checking
    
    kanji?: string; // For kanji_trace
    strokeData?: any; // SVG path data for strokes
}

export interface WorkbookPage {
    id: string;
    title: string;
    orderIndex: number;
    blocks: WorkbookBlock[];
}

export interface WorkbookModule {
    id: string;
    title: string;
    description: string;
    orderIndex: number;
    pages: WorkbookPage[];
}

export interface Course {
    id: string;
    title: string; // e.g. "Japonês N5 Completo"
    description: string;
    thumbnailUrl?: string;
    modules: WorkbookModule[];
}

// Example Data Structure for N5 Lesson 1
export const EXAMPLE_WORKBOOK_PAGE: WorkbookPage = {
    id: 'page_n5_1_1',
    title: 'Introdução às Partículas - WA (は)',
    orderIndex: 0,
    blocks: [
        {
            id: 'b1',
            type: 'text',
            content: '# A Partícula WA (は)\n\nA partícula **WA** indica o tópico da frase. Ela funciona como um holofote, dizendo: "Quanto a isso aqui, aqui está a informação".\n\nNote que embora se escreva com o hiragana HA (は), pronuncia-se "WA" quando usada como partícula.'
        },
        {
            id: 'b2',
            type: 'audio_example',
            japanese: '私は学生です。',
            translation: 'Eu sou estudante.',
            url: '/audio/watashi_wa_gakusei.mp3' // Placeholder
        },
        {
            id: 'b3',
            type: 'text',
            content: 'Nesta frase, "Watashi" (Eu) é o tópico. Estamos falando sobre "Eu".'
        },
        {
            id: 'b4',
            type: 'fill_blank',
            question: 'Complete a frase: "Tanaka __ sensei desu."',
            correctAnswer: 'wa'
        },
        {
            id: 'b5',
            type: 'multiple_choice',
            question: 'Qual a pronúncia correta da partícula は?',
            options: ['Ha', 'Wa', 'He', 'Wo'],
            correctAnswer: 'Wa'
        }
    ]
};
