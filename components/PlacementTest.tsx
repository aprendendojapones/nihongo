"use client";

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ArrowRight, Trophy, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { JAPANESE_DATA } from '@/data/japanese';
import './placement.css';
import { useTranslation } from '@/components/TranslationContext';

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const QUESTIONS_PER_LEVEL = 10;
const PASSING_SCORE = 8; // 80%

export default function PlacementTest({ onComplete }: { onComplete: (level: string) => void }) {
    const { data: session } = useSession();
    const user = session?.user as any;
    const { t } = useTranslation();

    const [currentLevelIndex, setCurrentLevelIndex] = useState(0); // Start at N5 (index 0)
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [levelScore, setLevelScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [finalPlacement, setFinalPlacement] = useState('');
    const [loading, setLoading] = useState(true);
    const [showLevelResult, setShowLevelResult] = useState(false);
    const [levelResult, setLevelResult] = useState<{ passed: boolean, score: number, level: string } | null>(null);

    useEffect(() => {
        generateQuestionsForLevel(LEVELS[currentLevelIndex]);
    }, [currentLevelIndex]);

    const generateQuestionsForLevel = (level: string) => {
        setLoading(true);
        // Get data for the specific level (e.g., n5, n4)
        // Combine kanji and vocab for that level
        const levelKey = level.toLowerCase();
        // Check if specific level data exists, otherwise fallback to generic or empty
        let data: any[] = [];

        if (JAPANESE_DATA[levelKey as keyof typeof JAPANESE_DATA]) {
            data = JAPANESE_DATA[levelKey as keyof typeof JAPANESE_DATA];
        } else {
            // Fallback strategy if direct key doesn't exist (though it should based on data file)
            // Try to combine kanji and vocab manually if needed, but JAPANESE_DATA structure seems to have keys like 'n5', 'n4'
            data = JAPANESE_DATA.n5; // Default to N5 if something goes wrong
        }

        if (!data || data.length === 0) {
            console.error(`No data found for level ${level}`);
            data = JAPANESE_DATA.n5;
        }

        // Shuffle and pick QUESTIONS_PER_LEVEL
        // Ensure we have enough questions, otherwise take all
        const count = Math.min(data.length, QUESTIONS_PER_LEVEL);
        const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, count);

        const newQuestions = shuffled.map(item => {
            const correctMeaning = item.meaning;
            // Get distractors from the SAME level to make it fair but challenging
            const otherMeanings = data
                .filter(d => d.id !== item.id)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(d => d.meaning);

            const options = [correctMeaning, ...otherMeanings].sort(() => Math.random() - 0.5);

            return {
                id: item.id,
                text: item.type === 'kanji' ? `Qual o significado de ${item.char}?` : `O que significa "${item.char}"?`,
                char: item.char,
                romaji: item.romaji,
                options,
                correct: options.indexOf(correctMeaning),
                level
            };
        });

        setQuestions(newQuestions);
        setCurrentQuestionIndex(0);
        setAnswers([]); // Reset answers for new level
        setLevelScore(0);
        setShowLevelResult(false);
        setLoading(false);
    };

    const handleAnswer = (index: number) => {
        const isCorrect = index === questions[currentQuestionIndex].correct;
        const newScore = isCorrect ? levelScore + 1 : levelScore;
        setLevelScore(newScore);

        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = index;
        setAnswers(newAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(i => i + 1);
        } else {
            // Level finished
            evaluateLevel(newScore);
        }
    };

    const evaluateLevel = (score: number) => {
        const currentLevel = LEVELS[currentLevelIndex];
        const passed = score >= PASSING_SCORE;

        setLevelResult({
            passed,
            score,
            level: currentLevel
        });
        setShowLevelResult(true);
    };

    const handleNextLevel = () => {
        if (levelResult?.passed) {
            // Passed! Move to next level if available
            if (currentLevelIndex < LEVELS.length - 1) {
                setCurrentLevelIndex(prev => prev + 1);
            } else {
                // Passed N1!
                finishTest('N1');
            }
        } else {
            // Failed. Placement is the PREVIOUS level (or N5 if failed N5)
            // Actually, if they fail N5, maybe 'Basics'? But for now let's say N5 is the floor.
            // Or if they passed N5 but failed N4, they are N5.
            const placement = currentLevelIndex === 0 ? 'N5' : LEVELS[currentLevelIndex - 1];
            finishTest(placement);
        }
    };

    const finishTest = async (level: string) => {
        setFinalPlacement(level);
        setIsFinished(true);

        if (user) {
            try {
                const { error } = await supabase.from('profiles').update({ level }).eq('id', user.id);
                if (error) throw error;
            } catch (err) {
                console.error("Error updating level:", err);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                <p className="text-gray-400">{t('loading_questions')}...</p>
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className="glass-card p-8 text-center max-w-2xl mx-auto animate-fade-in">
                <Trophy size={64} className="mx-auto text-yellow-400 mb-6" />
                <h2 className="text-3xl font-bold mb-4">{t('test_completed')}</h2>
                <p className="text-xl text-gray-300 mb-8">
                    {t('your_level_is')}: <span className="text-4xl font-bold text-blue-400 block mt-4">{finalPlacement}</span>
                </p>
                <p className="text-gray-400 mb-8">
                    {t('level_assigned_desc')}
                </p>
                <button
                    onClick={() => onComplete(finalPlacement)}
                    className="btn-primary w-full py-4 text-lg"
                >
                    {t('continue_to_dashboard')} <ArrowRight className="ml-2" />
                </button>
            </div>
        );
    }

    if (showLevelResult) {
        return (
            <div className="glass-card p-8 text-center max-w-2xl mx-auto animate-fade-in">
                {levelResult?.passed ? (
                    <>
                        <CheckCircle2 size={64} className="mx-auto text-green-500 mb-6" />
                        <h2 className="text-2xl font-bold mb-2">{t('level_passed', { level: levelResult.level || '?' })}</h2>
                        <p className="text-gray-300 mb-6">
                            {t('score')}: {levelResult.score}/{questions.length}
                        </p>
                        <p className="text-gray-400 mb-8">{t('moving_to_next_level')}</p>
                        <button onClick={handleNextLevel} className="btn-primary w-full">
                            {t('next_level')} <ArrowRight className="ml-2" />
                        </button>
                    </>
                ) : (
                    <>
                        <XCircle size={64} className="mx-auto text-red-500 mb-6" />
                        <h2 className="text-2xl font-bold mb-2">{t('level_failed', { level: levelResult?.level || '?' })}</h2>
                        <p className="text-gray-300 mb-6">
                            {t('score')}: {levelResult?.score}/{questions.length}
                        </p>
                        <p className="text-gray-400 mb-8">{t('placement_determined')}</p>
                        <button onClick={handleNextLevel} className="btn-primary w-full">
                            {t('see_result')} <ArrowRight className="ml-2" />
                        </button>
                    </>
                )}
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="glass-card p-6 max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-medium text-gray-400">
                    {t('level')} {LEVELS[currentLevelIndex]}
                </span>
                <span className="text-sm font-medium text-gray-400">
                    {t('question')} {currentQuestionIndex + 1}/{questions.length}
                </span>
            </div>

            <div className="mb-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
                />
            </div>

            <div className="py-8 text-center">
                <h2 className="text-2xl font-bold mb-4">{currentQuestion.text}</h2>
                <div className="text-6xl font-bold mb-2 text-white">{currentQuestion.char}</div>
                {/* <div className="text-sm text-gray-500 mb-8">{currentQuestion.romaji}</div> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {currentQuestion.options.map((option: string, idx: number) => (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 transition-all text-left"
                    >
                        <span className="inline-block w-6 h-6 rounded-full bg-white/10 text-center text-sm leading-6 mr-3">
                            {String.fromCharCode(65 + idx)}
                        </span>
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
}
