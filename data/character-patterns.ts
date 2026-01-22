// Simplified character patterns for Hiragana and Katakana
// Each pattern contains stroke count and basic direction information

export interface Point {
    x: number;
    y: number;
}

export interface Stroke {
    points: Point[];
    direction: 'horizontal' | 'vertical' | 'diagonal-right' | 'diagonal-left' | 'curve';
}

export interface CharacterPattern {
    char: string;
    strokeCount: number;
    // Simplified representation: just stroke count and general shape
    complexity: 'simple' | 'medium' | 'complex';
    expectedDirections?: Stroke['direction'][];
}

// Hiragana patterns (basic 46 characters)
export const HIRAGANA_PATTERNS: CharacterPattern[] = [
    { char: 'あ', strokeCount: 3, complexity: 'medium', expectedDirections: ['horizontal', 'vertical', 'curve'] },
    { char: 'い', strokeCount: 2, complexity: 'simple', expectedDirections: ['vertical', 'vertical'] },
    { char: 'う', strokeCount: 2, complexity: 'simple', expectedDirections: ['diagonal-right', 'curve'] },
    { char: 'え', strokeCount: 2, complexity: 'simple', expectedDirections: ['diagonal-right', 'curve'] },
    { char: 'お', strokeCount: 3, complexity: 'medium', expectedDirections: ['horizontal', 'curve', 'diagonal-right'] },

    { char: 'か', strokeCount: 3, complexity: 'medium' },
    { char: 'き', strokeCount: 4, complexity: 'medium' },
    { char: 'く', strokeCount: 1, complexity: 'simple' },
    { char: 'け', strokeCount: 3, complexity: 'medium' },
    { char: 'こ', strokeCount: 2, complexity: 'simple' },

    { char: 'さ', strokeCount: 3, complexity: 'medium' },
    { char: 'し', strokeCount: 1, complexity: 'simple' },
    { char: 'す', strokeCount: 2, complexity: 'simple' },
    { char: 'せ', strokeCount: 3, complexity: 'medium' },
    { char: 'そ', strokeCount: 1, complexity: 'simple' },

    { char: 'た', strokeCount: 4, complexity: 'medium' },
    { char: 'ち', strokeCount: 2, complexity: 'simple' },
    { char: 'つ', strokeCount: 1, complexity: 'simple' },
    { char: 'て', strokeCount: 1, complexity: 'simple' },
    { char: 'と', strokeCount: 2, complexity: 'simple' },

    { char: 'な', strokeCount: 4, complexity: 'medium' },
    { char: 'に', strokeCount: 3, complexity: 'simple' },
    { char: 'ぬ', strokeCount: 2, complexity: 'simple' },
    { char: 'ね', strokeCount: 2, complexity: 'medium' },
    { char: 'の', strokeCount: 1, complexity: 'simple' },

    { char: 'は', strokeCount: 3, complexity: 'medium' },
    { char: 'ひ', strokeCount: 1, complexity: 'simple' },
    { char: 'ふ', strokeCount: 4, complexity: 'medium' },
    { char: 'へ', strokeCount: 1, complexity: 'simple' },
    { char: 'ほ', strokeCount: 4, complexity: 'medium' },

    { char: 'ま', strokeCount: 3, complexity: 'medium' },
    { char: 'み', strokeCount: 2, complexity: 'simple' },
    { char: 'む', strokeCount: 3, complexity: 'medium' },
    { char: 'め', strokeCount: 2, complexity: 'simple' },
    { char: 'も', strokeCount: 3, complexity: 'simple' },

    { char: 'や', strokeCount: 3, complexity: 'simple' },
    { char: 'ゆ', strokeCount: 2, complexity: 'simple' },
    { char: 'よ', strokeCount: 2, complexity: 'simple' },

    { char: 'ら', strokeCount: 2, complexity: 'simple' },
    { char: 'り', strokeCount: 2, complexity: 'simple' },
    { char: 'る', strokeCount: 1, complexity: 'simple' },
    { char: 'れ', strokeCount: 1, complexity: 'simple' },
    { char: 'ろ', strokeCount: 1, complexity: 'simple' },

    { char: 'わ', strokeCount: 2, complexity: 'simple' },
    { char: 'を', strokeCount: 3, complexity: 'medium' },
    { char: 'ん', strokeCount: 1, complexity: 'simple' },
];

// Katakana patterns (basic 46 characters)
export const KATAKANA_PATTERNS: CharacterPattern[] = [
    { char: 'ア', strokeCount: 2, complexity: 'simple' },
    { char: 'イ', strokeCount: 2, complexity: 'simple' },
    { char: 'ウ', strokeCount: 3, complexity: 'simple' },
    { char: 'エ', strokeCount: 3, complexity: 'simple' },
    { char: 'オ', strokeCount: 3, complexity: 'simple' },

    { char: 'カ', strokeCount: 2, complexity: 'simple' },
    { char: 'キ', strokeCount: 3, complexity: 'simple' },
    { char: 'ク', strokeCount: 2, complexity: 'simple' },
    { char: 'ケ', strokeCount: 3, complexity: 'simple' },
    { char: 'コ', strokeCount: 2, complexity: 'simple' },

    { char: 'サ', strokeCount: 3, complexity: 'simple' },
    { char: 'シ', strokeCount: 3, complexity: 'simple' },
    { char: 'ス', strokeCount: 2, complexity: 'simple' },
    { char: 'セ', strokeCount: 2, complexity: 'simple' },
    { char: 'ソ', strokeCount: 2, complexity: 'simple' },

    { char: 'タ', strokeCount: 3, complexity: 'simple' },
    { char: 'チ', strokeCount: 3, complexity: 'simple' },
    { char: 'ツ', strokeCount: 3, complexity: 'simple' },
    { char: 'テ', strokeCount: 3, complexity: 'simple' },
    { char: 'ト', strokeCount: 2, complexity: 'simple' },

    { char: 'ナ', strokeCount: 2, complexity: 'simple' },
    { char: 'ニ', strokeCount: 2, complexity: 'simple' },
    { char: 'ヌ', strokeCount: 2, complexity: 'simple' },
    { char: 'ネ', strokeCount: 4, complexity: 'medium' },
    { char: 'ノ', strokeCount: 1, complexity: 'simple' },

    { char: 'ハ', strokeCount: 2, complexity: 'simple' },
    { char: 'ヒ', strokeCount: 2, complexity: 'simple' },
    { char: 'フ', strokeCount: 1, complexity: 'simple' },
    { char: 'ヘ', strokeCount: 1, complexity: 'simple' },
    { char: 'ホ', strokeCount: 4, complexity: 'medium' },

    { char: 'マ', strokeCount: 2, complexity: 'simple' },
    { char: 'ミ', strokeCount: 3, complexity: 'simple' },
    { char: 'ム', strokeCount: 2, complexity: 'simple' },
    { char: 'メ', strokeCount: 2, complexity: 'simple' },
    { char: 'モ', strokeCount: 3, complexity: 'simple' },

    { char: 'ヤ', strokeCount: 2, complexity: 'simple' },
    { char: 'ユ', strokeCount: 2, complexity: 'simple' },
    { char: 'ヨ', strokeCount: 3, complexity: 'simple' },

    { char: 'ラ', strokeCount: 2, complexity: 'simple' },
    { char: 'リ', strokeCount: 2, complexity: 'simple' },
    { char: 'ル', strokeCount: 2, complexity: 'simple' },
    { char: 'レ', strokeCount: 1, complexity: 'simple' },
    { char: 'ロ', strokeCount: 3, complexity: 'simple' },

    { char: 'ワ', strokeCount: 2, complexity: 'simple' },
    { char: 'ヲ', strokeCount: 3, complexity: 'simple' },
    { char: 'ン', strokeCount: 1, complexity: 'simple' },
];

export const ALL_PATTERNS = [...HIRAGANA_PATTERNS, ...KATAKANA_PATTERNS];
