export type MathLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface MathProblem {
    question: string;
    answer: number;
    options: number[];
}

export const getMathProblem = (level: MathLevel): MathProblem => {
    let a, b, op, answer, question;
    const options: number[] = [];

    switch (level) {
        case 1: // Soma simples (0-10)
            a = Math.floor(Math.random() * 11);
            b = Math.floor(Math.random() * (11 - a));
            answer = a + b;
            question = `${a} + ${b}`;
            break;
        case 2: // Subtração simples (0-10)
            a = Math.floor(Math.random() * 11);
            b = Math.floor(Math.random() * (a + 1));
            answer = a - b;
            question = `${a} - ${b}`;
            break;
        case 3: // Soma e Subtração (0-20)
            op = Math.random() > 0.5 ? '+' : '-';
            if (op === '+') {
                a = Math.floor(Math.random() * 21);
                b = Math.floor(Math.random() * (21 - a));
                answer = a + b;
            } else {
                a = Math.floor(Math.random() * 21);
                b = Math.floor(Math.random() * (a + 1));
                answer = a - b;
            }
            question = `${a} ${op} ${b}`;
            break;
        case 4: // Multiplicação básica (1-5)
            a = Math.floor(Math.random() * 5) + 1;
            b = Math.floor(Math.random() * 10) + 1;
            answer = a * b;
            question = `${a} × ${b}`;
            break;
        case 5: // Divisão básica (1-5)
            b = Math.floor(Math.random() * 5) + 1;
            answer = Math.floor(Math.random() * 10) + 1;
            a = b * answer;
            question = `${a} ÷ ${b}`;
            break;
        case 6: // Multiplicação (1-10)
            a = Math.floor(Math.random() * 10) + 1;
            b = Math.floor(Math.random() * 10) + 1;
            answer = a * b;
            question = `${a} × ${b}`;
            break;
        case 7: // Divisão (1-10)
            b = Math.floor(Math.random() * 10) + 1;
            answer = Math.floor(Math.random() * 10) + 1;
            a = b * answer;
            question = `${a} ÷ ${b}`;
            break;
        case 8: // Expressões simples
            a = Math.floor(Math.random() * 10) + 1;
            b = Math.floor(Math.random() * 5) + 1;
            const c = Math.floor(Math.random() * 10) + 1;
            answer = a * b + c;
            question = `(${a} × ${b}) + ${c}`;
            break;
        case 9: // Desafio
            a = Math.floor(Math.random() * 20) + 10;
            b = Math.floor(Math.random() * 20) + 10;
            answer = a + b;
            question = `${a} + ${b}`;
            // Simplesmente maior escala por enquanto
            break;
        default:
            a = 1; b = 1; answer = 2; question = "1 + 1";
    }

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
        options: options.sort(() => Math.random() - 0.5)
    };
};

