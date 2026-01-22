export interface FillBlankQuestion {
    id: string;
    sentence: string;
    missingWord: string;
    options: string[];
    translation: string;
    level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
}

export const FILL_BLANK_DATA: FillBlankQuestion[] = [
    {
        id: 'fb_n5_1',
        sentence: '私は___です。',
        missingWord: '学生',
        options: ['学生', '先生', '猫', '犬'],
        translation: 'Eu sou estudante.',
        level: 'N5'
    },
    {
        id: 'fb_n5_2',
        sentence: 'これは___ですか。',
        missingWord: '何',
        options: ['何', '誰', 'どこ', 'いつ'],
        translation: 'O que é isso?',
        level: 'N5'
    },
    {
        id: 'fb_n5_3',
        sentence: 'トイレは___ですか。',
        missingWord: 'どこ',
        options: ['どこ', '何', '誰', 'いつ'],
        translation: 'Onde fica o banheiro?',
        level: 'N5'
    },
    {
        id: 'fb_n5_4',
        sentence: '___を食べます。',
        missingWord: '寿司',
        options: ['寿司', '水', 'お茶', 'ジュース'],
        translation: 'Eu como sushi.',
        level: 'N5'
    },
    {
        id: 'fb_n5_5',
        sentence: '___を飲みます。',
        missingWord: '水',
        options: ['水', 'パン', '肉', '魚'],
        translation: 'Eu bebo água.',
        level: 'N5'
    },
    {
        id: 'fb_n5_6',
        sentence: '日本語が___です。',
        missingWord: '好き',
        options: ['好き', '嫌い', '上手', '下手'],
        translation: 'Eu gosto de japonês.',
        level: 'N5'
    },
    {
        id: 'fb_n5_7',
        sentence: '___に行きます。',
        missingWord: '学校',
        options: ['学校', '本', 'りんご', 'ペン'],
        translation: 'Eu vou para a escola.',
        level: 'N5'
    },
    {
        id: 'fb_n5_8',
        sentence: '___時です。',
        missingWord: '三',
        options: ['三', '円', '人', '本'],
        translation: 'São três horas.',
        level: 'N5'
    },
    {
        id: 'fb_n5_9',
        sentence: 'あの人は___ですか。',
        missingWord: '誰',
        options: ['誰', '何', 'どこ', 'いつ'],
        translation: 'Quem é aquela pessoa?',
        level: 'N5'
    },
    {
        id: 'fb_n5_10',
        sentence: '___ください。',
        missingWord: 'これ',
        options: ['これ', 'それ', 'あれ', 'どれ'],
        translation: 'Isto, por favor.',
        level: 'N5'
    }
];
