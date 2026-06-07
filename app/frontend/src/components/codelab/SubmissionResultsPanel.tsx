import { useMemo, useState, type ReactNode } from 'react'
import { Bell, CheckCircle, Terminal, XCircle } from 'lucide-react'
import { motion } from 'motion/react'
import type { ConsoleData, ProblemTestCase, QuestionData } from './types'
import type { SubmissionDetails, SubmissionTestResult } from '../../features/submissions/types'
import { ConsolePanel } from './ConsolePanel'
import { ScrollArea } from '../ui/scroll-area'

type SubmissionResultsPanelProps = {
    question: QuestionData
    consoleData: ConsoleData
    latestSubmission: SubmissionDetails | null
    onClearConsole?: () => void
    useInternalScroll?: boolean
    showConsoleTab?: boolean
    isFeedbackDialogOpen?: boolean
    onOpenFeedbackDialog?: () => void
    onCloseFeedbackDialog?: () => void
}

type ResultsTab = 'cases' | 'results' | 'console'

export function SubmissionResultsPanel({
    question,
    consoleData,
    latestSubmission,
    onClearConsole,
    useInternalScroll = true,
    showConsoleTab = true,
    isFeedbackDialogOpen = false,
    onOpenFeedbackDialog,
    onCloseFeedbackDialog,
}: SubmissionResultsPanelProps) {
    const tabs = useMemo(() => (showConsoleTab ? (['cases', 'results', 'console'] as ResultsTab[]) : (['cases', 'results'] as ResultsTab[])), [showConsoleTab])
    const [activeTab, setActiveTab] = useState<ResultsTab>('cases')
    const resolvedActiveTab = tabs.includes(activeTab) ? activeTab : 'cases'

    return (
        <section className={[useInternalScroll ? 'flex h-full min-h-0 flex-col' : 'flex flex-col', 'relative border-t border-border bg-background'].join(' ')}>
            <div
                role="tablist"
                aria-label="Submission tabs"
                className="flex items-center gap-2 border-b border-border bg-card px-2 py-2"
                onKeyDown={(event) => {
                    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
                        return
                    }

                    event.preventDefault()
                    const currentIndex = tabs.indexOf(resolvedActiveTab)
                    const nextIndex = event.key === 'ArrowRight' ? (currentIndex + 1) % tabs.length : (currentIndex - 1 + tabs.length) % tabs.length
                    setActiveTab(tabs[nextIndex])
                }}
            >
                <TabButton
                    active={resolvedActiveTab === 'cases'}
                    icon={<CheckCircle className="size-4" />}
                    label="Test Cases"
                    onClick={() => setActiveTab('cases')}
                    tabId="cases"
                />
                <TabButton
                    active={resolvedActiveTab === 'results'}
                    icon={<Terminal className="size-4" />}
                    label="Test Results"
                    onClick={() => setActiveTab('results')}
                    tabId="results"
                />
                {showConsoleTab ? (
                    <TabButton
                        active={resolvedActiveTab === 'console'}
                        icon={<Terminal className="size-4" />}
                        label="Console"
                        onClick={() => setActiveTab('console')}
                        tabId="console"
                    />
                ) : null}
            </div>

            {useInternalScroll ? (
                <ScrollArea className="min-h-0 flex-1">
                    <div className="min-h-full p-4 pb-24 pr-20">
                        <PanelBody
                            question={question}
                            activeTab={resolvedActiveTab}
                            consoleData={consoleData}
                            latestSubmission={latestSubmission}
                            onClearConsole={onClearConsole}
                            showConsoleTab={showConsoleTab}
                        />
                    </div>
                </ScrollArea>
            ) : (
                <div className="p-4 pb-24 pr-20">
                    <PanelBody
                        question={question}
                        activeTab={resolvedActiveTab}
                        consoleData={consoleData}
                        latestSubmission={latestSubmission}
                        onClearConsole={onClearConsole}
                        showConsoleTab={showConsoleTab}
                    />
                </div>
            )}

            <NotificationButton
                hasSubmission={Boolean(latestSubmission)}
                onClick={() => {
                    if (latestSubmission && onOpenFeedbackDialog) {
                        onOpenFeedbackDialog()
                    }
                }}
            />

            {isFeedbackDialogOpen && latestSubmission && onCloseFeedbackDialog ? (
                <FeedbackDialog submission={latestSubmission} onClose={onCloseFeedbackDialog} />
            ) : null}
        </section>
    )
}

type TabButtonProps = {
    active: boolean
    icon: ReactNode
    label: string
    tabId: ResultsTab
    onClick: () => void
}

function TabButton({ active, icon, label, tabId, onClick }: TabButtonProps) {
    return (
        <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`results-tabpanel-${tabId}`}
            id={`results-tab-${tabId}`}
            tabIndex={active ? 0 : -1}
            onClick={onClick}
            className={[
                'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                active
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-transparent text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground',
            ].join(' ')}
        >
            {icon}
            <span>{label}</span>
        </motion.button>
    )
}

type PanelBodyProps = {
    question: QuestionData
    activeTab: ResultsTab
    consoleData: ConsoleData
    latestSubmission: SubmissionDetails | null
    onClearConsole?: () => void
    showConsoleTab: boolean
}

function PanelBody({ question, activeTab, consoleData, latestSubmission, onClearConsole, showConsoleTab }: PanelBodyProps) {
    if (activeTab === 'results') {
        return (
            <div role="tabpanel" id="results-tabpanel-results" aria-labelledby="results-tab-results">
                <TestResultsTab latestSubmission={latestSubmission} />
            </div>
        )
    }

    if (activeTab === 'console' && showConsoleTab) {
        return (
            <div role="tabpanel" id="results-tabpanel-console" aria-labelledby="results-tab-console">
                <ConsolePanel consoleData={consoleData} onClear={onClearConsole} useInternalScroll={false} embedded />
            </div>
        )
    }

    return (
        <div role="tabpanel" id="results-tabpanel-cases" aria-labelledby="results-tab-cases">
            <QuestionTestCasesTab question={question} />
        </div>
    )
}

type QuestionTestCasesTabProps = {
    question: QuestionData
}

function QuestionTestCasesTab({ question }: QuestionTestCasesTabProps) {
    const testCases = question.testCases ?? []

    if (testCases.length === 0) {
        return <EmptyState message="This question does not include test cases yet." />
    }

    return (
        <div className="space-y-4">
            {/* <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Question Test Cases</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">These are the test cases attached to the current question.</p>
            </div> */}

            <div className="space-y-3">
                {testCases.map((testCase) => (
                    <QuestionTestCaseRow key={testCase.id} testCase={testCase} />
                ))}
            </div>
        </div>
    )
}

type QuestionTestCaseRowProps = {
    testCase: ProblemTestCase
}

function QuestionTestCaseRow({ testCase }: QuestionTestCaseRowProps) {
    return (
        <div className="rounded-xl border border-border bg-secondary/20 p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-foreground">{testCase.id}</p>
                    {/* <p className="text-xs text-muted-foreground">Function: {testCase.functionName}</p> */}
                </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
                <DetailBlock label="Input" value={testCase.input} />
                <DetailBlock label="Expected Output" value={testCase.expectedOutput} />
            </div>
        </div>
    )
}

type TestResultsTabProps = {
    latestSubmission: SubmissionDetails | null
}

function TestResultsTab({ latestSubmission }: TestResultsTabProps) {
    const testResults = latestSubmission?.test_results ?? []

    if (!latestSubmission) {
        return <EmptyState message="Run code to see test results here." />
    }

    return (
        <div className="space-y-4">
            <SummaryCards submission={latestSubmission} testResults={testResults} />

            <div className="rounded-xl border border-border bg-card">
                <div className="border-b border-border px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Terminal className="size-4 text-primary" />
                        <h3 className="text-sm font-semibold text-foreground">Test Results</h3>
                    </div>
                </div>

                <div className="space-y-3 p-4">
                    {testResults.length > 0 ? (
                        testResults.map((test) => <TestResultRow key={test.test_id} test={test} />)
                    ) : (
                        <EmptyState message="This submission has no test case output yet." />
                    )}
                </div>
            </div>
        </div>
    )
}

type SummaryCardsProps = {
    submission: SubmissionDetails
    testResults: SubmissionTestResult[]
}

function SummaryCards({ submission, testResults }: SummaryCardsProps) {
    const passedCount = testResults.filter((test) => test.passed).length

    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Status" value={submission.status} tone={submission.status === 'correct' ? 'success' : submission.status === 'error' ? 'danger' : 'default'} />
            <SummaryCard label="Tests" value={`${passedCount}/${testResults.length || 0}`} tone={passedCount === testResults.length && testResults.length > 0 ? 'success' : 'default'} />
            <SummaryCard label="Score" value={typeof submission.score === 'number' ? `${submission.score}` : 'N/A'} tone="default" />
            <SummaryCard label="Runtime" value={typeof submission.execution_time === 'number' ? `${submission.execution_time} ms` : 'N/A'} tone="default" />
        </div>
    )
}

type SummaryCardProps = {
    label: string
    value: string
    tone: 'default' | 'success' | 'danger'
}

function SummaryCard({ label, value, tone }: SummaryCardProps) {
    const toneClasses =
        tone === 'success'
            ? 'border-green-500/20 bg-green-500/10 text-green-400'
            : tone === 'danger'
                ? 'border-red-500/20 bg-red-500/10 text-red-400'
                : 'border-border bg-card text-foreground'

    return (
        <div className={['rounded-xl border p-4', toneClasses].join(' ')}>
            <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
            <div className="mt-2 text-sm font-semibold">{value}</div>
        </div>
    )
}

type TestResultRowProps = {
    test: SubmissionTestResult
}

const FormatValue = ({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
        return value
    } else if (typeof value === 'object') {
        try {
            return JSON.stringify(value, null)
        }
        catch {
            return String(value)
        }
    } else {
        return String(value)
    }
}

function TestResultRow({ test }: TestResultRowProps) {
    return (
        <div className="rounded-xl border border-border bg-secondary/20 p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    {test.passed ? <CheckCircle className="size-4 text-green-400" /> : <XCircle className="size-4 text-red-400" />}
                    <div>
                        <p className="text-sm font-semibold text-foreground">{test.test_id}</p>
                        <p className={['text-xs font-medium', test.passed ? 'text-green-400' : 'text-red-400'].join(' ')}>
                            {test.passed ? 'Passed' : 'Failed'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
                <DetailBlock label="Expected" value={FormatValue({ value: test.expected })} />
                <DetailBlock label="Actual" value={FormatValue({ value: test.actual })} />
            </div>
        </div>
    )
}

type DetailBlockProps = {
    label: string
    value: unknown
}

function DetailBlock({ label, value }: DetailBlockProps) {
    return (
        <div className="rounded-lg border border-border bg-background p-3">
            <div className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
            <div className="mt-2 whitespace-pre-wrap wrap-break-word font-mono text-sm leading-6 text-foreground">{formatValue(value)}</div>
        </div>
    )
}

function EmptyState({ message }: { message: string }) {
    return <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">{message}</div>
}

function formatValue(value: unknown) {
    if (typeof value === 'string') {
        return value
    }

    try {
        return JSON.stringify(value, null, 2)
    } catch {
        return String(value)
    }
}

type FeedbackDialogProps = {
    submission: SubmissionDetails
    onClose: () => void
}

function FeedbackDialog({ submission, onClose }: FeedbackDialogProps) {
    const feedback = submission.ai_feedback

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-80 flex items-center justify-center bg-black/60 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 12 }}
                transition={{ duration: 0.18 }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="submission-feedback-title"
                onClick={(event) => event.stopPropagation()}
                className="flex h-[88vh] max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            >
                <div className="flex items-center justify-between border-b border-border bg-secondary px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-lg shadow-black/10">
                            <Bell className="size-5" />
                        </div>
                        <div>
                            <h2 id="submission-feedback-title" className="text-base font-semibold text-foreground">
                                Submission Feedback
                            </h2>
                            <p className="text-xs text-muted-foreground">AI feedback and metadata for submission #{submission.id}</p>
                        </div>
                    </div>

                    <button type="button" onClick={onClose} className="rounded-full border border-border bg-background px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                        Close
                    </button>
                </div>

                <ScrollArea className="min-h-0 flex-1">
                    <div className="space-y-5 p-5">
                        <section className="rounded-xl border border-border bg-background p-4">
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                <InfoChip label="Status" value={submission.status} />
                                <InfoChip label="Language" value={submission.language} />
                                <InfoChip label="Provider" value={submission.provider_used ?? 'N/A'} />
                                <InfoChip label="Score" value={typeof submission.score === 'number' ? `${submission.score}` : 'N/A'} />
                            </div>
                        </section>

                        <section className="space-y-3 rounded-xl border border-border bg-background p-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="size-4 text-primary" />
                                <h3 className="text-sm font-semibold text-foreground">Assessment</h3>
                            </div>

                            <p className="text-sm leading-6 text-muted-foreground">
                                {feedback?.overall_assessment ?? 'No AI assessment was returned for this submission.'}
                            </p>
                        </section>

                        <FeedbackSection title="Strengths" items={feedback?.strengths ?? []} />
                        <FeedbackSection title="Issues" items={(feedback?.issues ?? []).map((issue) => `${issue.type}: ${issue.description}`)} />
                        <FeedbackSection title="Suggestions" items={feedback?.suggestions ?? []} />
                        <FeedbackSection title="Next Steps" items={feedback?.next_steps ?? []} />

                        <section className="space-y-3 rounded-xl border border-border bg-background p-4">
                            <div className="flex items-center gap-2">
                                <Terminal className="size-4 text-muted-foreground" />
                                <h3 className="text-sm font-semibold text-foreground">Submission Details</h3>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                <InfoChip label="Submitted" value={submission.submitted_at ?? 'N/A'} />
                                <InfoChip label="Evaluated" value={submission.evaluated_at ?? 'N/A'} />
                            </div>
                        </section>
                    </div>
                </ScrollArea>
            </motion.div>
        </motion.div>
    )
}

type FeedbackSectionProps = {
    title: string
    items: string[]
}

function FeedbackSection({ title, items }: FeedbackSectionProps) {
    return (
        <section className="space-y-3 rounded-xl border border-border bg-background p-4">
            <div className="flex items-center gap-2">
                <CheckCircle className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            </div>

            {items.length > 0 ? (
                <ul className="space-y-2 text-sm text-muted-foreground">
                    {items.map((item) => (
                        <li key={item} className="rounded-lg border border-border bg-secondary/20 px-3 py-2 leading-6">
                            {item}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground">No {title.toLowerCase()} available.</p>
            )}
        </section>
    )
}

type InfoChipProps = {
    label: string
    value: string
}

function InfoChip({ label, value }: InfoChipProps) {
    return (
        <div className="rounded-xl border border-border bg-secondary/20 p-3">
            <div className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
            <div className="mt-1 wrap-break-word text-sm font-medium text-foreground">{value}</div>
        </div>
    )
}

type NotificationButtonProps = {
    hasSubmission: boolean
    onClick: () => void
}

function NotificationButton({ hasSubmission, onClick }: NotificationButtonProps) {
    return (
        <button
            type="button"
            disabled={!hasSubmission}
            onClick={onClick}
            aria-label={hasSubmission ? 'Open submission notification' : 'Waiting for a completed submission'}
            title={hasSubmission ? 'Open submission notification' : 'Waiting for a completed submission'}
            className={[
                'absolute bottom-20 right-4 z-40 flex size-12 items-center justify-center rounded-full border bg-card shadow-lg transition lg:bottom-4',
                hasSubmission
                    ? 'border-slate-400/70 text-foreground shadow-slate-500/20 hover:border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'border-border text-muted-foreground opacity-70',
            ].join(' ')}
        >
            <Bell className={['size-5', hasSubmission ? 'animate-pulse' : ''].join(' ')} />
            {hasSubmission ? <span className="absolute right-0 top-0 size-3 rounded-full border-2 border-background bg-red-500" /> : null}
        </button>
    )
}