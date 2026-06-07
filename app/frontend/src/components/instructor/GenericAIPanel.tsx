import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, CheckCircle, ChevronDown, Copy, Cpu, Send, Sparkles, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { ChatMessage, ShortcutAction } from './questionCreationTypes'
import { ScrollArea } from '../ui/scroll-area'

export type GenericAIPanelProps = {
    messages: ChatMessage[]
    isTyping: boolean
    quickActions: ShortcutAction[]
    onSendMessage: (message: string) => void
    onCollapse: () => void
    onProviderChange?: (providerId: string) => void
}

type LLMProvider = {
    id: string
    label: string
    model: string
    color: string
}

const llmProviders: LLMProvider[] = [
    {
        id: 'claude',
        label: 'Claude',
        model: 'claude-sonnet-4-6',
        color: '#c084fc',
    },
    {
        id: 'gpt4o',
        label: 'GPT-4o',
        model: 'gpt-4o',
        color: '#10b981',
    },
    {
        id: 'gemini',
        label: 'Gemini',
        model: 'gemini-2.0-flash',
        color: '#3b82f6',
    },
    {
        id: 'ollama',
        label: 'Llama 3.3',
        model: 'llama-3.3-70b',
        color: '#f97316',
    },
    {
        id: 'grok',
        label: 'Grok 3',
        model: 'grok-3',
        color: '#06b6d4',
    },
]

export function GenericAIPanel({
    messages,
    isTyping,
    quickActions,
    onSendMessage,
    onCollapse,
    onProviderChange,
}: GenericAIPanelProps) {
    const [selectedProvider, setSelectedProvider] = useState<LLMProvider>(
        () => llmProviders.find((provider) => provider.id === 'gemini') ?? llmProviders[0]
    )
    const [isProviderOpen, setIsProviderOpen] = useState(false)
    const [inputMessage, setInputMessage] = useState('')
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        onProviderChange?.(selectedProvider.id)
    }, [selectedProvider.id, onProviderChange])

    useEffect(() => {
        if (!isProviderOpen) return
        const close = () => setIsProviderOpen(false)
        document.addEventListener('click', close, { capture: true })
        return () => document.removeEventListener('click', close, { capture: true })
    }, [isProviderOpen])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    const handleCopy = (content: string, id: string) => {
        navigator.clipboard.writeText(content)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const handleSendMessage = () => {
        const messageContent = inputMessage.trim()
        if (!messageContent) return
        onSendMessage(messageContent)
        setInputMessage('')
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            handleSendMessage()
        }
    }

    return (
        <div className="h-full flex flex-col bg-background">
            <div className="px-4 py-2 border-b border-border bg-(--slate-gray)/30 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                    <Sparkles className="w-3.5 h-3.5 text-(--electric-purple) shrink-0" />
                    <span className="text-sm font-semibold text-foreground shrink-0">AI Assistant</span>
                    <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium shrink-0">
                        Online
                    </span>
                    <div className="relative ml-1">
                        <button
                            onClick={() => setIsProviderOpen((value) => !value)}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-(--charcoal) border border-border hover:border-(--electric-purple)/50 transition-colors text-xs"
                        >
                            <Cpu className="w-3 h-3" style={{ color: selectedProvider.color }} />
                            <span className="text-foreground font-medium">{selectedProvider.label}</span>
                            <span className="text-muted-foreground hidden sm:inline truncate max-w-22.5">
                                {selectedProvider.model}
                            </span>
                            <ChevronDown className="w-3 h-3 text-muted-foreground" />
                        </button>
                        <AnimatePresence>
                            {isProviderOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                                    transition={{ duration: 0.12 }}
                                    className="absolute top-full left-0 mt-1 z-50 w-52 rounded-lg border border-border bg-(--charcoal) shadow-xl overflow-hidden"
                                >
                                    {llmProviders.map((provider) => (
                                        <button
                                            key={provider.id}
                                            onClick={() => {
                                                setSelectedProvider(provider)
                                                setIsProviderOpen(false)
                                            }}
                                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-(--slate-gray) transition-colors ${selectedProvider.id === provider.id ? 'bg-(--slate-gray)/60' : ''
                                                }`}
                                        >
                                            <span
                                                className="w-2 h-2 rounded-full shrink-0"
                                                style={{ background: provider.color }}
                                            />
                                            <span className="text-xs font-medium text-foreground">
                                                {provider.label}
                                            </span>
                                            <span className="text-xs text-muted-foreground ml-auto truncate">
                                                {provider.model}
                                            </span>
                                            {selectedProvider.id === provider.id && (
                                                <CheckCircle className="w-3 h-3 shrink-0" style={{ color: provider.color }} />
                                            )}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onCollapse}
                        className="p-1.5 rounded-md hover:bg-(--slate-gray) transition-colors"
                        title="Close"
                    >
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                </div>
            </div>

            <div className="px-4 py-3 border-b border-border bg-(--charcoal)/30">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((button) => (
                        <motion.button
                            key={button.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => button.action(selectedProvider.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-linear-to-r ${button.color} text-white text-xs font-medium shadow-md hover:shadow-lg transition-all`}
                        >
                            <button.icon className="w-3.5 h-3.5" />
                            <span className="flex-1 text-left truncate">{button.label}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            <ScrollArea className="min-h-0 flex-1">
                <div className="p-4 space-y-4">
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                                    ? 'bg-(--electric-purple) text-white'
                                    : 'bg-(--charcoal) text-foreground border border-border'
                                    }`}
                            >
                                <div className="flex items-start gap-2">
                                    <div className="flex-1">
                                        <ReactMarkdown
                                            components={{
                                                p: ({ children }) => (
                                                    <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>
                                                ),
                                                code({ className, children, ...props }) {
                                                    const isInline = !className
                                                    return isInline ? (
                                                        <code
                                                            className="bg-black/20 px-1.5 py-0.5 rounded text-xs"
                                                            {...props}
                                                        >
                                                            {children}
                                                        </code>
                                                    ) : (
                                                        <code
                                                            className="block bg-black/20 p-2 rounded text-xs my-2"
                                                            {...props}
                                                        >
                                                            {children}
                                                        </code>
                                                    )
                                                },
                                                ul: ({ children }) => (
                                                    <ul className="list-disc list-inside text-sm space-y-1 mb-2">
                                                        {children}
                                                    </ul>
                                                ),
                                                strong: ({ children }) => (
                                                    <strong className="font-semibold">{children}</strong>
                                                ),
                                            }}
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                    {message.role === 'assistant' && (
                                        <button
                                            onClick={() => handleCopy(message.content, message.id)}
                                            className="p-1 rounded hover:bg-(--slate-gray) transition-colors shrink-0"
                                        >
                                            {copiedId === message.id ? (
                                                <Check className="w-3 h-3 text-green-500" />
                                            ) : (
                                                <Copy className="w-3 h-3 text-muted-foreground" />
                                            )}
                                        </button>
                                    )}
                                </div>
                                <div
                                    className={`text-[10px] mt-1 ${message.role === 'user' ? 'text-white/60' : 'text-muted-foreground'
                                        }`}
                                >
                                    {message.timestamp.toLocaleTimeString()}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    <AnimatePresence>
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex justify-start"
                            >
                                <div className="bg-(--charcoal) border border-border rounded-lg p-3">
                                    <div className="flex gap-1">
                                        <motion.div
                                            animate={{ opacity: [0.4, 1, 0.4] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                            className="w-2 h-2 rounded-full bg-(--electric-purple)"
                                        />
                                        <motion.div
                                            animate={{ opacity: [0.4, 1, 0.4] }}
                                            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                            className="w-2 h-2 rounded-full bg-(--electric-purple)"
                                        />
                                        <motion.div
                                            animate={{ opacity: [0.4, 1, 0.4] }}
                                            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                                            className="w-2 h-2 rounded-full bg-(--electric-purple)"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-border bg-(--charcoal)/30">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask me anything about questions and test cases..."
                            className="w-full px-4 py-3 bg-(--slate-gray) border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-(--electric-purple) focus:ring-1 focus:ring-(--electric-purple) resize-none"
                            rows={3}
                        />
                        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                            Shift + Enter for new line
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim()}
                        className="px-4 py-3 bg-linear-to-r from-(--electric-purple) to-purple-600 text-white rounded-lg font-medium shadow-(--electric-purple-glow) hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        Send
                    </motion.button>
                </div>
            </div>
        </div>
    )
}
