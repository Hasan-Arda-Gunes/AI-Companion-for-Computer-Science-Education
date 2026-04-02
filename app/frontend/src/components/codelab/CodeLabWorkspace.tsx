import { useEffect, useRef, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { CodeLabTopBar } from './CodeLabTopBar'
import { ConsolePanel } from './ConsolePanel'
import { EditorPanel } from './EditorPanel'
import { MentorPanel } from './MentorPanel'
import { QuestionPanel } from './QuestionPanel'
import type { CodeEditorData, CodeLabHeaderData, ConsoleData, EvolutionStage, MentorData, QuestionData } from './types'

type CodeLabWorkspaceProps = {
    title: string
    stages: EvolutionStage[]
    headerData: CodeLabHeaderData
    question: QuestionData
    editor: CodeEditorData
    consoleData: ConsoleData
    mentor: MentorData
    mentorOpen: boolean
    onToggleMentor: () => void
    onSignIn: () => void
    onSignUp: () => void
    onLogout: () => void
    isRunning?: boolean
    onRunCode?: (code: string, languageId: string) => void
    onEditorCodeChange?: (code: string, languageId: string) => void
    onClearConsole?: () => void
    onMentorRequestHint?: () => Promise<string>
    onMentorChat?: (message: string) => Promise<string>
    onMentorExplainError?: () => Promise<string>
}

export function CodeLabWorkspace({
    title,
    stages,
    headerData,
    question,
    editor,
    consoleData,
    mentor,
    mentorOpen,
    onToggleMentor,
    onSignIn,
    onSignUp,
    onLogout,
    isRunning = false,
    onRunCode,
    onEditorCodeChange,
    onClearConsole,
    onMentorRequestHint,
    onMentorChat,
    onMentorExplainError,
}: CodeLabWorkspaceProps) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const centerRef = useRef<HTMLDivElement | null>(null)
    const [leftWidth, setLeftWidth] = useState(34)
    const [rightWidth, setRightWidth] = useState(28)
    const [editorHeight, setEditorHeight] = useState(68)
    const [consoleCollapsed, setConsoleCollapsed] = useState(false)
    const [activeHandle, setActiveHandle] = useState<'left' | 'right' | 'console' | null>(null)

    useEffect(() => {
        if (!activeHandle) {
            return
        }

        const handleMouseMove = (event: MouseEvent) => {
            if (!containerRef.current) {
                return
            }

            const rect = containerRef.current.getBoundingClientRect()
            const totalWidth = rect.width
            if (totalWidth <= 0) {
                return
            }

            const minLeft = 22
            const minCenter = 24
            const minRight = 20
            const maxRight = 40

            if (activeHandle === 'left') {
                const pointerPercent = ((event.clientX - rect.left) / totalWidth) * 100
                const reservedRight = mentorOpen ? rightWidth : 0
                const maxLeft = 100 - reservedRight - minCenter
                const nextLeft = Math.max(minLeft, Math.min(maxLeft, pointerPercent))
                setLeftWidth(nextLeft)
            }

            if (activeHandle === 'right' && mentorOpen) {
                const pointerPercentFromLeft = ((event.clientX - rect.left) / totalWidth) * 100
                const pointerRight = 100 - pointerPercentFromLeft
                const maxRightByCenter = 100 - leftWidth - minCenter
                const boundedRight = Math.max(minRight, Math.min(Math.min(maxRight, maxRightByCenter), pointerRight))
                setRightWidth(boundedRight)
            }

            if (activeHandle === 'console' && !consoleCollapsed && centerRef.current) {
                const centerRect = centerRef.current.getBoundingClientRect()
                const centerHeight = centerRect.height

                if (centerHeight > 0) {
                    const pointerPercent = ((event.clientY - centerRect.top) / centerHeight) * 100
                    const minEditor = 30
                    const maxEditor = 82
                    const nextEditorHeight = Math.max(minEditor, Math.min(maxEditor, pointerPercent))
                    setEditorHeight(nextEditorHeight)
                }
            }
        }

        const handleMouseUp = () => setActiveHandle(null)

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [activeHandle, consoleCollapsed, leftWidth, mentorOpen, rightWidth])

    const centerWidth = mentorOpen ? Math.max(24, 100 - leftWidth - rightWidth) : Math.max(24, 100 - leftWidth)

    return (
        <div className="grid h-full min-h-0 grid-rows-[auto_1fr] bg-background">
            <CodeLabTopBar
                title={title}
                stages={stages}
                headerData={headerData}
                onSignIn={onSignIn}
                onSignUp={onSignUp}
                onLogout={onLogout}
            />

            <div className="relative min-h-0 overflow-hidden">
                <div className="flex h-full min-h-0 flex-col overflow-y-auto lg:hidden">
                    <div className="shrink-0">
                        <QuestionPanel question={question} useInternalScroll={false} />
                    </div>
                    <div className="h-[78vh] min-h-120 shrink-0 px-3 py-2">
                        <div className="h-full overflow-hidden rounded-xl border border-border">
                            <EditorPanel editor={editor} isRunning={isRunning} onRunCode={onRunCode} onCodeChange={onEditorCodeChange} />
                        </div>
                    </div>
                    <div className="shrink-0">
                        <ConsolePanel consoleData={consoleData} onClear={onClearConsole} useInternalScroll={false} />
                    </div>
                </div>

                {mentorOpen ? (
                    <>
                        <button
                            type="button"
                            aria-label="Close AI Mentor"
                            onClick={onToggleMentor}
                            className="absolute inset-0 z-30 bg-black/35 lg:hidden"
                        />

                        <div className="absolute inset-y-0 right-0 z-40 w-[min(88vw,22rem)] border-l border-border shadow-2xl lg:hidden">
                            <MentorPanel mentor={mentor} isOpen={mentorOpen} onToggle={onToggleMentor} />
                        </div>
                    </>
                ) : null}

                <div ref={containerRef} className="hidden h-full min-h-0 overflow-hidden lg:flex">
                    <div className="h-full min-w-0" style={{ width: `${leftWidth}%` }}>
                        <QuestionPanel question={question} />
                    </div>

                    <button
                        type="button"
                        aria-label="Resize question panel"
                        onMouseDown={() => setActiveHandle('left')}
                        className="w-1.5 shrink-0 cursor-col-resize bg-border/50 transition-colors hover:bg-primary/60"
                    />

                    <div ref={centerRef} className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden" style={{ width: `${centerWidth}%` }}>
                        <div className="min-h-0" style={{ height: consoleCollapsed ? '100%' : `${editorHeight}%` }}>
                            <EditorPanel editor={editor} isRunning={isRunning} onRunCode={onRunCode} onCodeChange={onEditorCodeChange} />
                        </div>

                        {consoleCollapsed ? (
                            <div className="shrink-0 border-t border-border bg-secondary/30 px-3 py-2">
                                <button
                                    type="button"
                                    onClick={() => setConsoleCollapsed(false)}
                                    className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                                >
                                    Show Console
                                </button>
                                <MentorPanel
                                    mentor={mentor}
                                    isOpen={mentorOpen}
                                    onToggle={onToggleMentor}
                                    onRequestHint={onMentorRequestHint}
                                    onSendMessage={onMentorChat}
                                    onExplainError={onMentorExplainError}
                                />
                            </div>
                        ) : (
                            <>
                                <div
                                    role="separator"
                                    aria-label="Resize editor and console panels"
                                    onMouseDown={() => setActiveHandle('console')}
                                    className="relative h-2 shrink-0 cursor-row-resize bg-border/50 transition-colors hover:bg-primary/60"
                                >
                                    <button
                                        type="button"
                                        onMouseDown={(event) => event.stopPropagation()}
                                        onClick={() => setConsoleCollapsed(true)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-border bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:border-primary/40 hover:text-primary"
                                    >
                                        Hide Console
                                    </button>
                                </div>
                                <div className="min-h-0" style={{ height: `${100 - editorHeight}%` }}>
                                    <ConsolePanel consoleData={consoleData} onClear={onClearConsole} />
                                </div>
                            </>
                        )}
                    </div>

                    {mentorOpen ? (
                        <>
                            <button
                                type="button"
                                aria-label="Resize mentor panel"
                                onMouseDown={() => setActiveHandle('right')}
                                className="w-1.5 shrink-0 cursor-col-resize bg-border/50 transition-colors hover:bg-primary/60"
                            />

                            <div className="h-full min-w-0" style={{ width: `${rightWidth}%` }}>
                                <MentorPanel
                                    mentor={mentor}
                                    isOpen={mentorOpen}
                                    onToggle={onToggleMentor}
                                    onRequestHint={onMentorRequestHint}
                                    onSendMessage={onMentorChat}
                                    onExplainError={onMentorExplainError}
                                />
                            </div>
                        </>
                    ) : null}
                </div>

                <button
                    type="button"
                    onClick={onToggleMentor}
                    className="absolute bottom-4 right-4 z-50 flex size-12 items-center justify-center rounded-full border border-primary/30 bg-linear-to-br from-primary to-purple-600 text-primary-foreground shadow-xl shadow-primary/25 lg:hidden"
                    aria-label={mentorOpen ? 'Close AI Mentor' : 'Open AI Mentor'}
                >
                    <Sparkles className="size-5" />
                </button>

                {!mentorOpen ? (
                    <button
                        type="button"
                        onClick={onToggleMentor}
                        className="absolute right-0 top-1/2 z-30 hidden -translate-y-1/2 rounded-l-lg border border-r-0 border-primary/30 bg-linear-to-b from-primary to-purple-600 px-2 py-4 text-primary-foreground shadow-xl lg:block"
                        aria-label="Open AI Mentor"
                    >
                        <span className="flex items-center gap-1 [writing-mode:vertical-rl]">
                            <Sparkles className="size-3" />
                            <span className="text-xs font-semibold tracking-[0.08em]">AI MENTOR</span>
                        </span>
                    </button>
                ) : null}
            </div>
        </div>
    )
}
