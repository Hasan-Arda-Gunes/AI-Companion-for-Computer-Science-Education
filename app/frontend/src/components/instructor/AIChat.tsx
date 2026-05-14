/**
 * AIChat Component
 * Displays chat messages and handles message input for AI assistance
 */

import { useEffect, useRef, useState } from 'react'
import { instructorChat } from '../../features/ai/api/instructorAiApi'
import type { InstructorChatRequest } from '../../features/ai/types'
import type { ChatMessage, QuestionFormData } from './types'
import styles from './AIChat.module.css'

interface AIChatProps {
    messages: ChatMessage[]
    isLoading: boolean
    onSendMessage: (message: ChatMessage) => void
    onNewResponse: (response: string) => void
    currentQuestion?: Partial<QuestionFormData>
    provider: 'gemini' | 'ollama'
    referencedQuestions?: Array<{ id: number; title: string }>
}

export function AIChat({
    messages,
    isLoading,
    onSendMessage,
    onNewResponse,
    currentQuestion,
    provider,
    referencedQuestions,
}: AIChatProps) {
    const [inputValue, setInputValue] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!inputValue.trim() || isProcessing) return

        // Add user message
        const userMessage: ChatMessage = {
            id: Math.random().toString(36).substr(2, 9),
            role: 'user',
            content: inputValue,
            timestamp: new Date(),
        }

        onSendMessage(userMessage)
        setInputValue('')
        setIsProcessing(true)

        try {
            // Send to AI
            const payload: InstructorChatRequest = {
                message: inputValue,
                provider: provider as any,
                context: {
                    current_question: currentQuestion
                        ? {
                              title: currentQuestion.title,
                              description: currentQuestion.prompt,
                          }
                        : undefined,
                    referenced_questions: referencedQuestions,
                    test_cases: currentQuestion?.testCases?.map((tc) => ({
                        input: tc.input,
                        expected_output: tc.expectedOutput,
                    })),
                },
            }

            const response = await instructorChat(payload)

            // Add assistant response
            const assistantMessage: ChatMessage = {
                id: Math.random().toString(36).substr(2, 9),
                role: 'assistant',
                content: response.response,
                timestamp: new Date(),
            }

            onSendMessage(assistantMessage)
            onNewResponse(response.response)
        } catch (error) {
            const errorMessage: ChatMessage = {
                id: Math.random().toString(36).substr(2, 9),
                role: 'assistant',
                content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
                timestamp: new Date(),
            }
            onSendMessage(errorMessage)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className={styles.chatContainer}>
            <div className={styles.messagesContainer}>
                {messages.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>👋 Start chatting with AI to get help creating your question</p>
                        <ul>
                            <li>Ask for help improving your question</li>
                            <li>Get suggestions for edge cases</li>
                            <li>Refine constraints and examples</li>
                        </ul>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`${styles.message} ${styles[message.role]}`}
                        >
                            <div className={styles.messageBubble}>{message.content}</div>
                            <div className={styles.timestamp}>
                                {message.timestamp.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </div>
                        </div>
                    ))
                )}

                {isLoading && (
                    <div className={`${styles.message} ${styles.assistant}`}>
                        <div className={styles.messageBubble}>
                            <div className={styles.typingIndicator}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className={styles.inputForm}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask AI for help..."
                    disabled={isProcessing || isLoading}
                    className={styles.input}
                />
                <button
                    type="submit"
                    disabled={!inputValue.trim() || isProcessing || isLoading}
                    className={styles.sendButton}
                    title="Send message"
                >
                    ✓
                </button>
            </form>
        </div>
    )
}
