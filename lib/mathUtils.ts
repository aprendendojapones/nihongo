export type MathLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface MathProblem {
    question: string;
    answer: number;
    options: number[];
    visualType: 'number' | 'fruit' | 'object';
    visualIcon?: string;
    numA: number;
    numB: number;
    operator: string;
}

const ICONS = {
    fruit: ['🍎', '🍏', '🍌', '🍇', '🍓', '🍒', '🍍', '🥝'],
    object: ['⭐', '💎', '🎨', '🚀', '⚽', '🚗', '🧸', '🎁']
};

export const getMathProblem = (level: MathLevel): MathProblem => {
    let a, b, op, answer, question;
    const options: number[] = [];

    // Todos os operadores disponíveis em todos os níveis
    const availableOps = ['+', '-', '*', '/'];
    op = availableOps[Math.floor(Math.random() * availableOps.length)];

    // Escala de números baseada no nível (range = level * 10)
    const range = level * 10;

    switch (op) {
        case '+':
            a = Math.floor(Math.random() * range) + 1;
            b = Math.floor(Math.random() * range) + 1;
            answer = a + b;
            question = `${a} + ${b}`;
            break;
        case '-':
            a = Math.floor(Math.random() * range) + (range / 2);
            b = Math.floor(Math.random() * a) + 1;
            answer = a - b;
            question = `${a} - ${b}`;
            break;
        case '*':
            // Multiplicação: um número até o nível+2, outro até 10 para não ficar impossível
            a = Math.floor(Math.random() * (level + 2)) + 1;
            b = Math.floor(Math.random() * 10) + 1;
            answer = a * b;
            question = `${a} × ${b}`;
            break;
        case '/':
            // Divisão: garante resultado inteiro
            answer = Math.floor(Math.random() * 10) + 1;
            b = Math.floor(Math.random() * (level + 2)) + 1;
            a = b * answer;
            question = `${a} ÷ ${b}`;
            break;
        default:
            a = 1; b = 1; answer = 2; question = "1 + 1"; op = "+";
    }

    // Determinar se será visual (30% de chance para níveis baixos, 10% para altos)
    const visualChance = level <= 3 ? 0.3 : 0.1;
    const isVisual = Math.random() < visualChance && a <= 10 && b <= 10;
    const visualType = isVisual ? (Math.random() > 0.5 ? 'fruit' : 'object') : 'number';
    const visualIcon = (visualType === 'fruit' || visualType === 'object')
        ? ICONS[visualType][Math.floor(Math.random() * ICONS[visualType].length)]
        : undefined;

    options.push(answer);
    while (options.length < 4) {
        const offset = Math.floor(Math.random() * 11) - 5;
        const wrong = answer + offset;
        if (wrong >= 0 && !options.includes(wrong)) {
            options.push(wrong);
        }
    }

    return {
        question,
        answer,
        options: options.sort(() => Math.random() - 0.5),
        visualType,
        visualIcon,
        numA: a,
        numB: b,
        operator: op
    };
};

