import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Difficulty, Subject } from '../types';
import { getQuestionByFilters } from '../constants';

export default function HomePage() {
    const navigate = useNavigate();
    const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
    const [subject, setSubject] = useState<Subject | ''>('');

    const handleGenerate = () => {
        const question = getQuestionByFilters(
            difficulty || undefined,
            subject || undefined
        );

        if (question) {
            navigate('/workspace', { state: { question } });
        }
    };

    const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
    const subjects: Subject[] = ['array', 'string', 'sorting', 'hash', 'graph'];

    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-ai-purple to-purple-400 bg-clip-text text-transparent">
                        AI Companion
                    </h1>
                    <p className="text-xl text-gray-400">
                        Learn Computer Science with AI-Powered Feedback
                    </p>
                </div>

                <div className="card space-y-8">
                    <div>
                        <h2 className="text-2xl font-semibold mb-6 text-dark-text">
                            Generate a Coding Challenge
                        </h2>
                        <p className="text-gray-400 mb-8">
                            Select your preferences to get a tailored programming question
                        </p>
                    </div>

                    {/* Difficulty Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-3 text-dark-text">
                            Difficulty Level
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                            {difficulties.map((diff) => (
                                <button
                                    key={diff}
                                    onClick={() => setDifficulty(diff)}
                                    className={`py-3 px-4 rounded-lg border-2 transition-all duration-200 font-medium capitalize ${difficulty === diff
                                        ? 'border-ai-purple bg-ai-purple/20 text-ai-purple'
                                        : 'border-gray-600 bg-dark-bg hover:border-gray-500 text-gray-300'
                                        }`}
                                >
                                    {diff}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Subject Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-3 text-dark-text">
                            Topic
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                            {subjects.map((subj) => (
                                <button
                                    key={subj}
                                    onClick={() => setSubject(subj)}
                                    className={`py-3 px-4 rounded-lg border-2 transition-all duration-200 font-medium capitalize ${subject === subj
                                        ? 'border-ai-purple bg-ai-purple/20 text-ai-purple'
                                        : 'border-gray-600 bg-dark-bg hover:border-gray-500 text-gray-300'
                                        }`}
                                >
                                    {subj}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={!difficulty || !subject}
                        className="w-full btn-primary text-lg py-4 mt-8 hover:shadow-lg hover:shadow-ai-purple/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        Generate Challenge
                    </button>

                    {/* Info */}
                    <div className="text-center text-sm text-gray-500 mt-4">
                        {difficulty || subject ? (
                            <p>
                                Generating a{' '}
                                <span className="text-ai-purple font-medium">
                                    {difficulty || 'random difficulty'}
                                </span>{' '}
                                {subject && (
                                    <>
                                        <span className="text-ai-purple font-medium">{subject}</span>{' '}
                                    </>
                                )}
                                challenge
                            </p>
                        ) : (
                            <p>Please select at least one filter to generate a challenge</p>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>Powered by Qwen 2.5 LLM • Built for CMPE 492</p>
                </div>
            </div>
        </div>
    );
}
