/**
 * InstructorAIPanel Component
 * Main AI assistance panel with provider selector, quick actions, and chat
 */

import { useState, useCallback } from 'react'
import { AIChat } from './AIChat'
import { QuickActions } from './QuickActions'
import type { ChatMessage, QuestionFormData, QuickActionType, LLMProvider } from './types'
import styles from './InstructorAIPanel.module.css'

interface InstructorAIPanelProps {
    currentQuestion?: Partial<QuestionFormData>
    onOpenReferenceSelector: () => void
    referencedQuestions?: Array<{ id: number; title: string }>
}

export function InstructorAIPanel({
    currentQuestion,
    onOpenReferenceSelector,
    referencedQuestions = [],
}: InstructorAIPanelProps) {
    const [provider, setProvider] = useState<LLMProvider>(() => {
        const saved = localStorage.getItem('ai-provider')
        return (saved as LLMProvider) || 'gemini'
    })

    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [chatExpanded, setChatExpanded] = useState(true)
    const [actionsExpanded, setActionsExpanded] = useState(true)
    const [referencesExpanded, setReferencesExpanded] = useState(true)

    // Persist provider selection
    const handleProviderChange = (newProvider: LLMProvider) => {
        setProvider(newProvider)
        localStorage.setItem('ai-provider', newProvider)
    }

    // Handle quick action
    const handleQuickAction = useCallback(
        async (actionType: QuickActionType, context: any) => {
            setIsProcessing(true)

            try {
                // For now, we'll just log the action
                // In phase 4, we'll integrate with actual API endpoints
                console.log(`Quick action: ${actionType}`, context)

                // Add a user message to show what action was taken
                const userMessage: ChatMessage = {
                    id: Math.random().toString(36).substr(2, 9),
                    role: 'user',
                    content: `Please help me ${actionType.replace('-', ' ')}`,
                    timestamp: new Date(),
                }

                setMessages((prev) => [...prev, userMessage])

                // Simulate AI response
                const responses: Record<QuickActionType, string> = {
                    'variation':
                        'I can help you create a variation! To get started, I need to know:\n1. What specific aspect do you want to vary (difficulty, constraints, or wording)?\n2. Any additional constraints or requirements?',
                    'similar-style':
                        'Great! I can create a question with a similar approach but different topic. What new topic would you like to focus on?',
                    'from-constraints':
                        'I\'ll help generate a question from your constraints. Make sure you have:\n1. Clear constraints defined\n2. Topics selected\n3. Desired difficulty level',
                    'evaluate-question':
                        'Let me analyze your question for clarity, completeness, and testability. This will help ensure it\'s well-structured for students.',
                    'generate-test-cases':
                        'I\'ll generate comprehensive test cases covering:\n• Normal cases\n• Edge cases\n• Boundary conditions\n• Error scenarios',
                    'evaluate-test-cases':
                        'I\'ll check your test cases for coverage and edge case handling. This ensures they thoroughly test the solution.',
                }

                const assistantMessage: ChatMessage = {
                    id: Math.random().toString(36).substr(2, 9),
                    role: 'assistant',
                    content: responses[actionType],
                    timestamp: new Date(),
                }

                setMessages((prev) => [...prev, assistantMessage])
            } finally {
                setIsProcessing(false)
            }
        },
        []
    )

    const handleSendMessage = (message: ChatMessage) => {
        setMessages((prev) => [...prev, message])
    }

    const handleNewResponse = (response: string) => {
        // Could be used to automatically update question based on AI response
        console.log('AI response:', response)
    }

    return (
        <div className={styles.panelContainer}>
            {/* Header with provider selector */}
            <div className={styles.header}>
                <h2 className={styles.title}>AI Assistant</h2>
                <div className={styles.providerSelector}>
                    <label>Model:</label>
                    <select
                        value={provider}
                        onChange={(e) => handleProviderChange(e.target.value as LLMProvider)}
                        className={styles.select}
                    >
                        <option value="gemini">Gemini</option>
                        <option value="ollama">Ollama</option>
                    </select>
                </div>
            </div>

            {/* Collapsible sections */}
            <div className={styles.sectionsContainer}>
                {/* Quick Actions Section */}
                {actionsExpanded && (
                    <section className={styles.section}>
                        <button
                            className={styles.sectionHeader}
                            onClick={() => setActionsExpanded(!actionsExpanded)}
                            title="Click to collapse"
                        >
                            <span className={styles.toggleIcon}>▼</span>
                            <span>Quick Actions</span>
                        </button>
                        {actionsExpanded && (
                            <QuickActions
                                onAction={handleQuickAction}
                                currentQuestion={currentQuestion}
                                hasReferences={referencedQuestions.length > 0}
                                onOpenReferenceSelector={onOpenReferenceSelector}
                            />
                        )}
                    </section>
                )}

                {!actionsExpanded && (
                    <button
                        className={styles.sectionHeaderCollapsed}
                        onClick={() => setActionsExpanded(true)}
                        title="Click to expand"
                    >
                        <span className={styles.toggleIcon}>▶</span>
                        <span>Quick Actions</span>
                    </button>
                )}

                {/* References Section */}
                {referencedQuestions.length > 0 && (
                    <>
                        {referencesExpanded && (
                            <section className={styles.section}>
                                <button
                                    className={styles.sectionHeader}
                                    onClick={() => setReferencesExpanded(!referencesExpanded)}
                                    title="Click to collapse"
                                >
                                    <span className={styles.toggleIcon}>▼</span>
                                    <span>References ({referencedQuestions.length})</span>
                                </button>
                                {referencesExpanded && (
                                    <div className={styles.referencesList}>
                                        {referencedQuestions.map((q) => (
                                            <div
                                                key={q.id}
                                                className={styles.referenceItem}
                                                title={`#${q.id}: ${q.title}`}
                                            >
                                                <span className={styles.referenceBadge}>{q.id}</span>
                                                <span className={styles.referenceTitle}>{q.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {!referencesExpanded && (
                            <button
                                className={styles.sectionHeaderCollapsed}
                                onClick={() => setReferencesExpanded(true)}
                                title="Click to expand"
                            >
                                <span className={styles.toggleIcon}>▶</span>
                                <span>References ({referencedQuestions.length})</span>
                            </button>
                        )}
                    </>
                )}

                {/* Chat Section */}
                {chatExpanded && (
                    <section className={`${styles.section} ${styles.chatSection}`}>
                        <button
                            className={styles.sectionHeader}
                            onClick={() => setChatExpanded(!chatExpanded)}
                            title="Click to collapse"
                        >
                            <span className={styles.toggleIcon}>▼</span>
                            <span>Chat</span>
                        </button>
                        {chatExpanded && (
                            <AIChat
                                messages={messages}
                                isLoading={isProcessing}
                                onSendMessage={handleSendMessage}
                                onNewResponse={handleNewResponse}
                                currentQuestion={currentQuestion}
                                provider={provider}
                                referencedQuestions={referencedQuestions}
                            />
                        )}
                    </section>
                )}

                {!chatExpanded && (
                    <button
                        className={styles.sectionHeaderCollapsed}
                        onClick={() => setChatExpanded(true)}
                        title="Click to expand"
                    >
                        <span className={styles.toggleIcon}>▶</span>
                        <span>Chat</span>
                    </button>
                )}
            </div>
        </div>
    )
}
