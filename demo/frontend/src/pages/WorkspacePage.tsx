import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import type { Question, ChatMessage } from '../types';
import { analyzeCode, sendChatMessage, checkApiHealth } from '../api';

export default function WorkspacePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const question = location.state?.question as Question | undefined;

    const [code, setCode] = useState(question?.starterCode || '');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState('');
    const [chatInput, setChatInput] = useState('');
    const [apiConnected, setApiConnected] = useState<boolean | null>(null);
    const [showTextareaScroll, setShowTextareaScroll] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const streamingMessageRef = useRef('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!question) {
            navigate('/');
        }
    }, [question, navigate]);

    useEffect(() => {
        // Check API health on mount
        checkApiHealth().then(setApiConnected);
    }, []);

    useEffect(() => {
        // Auto-scroll to bottom when messages change
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingMessage]);

    useEffect(() => {
        // Auto-resize textarea
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const lineHeight = 24; // approximate line height
            const maxHeight = lineHeight * 5; // 5 lines max
            const newHeight = Math.min(textarea.scrollHeight, maxHeight);
            textarea.style.height = `${newHeight}px`;
            // Show scrollbar only when content exceeds max height
            setShowTextareaScroll(textarea.scrollHeight > maxHeight);
        }
    }, [chatInput]);

    if (!question) {
        return null;
    }

    const handleAnalyze = async () => {
        if (!code.trim()) return;

        setIsAnalyzing(true);
        setIsStreaming(true);
        streamingMessageRef.current = '';
        setStreamingMessage('');

        // Add user's code submission as a message
        const userMessage: ChatMessage = {
            role: 'user',
            content: `I'd like feedback on my solution:\n\`\`\`python\n${code}\n\`\`\``,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);

        // Mock delay for "Compiling..." state
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsAnalyzing(false);

        // Start streaming AI response
        analyzeCode(
            code,
            `${question.title}\n\n${question.description}`,
            (chunk) => {
                streamingMessageRef.current += chunk;
                setStreamingMessage(streamingMessageRef.current);
            },
            () => {
                // On complete
                setIsStreaming(false);
                const aiMessage: ChatMessage = {
                    role: 'assistant',
                    content: streamingMessageRef.current,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, aiMessage]);
                setStreamingMessage('');
                streamingMessageRef.current = '';
            },
            (error) => {
                // On error
                setIsStreaming(false);
                const errorMessage: ChatMessage = {
                    role: 'assistant',
                    content: `⚠️ Error connecting to AI: ${error.message}\n\nMake sure the Qwen model is running locally via Docker model runner at http://localhost:12434`,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, errorMessage]);
                setStreamingMessage('');
                streamingMessageRef.current = '';
            }
        );
    };

    const handleSendChat = async () => {
        if (!chatInput.trim()) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: chatInput,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        setChatInput('');

        setIsStreaming(true);
        streamingMessageRef.current = '';
        setStreamingMessage('');

        const apiMessages = messages.map(m => ({
            role: m.role,
            content: m.content,
        }));
        apiMessages.push({ role: 'user', content: chatInput });

        sendChatMessage(
            [
                {
                    role: 'system',
                    content: `You are a helpful AI tutor for computer science. The student is working on: ${question.title}. Be encouraging and use the Socratic method.`
                },
                ...apiMessages
            ],
            (chunk) => {
                streamingMessageRef.current += chunk;
                setStreamingMessage(streamingMessageRef.current);
            },
            () => {
                setIsStreaming(false);
                const aiMessage: ChatMessage = {
                    role: 'assistant',
                    content: streamingMessageRef.current,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, aiMessage]);
                setStreamingMessage('');
                streamingMessageRef.current = '';
            },
            (error) => {
                setIsStreaming(false);
                const errorMessage: ChatMessage = {
                    role: 'assistant',
                    content: `⚠️ Error: ${error.message}`,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, errorMessage]);
                setStreamingMessage('');
                streamingMessageRef.current = '';
            }
        );
    };

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'easy': return 'text-success-green';
            case 'medium': return 'text-yellow-400';
            case 'hard': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="h-screen flex flex-col bg-dark-bg">
            {/* Header */}
            <header className="bg-dark-surface border-b border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="text-gray-400 hover:text-dark-text transition-colors"
                        >
                            ← Back
                        </button>
                        <h1 className="text-xl font-semibold text-dark-text">
                            {question.title}
                        </h1>
                        <span className={`text-sm font-medium capitalize ${getDifficultyColor(question.difficulty)}`}>
                            {question.difficulty}
                        </span>
                        <span className="text-sm text-gray-400 capitalize">
                            • {question.subject}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-success-green' : apiConnected === false ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                            <span className="text-sm text-gray-400">
                                {apiConnected ? 'API Connected' : apiConnected === false ? 'API Disconnected' : 'Checking...'}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
                {/* Question Panel */}
                <div className="col-span-3 flex flex-col min-h-0">
                    <div className="card overflow-y-auto flex-1 custom-scrollbar">
                        <h2 className="text-lg font-semibold mb-4 text-dark-text">Problem Description</h2>
                        <div className="prose prose-invert prose-sm max-w-none">
                            <p className="text-gray-300 whitespace-pre-wrap">{question.description}</p>
                        </div>

                        {question.testCases.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-md font-semibold mb-3 text-dark-text">Test Cases</h3>
                                <div className="space-y-3">
                                    {question.testCases.map((tc, idx) => (
                                        <div key={idx} className="bg-dark-bg rounded p-3 border border-gray-700">
                                            <div className="text-xs font-medium text-gray-400 mb-1">
                                                Test Case {idx + 1}
                                                {tc.description && ` - ${tc.description}`}
                                            </div>
                                            <div className="font-mono text-sm">
                                                <div className="text-gray-400">Input: <span className="text-blue-400">{tc.input}</span></div>
                                                <div className="text-gray-400">Output: <span className="text-success-green">{tc.expectedOutput}</span></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Code Editor Panel */}
                <div className="col-span-5 flex flex-col min-h-0">
                    <div className="card flex flex-col flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-dark-text">Code Editor</h2>
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || isStreaming}
                                className={`btn-primary flex items-center gap-2 ${(isAnalyzing || isStreaming) ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <span className="animate-spin">⚙️</span>
                                        Compiling...
                                    </>
                                ) : isStreaming ? (
                                    <>
                                        <span className="animate-pulse">🤖</span>
                                        AI Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <span>🚀</span>
                                        Analyze & Evolve
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="flex-1 border border-gray-700 rounded-lg overflow-hidden">
                            <Editor
                                height="100%"
                                defaultLanguage="python"
                                value={code}
                                onChange={(value) => setCode(value || '')}
                                theme="vs-dark"
                                options={{
                                    fontSize: 14,
                                    fontFamily: 'JetBrains Mono, monospace',
                                    minimap: { enabled: false },
                                    padding: { top: 16, bottom: 16 },
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    tabSize: 2,
                                    wordWrap: 'on',
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* AI Chat Panel */}
                <div className="col-span-4 flex flex-col min-h-0">
                    <div className="card flex flex-col flex-1 overflow-hidden">
                        <h2 className="text-lg font-semibold mb-4 text-dark-text flex items-center gap-2">
                            <span className="text-ai-purple">🤖</span>
                            AI Mentor
                        </h2>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 min-h-0 custom-scrollbar">
                            {messages.length === 0 && !streamingMessage && (
                                <div className="text-center text-gray-500 mt-8">
                                    <p className="text-sm">Click "Analyze & Evolve" to get AI feedback</p>
                                    <p className="text-xs mt-2">Or ask questions anytime!</p>
                                </div>
                            )}

                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-lg p-3 ${msg.role === 'user'
                                            ? 'bg-ai-purple/20 border border-ai-purple/50 text-dark-text'
                                            : 'bg-dark-bg border border-gray-700 text-gray-300'
                                            }`}
                                    >
                                        <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {msg.timestamp.toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Streaming message */}
                            {streamingMessage && (
                                <div className="flex justify-start">
                                    <div className="max-w-[85%] rounded-lg p-3 bg-dark-bg border border-gray-700 text-gray-300">
                                        <div className="text-sm whitespace-pre-wrap">
                                            {streamingMessage}
                                            <span className="animate-pulse ml-1">▊</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div className="flex gap-2 items-end">
                            <textarea
                                ref={textareaRef}
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendChat();
                                    }
                                }}
                                placeholder="Ask the AI mentor... (Shift+Enter for new line)"
                                disabled={isStreaming}
                                rows={1}
                                className="flex-1 bg-dark-bg border border-gray-700 rounded-lg px-4 py-2 text-dark-text placeholder-gray-500 focus:outline-none focus:border-ai-purple disabled:opacity-50 resize-none custom-scrollbar"
                                style={{ minHeight: '40px', maxHeight: '120px', overflowY: showTextareaScroll ? 'auto' : 'hidden' }}
                            />
                            <button
                                onClick={handleSendChat}
                                disabled={isStreaming || !chatInput.trim()}
                                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
