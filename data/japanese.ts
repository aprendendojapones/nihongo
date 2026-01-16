export interface JapaneseItem {
    id: string;
    char: string;
    romaji: string;
    level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
    type: 'hiragana' | 'katakana' | 'kanji';
    meaning?: string;
}

export const HIRAGANA_DATA: JapaneseItem[] = [
    { id: 'h_a', char: 'あ', romaji: 'a', level: 'N5', type: 'hiragana' },
    { id: 'h_i', char: 'い', romaji: 'i', level: 'N5', type: 'hiragana' },
    { id: 'h_u', char: 'う', romaji: 'u', level: 'N5', type: 'hiragana' },
    { id: 'h_e', char: 'え', romaji: 'e', level: 'N5', type: 'hiragana' },
    { id: 'h_o', char: 'お', romaji: 'o', level: 'N5', type: 'hiragana' },
    // ... more data will be added
];

export const KATAKANA_DATA: JapaneseItem[] = [
    { id: 'k_a', char: 'ア', romaji: 'a', level: 'N5', type: 'katakana' },
    { id: 'k_i', char: 'イ', romaji: 'i', level: 'N5', type: 'katakana' },
    // ... more data will be added
];

export const KANJI_N5: JapaneseItem[] = [
    { id: 'n5_sun', char: '日', romaji: 'hi/nichi', level: 'N5', type: 'kanji', meaning: 'Sun/Day' },
    { id: 'n5_moon', char: '月', romaji: 'tsuki/getsu', level: 'N5', type: 'kanji', meaning: 'Moon/Month' },
    // ... more data will be added
];
