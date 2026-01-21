"use client";

import { useState } from 'react';
import confetti from 'canvas-confetti';

interface Option {
    id: string;
    text: string;
    isCorrect: boolean;
}

interface MultipleChoiceQuestionProps {
    question: string;
    questionSubtext?: string;
    options: Option[];
    onAnswer: (isCorrect: boolean) => void;
    disabled?: boolean;
}

export default function MultipleChoiceQuestion({
    question,
    questionSubtext,
    options,
    onAnswer,
    disabled = false
}: MultipleChoiceQuestionProps) {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);

    const handleOptionClick = (option: Option) => {
        if (disabled || selectedOption) return;

        setSelectedOption(option.id);
        setShowResult(true);

        if (option.isCorrect) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#3effa2', '#00d4ff', '#ffa500']
            });
        }

        setTimeout(() => {
            onAnswer(option.isCorrect);
            setSelectedOption(null);
            setShowResult(false);
        }, 1500);
    };

    const getOptionClass = (option: Option, index: number) => {
        const letter = String.fromCharCode(65 + index); // A, B, C, D
        let className = `mcq-option option-${letter}`;

        if (showResult && selectedOption === option.id) {
            className += option.isCorrect ? ' correct' : ' wrong';
        }

        return className;
    };

    const getOptionStyle = (index: number) => {
        const colors = ['#3effa2', '#00d4ff', '#ffa500', '#ff3e3e'];
        return { borderColor: colors[index] };
    };

    return (
        <div className="mcq-container">
            <div className="mcq-question">
                <h2 className="question-text">{question}</h2>
                {questionSubtext && (
                    <p className="question-subtext">{questionSubtext}</p>
                )}
            </div>

            <div className="mcq-options-grid">
                {options.map((option, index) => (
                    <button
                        key={option.id}
                        className={getOptionClass(option, index)}
                        style={getOptionStyle(index)}
                        onClick={() => handleOptionClick(option)}
                        disabled={disabled || !!selectedOption}
                    >
                        <span className="option-letter">
                            {String.fromCharCode(65 + index)}
                        </span>
                        <span className="option-text">{option.text}</span>
                    </button>
                ))}
            </div>

            <style jsx>{`
        .mcq-container {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }

        .mcq-question {
          text-align: center;
          margin-bottom: 3rem;
        }

        .question-text {
          font-size: 4rem;
          font-weight: bold;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .question-subtext {
          font-size: 1.2rem;
          color: var(--text-muted);
        }

        .mcq-options-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .mcq-option {
          position: relative;
          padding: 2rem;
          min-height: 150px;
          border: 3px solid;
          border-radius: 16px;
          background: var(--glass-bg);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          font-size: 1rem;
          color: var(--text-primary);
        }

        .mcq-option:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .mcq-option:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .option-A:hover:not(:disabled) {
          background: rgba(62, 255, 162, 0.2);
        }

        .option-B:hover:not(:disabled) {
          background: rgba(0, 212, 255, 0.2);
        }

        .option-C:hover:not(:disabled) {
          background: rgba(255, 165, 0, 0.2);
        }

        .option-D:hover:not(:disabled) {
          background: rgba(255, 62, 62, 0.2);
        }

        .option-letter {
          position: absolute;
          top: 0.8rem;
          left: 0.8rem;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2rem;
          background: rgba(255, 255, 255, 0.1);
        }

        .option-text {
          font-size: 1.8rem;
          font-weight: bold;
          text-align: center;
        }

        @keyframes correctPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        @keyframes wrongShake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }

        .mcq-option.correct {
          animation: correctPulse 0.6s ease;
          background: rgba(62, 255, 162, 0.3) !important;
          border-color: #3effa2 !important;
        }

        .mcq-option.wrong {
          animation: wrongShake 0.6s ease;
          background: rgba(255, 62, 62, 0.3) !important;
          border-color: #ff3e3e !important;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .mcq-container {
            padding: 1rem;
          }

          .question-text {
            font-size: 3rem;
          }

          .mcq-options-grid {
            gap: 1rem;
          }

          .mcq-option {
            min-height: 120px;
            padding: 1.5rem;
          }

          .option-text {
            font-size: 1.4rem;
          }
        }

        @media (max-width: 480px) {
          .mcq-options-grid {
            grid-template-columns: 1fr;
          }

          .question-text {
            font-size: 2.5rem;
          }

          .mcq-option {
            min-height: 100px;
          }

          .option-text {
            font-size: 1.2rem;
          }
        }
      `}</style>
        </div>
    );
}
