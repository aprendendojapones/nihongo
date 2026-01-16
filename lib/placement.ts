import { JapaneseItem, HIRAGANA_DATA, KANJI_N5 } from "@/data/japanese";

export interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: string;
    level: string;
}

export const PLACEMENT_TEST_QUESTIONS: Question[] = [
    {
        id: 'q1',
        text: 'Qual é o romaji para "あ"?',
        options: ['a', 'i', 'u', 'e'],
        correctAnswer: 'a',
        level: 'N5'
    },
    {
        id: 'q2',
        text: 'O que significa o Kanji "日"?',
        options: ['Lua', 'Sol/Dia', 'Água', 'Fogo'],
        correctAnswer: 'Sol/Dia',
        level: 'N5'
    },
    // ... more questions for higher levels
];

export function calculateStartingLevel(score: number, total: number): string {
    const percentage = (score / total) * 100;
    if (percentage < 20) return 'N5';
    if (percentage < 40) return 'N4';
    if (percentage < 60) return 'N3';
    if (percentage < 80) return 'N2';
    return 'N1';
}
