"use client";

import { useState } from 'react';
import confetti from 'canvas-confetti';
import './MultipleChoiceQuestion.css';

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
    </div>
  );
}
