import { useMemo, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Send, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import type { MentorData } from './types'
import { ScrollArea } from '../ui/scroll-area'
import type { LLMProvider } from '../../features/ai/types'

type MentorPanelProps = {
    mentor: MentorData
    isOpen: boolean
    onToggle: () => void
    onRequestHint?: (provider: LLMProvider) => Promise<string>
    onSendMessage?: (message: string, provider: LLMProvider) => Promise<string>
    onExplainError?: (provider: LLMProvider) => Promise<string>
}

export function MentorPanel({ mentor, isOpen, onToggle, onRequestHint, onSendMessage, onExplainError }: MentorPanelProps) {
    const [messages, setMessages] = useState(mentor.initialMessages)
    const [input, setInput] = useState('')
    const [isActionLoading, setIsActionLoading] = useState(false)
    const [toolsOpen, setToolsOpen] = useState(true)
    const [selectedProvider, setSelectedProvider] = useState<LLMProvider>('gemini')

    const hintSuggestions = useMemo(
        () =>
            mentor.hintSuggestions.length > 0
                ? mentor.hintSuggestions
                : ['What data structure could help with quick lookups?'],
        [mentor.hintSuggestions],
    )

    const responseSuggestions = useMemo(
        () =>
            mentor.responseSuggestions.length > 0
                ? mentor.responseSuggestions
                : ['Interesting approach. Can you analyze its time complexity?'],
        [mentor.responseSuggestions],
    )

    const pushAssistantMessage = (content: string) => {
        setMessages((prev) => [
            ...prev,
            {
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                role: 'assistant',
                content,
            },
        ])
    }

    const handleRequestHint = async () => {
        setIsActionLoading(true)
        try {
            if (onRequestHint) {
                const hint = await onRequestHint(selectedProvider)
                pushAssistantMessage(hint)
            } else {
                const randomHint = hintSuggestions[Math.floor(Math.random() * hintSuggestions.length)]
                pushAssistantMessage(randomHint)
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch hint'
            pushAssistantMessage(message)
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleExplainError = async () => {
        setIsActionLoading(true)
        try {
            if (onExplainError) {
                const explanation = await onExplainError(selectedProvider)
                pushAssistantMessage(explanation)
            } else {
                pushAssistantMessage('No error found to explain yet.')
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to explain error'
            pushAssistantMessage(message)
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleSend = async () => {
        if (!input.trim()) {
            return
        }

        const userMessage = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            role: 'user' as const,
            content: input,
        }

        setMessages((prev) => [...prev, userMessage])
        setInput('')
        setIsActionLoading(true)

        try {
            if (onSendMessage) {
                const response = await onSendMessage(userMessage.content, selectedProvider)
                pushAssistantMessage(response)
            } else {
                const randomResponse = responseSuggestions[Math.floor(Math.random() * responseSuggestions.length)]
                pushAssistantMessage(randomResponse)
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to send chat message'
            pushAssistantMessage(message)
        } finally {
            setIsActionLoading(false)
        }
    }

    return (
        <aside
            className="relative flex h-full min-h-0 flex-col overflow-hidden border-l border-border bg-card"
            style={{ boxShadow: 'inset 0 0 60px rgba(168, 85, 247, 0.08)' }}
        >
            <div
                className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)' }}
            />

            <div className="relative z-10 border-b border-border bg-card px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-linear-to-br from-primary to-purple-600 shadow-lg shadow-primary/20">
                            <Sparkles className="size-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-foreground">{mentor.title}</h3>
                            <p className="text-xs text-muted-foreground">{mentor.subtitle}</p>
                        </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Model</span>
                        <select
                            value={selectedProvider}
                            onChange={(event) => setSelectedProvider(event.target.value as LLMProvider)}
                            className="rounded-md border border-border bg-secondary px-2 py-1 text-xs text-foreground"
                        >
                            <option value="gemini">Gemini</option>
                            <option value="ollama">Ollama</option>
                        </select>
                    </label>

                    <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.94 }}
                        type="button"
                        onClick={onToggle}
                        className="rounded-lg border border-border bg-secondary p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                        title={isOpen ? 'Collapse AI Mentor' : 'Expand AI Mentor'}
                    >
                        {isOpen ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
                    </motion.button>
                </div>
            </div>

            {isOpen ? (
                <>
                    <ScrollArea className="relative z-10 min-h-0 flex-1">
                        <div className="space-y-3 p-4">
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                                >
                                    <div
                                        className={[
                                            'max-w-[85%] rounded-lg p-3',
                                            message.role === 'user'
                                                ? 'bg-secondary text-foreground'
                                                : 'border border-primary/20 bg-linear-to-br from-primary/10 to-purple-600/10 text-foreground',
                                        ].join(' ')}
                                    >
                                        <p className="text-sm leading-6">{message.content}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </ScrollArea>

                    <div className="relative z-10 space-y-3 border-t border-border bg-card p-4">
                        <div className="rounded-lg border border-border bg-secondary/20">
                            <button
                                type="button"
                                onClick={() => setToolsOpen((prev) => !prev)}
                                className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-foreground"
                            >
                                <span>AI Tools</span>
                                <ChevronDown className={['size-4 transition-transform', toolsOpen ? 'rotate-180' : ''].join(' ')} />
                            </button>

                            {toolsOpen ? (
                                <div className="space-y-2 border-t border-border p-3">
                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="button"
                                        disabled={isActionLoading}
                                        onClick={() => {
                                            void handleRequestHint()
                                        }}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-linear-to-r from-primary/20 to-purple-600/20 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <Sparkles className="size-4" />
                                        <span>{mentor.hintButtonLabel}</span>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="button"
                                        disabled={isActionLoading}
                                        onClick={() => {
                                            void handleExplainError()
                                        }}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Explain Error
                                    </motion.button>
                                </div>
                            ) : null}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        void handleSend()
                                    }
                                }}
                                placeholder={mentor.inputPlaceholder}
                                className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                            />

                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                type="button"
                                onClick={() => {
                                    void handleSend()
                                }}
                                disabled={isActionLoading}
                                className="rounded-lg bg-primary p-2.5 text-primary-foreground shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Send className="size-4" />
                            </motion.button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="relative z-10 grid flex-1 place-items-center p-4 text-center">
                    <button
                        type="button"
                        onClick={onToggle}
                        className="rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground"
                    >
                        Open AI Mentor
                    </button>
                </div>
            )}
        </aside>
    )
}
