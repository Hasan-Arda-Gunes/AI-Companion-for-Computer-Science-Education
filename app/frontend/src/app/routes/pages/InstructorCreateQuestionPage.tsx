import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
    CheckCircle,
    ChevronDown,
    ChevronLeft,
    ChevronUp,
    Code,
    FlaskConical,
    MessageSquare,
    Sparkles,
    Target,
    Wand2,
} from 'lucide-react'
import { Group, Panel, Separator, usePanelRef } from 'react-resizable-panels'
import { InstructorLayout } from '../../../components/layout/InstructorLayout'
import { GenericAIPanel } from '../../../components/instructor/GenericAIPanel'
import { QuestionPanel } from '../../../components/instructor/QuestionPanel'
import { TestCasePanel } from '../../../components/instructor/TestCasePanel'
import type { ChatMessage, ProblemForm, ShortcutAction, TestCase } from '../../../components/instructor/questionCreationTypes'
import { instructorChat } from '../../../features/ai/api/aiApi'
import type {
    EvaluateQuestionRequest,
    EvaluateTestCasesRequest,
    GenerateQuestionFromConstraintsRequest,
    GenerateQuestionFromStyleRequest,
    GenerateQuestionVariationRequest,
    GenerateTestCasesRequest,
    InstructorChatRequest,
    LLMProvider,
} from '../../../features/ai/types'
import { createProblem } from '../../../features/problems/api/problemsApi'
import type { CreateProblemRequest } from '../../../features/problems/types'

const defaultProblemForm: ProblemForm = {
    title: 'Two Sum',
    description:
        'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume each input has exactly one solution, and you may not use the same element twice.',
    difficulty: 'intermediate',
    topic: 'arrays',
    starter_code: 'def two_sum(nums, target):\n    pass',
    function_name: 'two_sum',
    hints: ['Consider using a hash map for O(n) solution'],
    time_limit: 5000,
    memory_limit: 256,
    check_correctness: true,
    check_efficiency: true,
    examples: [
        {
            id: 'ex1',
            input: '[2,7,11,15], 9',
            expected_output: '[0,1]',
        },
        {
            id: 'ex2',
            input: '[3,2,4], 6',
            expected_output: '[1,2]',
        },
    ],
}

const defaultTestCases: TestCase[] = [
    {
        id: '1',
        input: '[2,7,11,15], 9',
        expectedOutput: '[0,1]',
        isHidden: false,
    },
    {
        id: '2',
        input: '[3,2,4], 6',
        expectedOutput: '[1,2]',
        isHidden: false,
    },
    {
        id: '3',
        input: '[3,3], 6',
        expectedOutput: '[0,1]',
        isHidden: true,
    },
]

const providerMap: Record<string, LLMProvider> = {
    gemini: 'gemini',
    ollama: 'ollama',
}

function resolveProvider(providerId: string): LLMProvider | undefined {
    return providerMap[providerId]
}

function mapDifficultyToAi(difficulty: ProblemForm['difficulty']): 'easy' | 'medium' | 'hard' {
    if (difficulty === 'beginner') return 'easy'
    if (difficulty === 'intermediate') return 'medium'
    return 'hard'
}

function parseStructuredInput(value: string): unknown {
    const trimmed = value.trim()

    if (!trimmed) {
        return ''
    }

    try {
        return JSON.parse(trimmed)
    } catch {
        return value
    }
}

export function InstructorCreateQuestionPage() {
    const [problemForm, setProblemForm] = useState<ProblemForm>(defaultProblemForm)
    const [testCases, setTestCases] = useState<TestCase[]>(defaultTestCases)
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'assistant',
            content:
                "Hello! I'm your AI Question Assistant. I can help you create, evaluate, and improve programming questions and test cases. Use the shortcut buttons below or chat with me directly!",
            timestamp: new Date(),
        },
    ])
    const [isTyping, setIsTyping] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
    const [selectedProviderId, setSelectedProviderId] = useState('gemini')

    const leftColumnRef = usePanelRef()
    const questionPanelRef = usePanelRef()
    const testCasesPanelRef = usePanelRef()
    const aiPanelRef = usePanelRef()

    const isLeftColumnCollapsed = false
    const [isQuestionCollapsed, setIsQuestionCollapsed] = useState(false)
    const [isTestCasesCollapsed, setIsTestCasesCollapsed] = useState(false)
    const [isAiCollapsed, setIsAiCollapsed] = useState(false)

    const [isQuestionMaximized, setIsQuestionMaximized] = useState(false)
    const [isTestCasesMaximized, setIsTestCasesMaximized] = useState(false)

    const aiContext = useMemo(() => {
        return {
            current_question: {
                title: problemForm.title,
                description: problemForm.description,
            },
            test_cases: testCases.map((testCase) => ({
                input: testCase.input,
                expected_output: testCase.expectedOutput,
            })),
        }
    }, [problemForm.description, problemForm.title, testCases])

    const sendInstructorMessage = async (message: string, providerId = selectedProviderId) => {
        const trimmed = message.trim()
        if (!trimmed) return

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: trimmed,
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setIsTyping(true)

        try {
            const payload: InstructorChatRequest = {
                message: trimmed,
                provider: resolveProvider(providerId),
                context: aiContext,
            }

            const response = await instructorChat(payload)

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.response,
                timestamp: new Date(),
            }

            setMessages((prev) => [...prev, assistantMessage])
        } catch (error) {
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, errorMessage])
        } finally {
            setIsTyping(false)
        }
    }

    const handleQuickAction = (label: string, request: object, providerId: string) => {
        const payloadMessage = `${label}\n\nRequest:\n\n\`\`\`json\n${JSON.stringify(request, null, 2)}\n\`\`\``
        void sendInstructorMessage(payloadMessage, providerId)
    }

    const quickActions: ShortcutAction[] = [
        {
            id: 'variation',
            label: 'Create Variation',
            icon: Wand2,
            color: 'from-blue-500 to-blue-600',
            action: (providerId) => {
                const request: GenerateQuestionVariationRequest = {
                    reference_question_ids: [],
                    variation_type: 'constraints',
                    additional_constraints: problemForm.topic ? `Topic: ${problemForm.topic}` : undefined,
                    provider: resolveProvider(providerId),
                }
                handleQuickAction('Create a variation of the current question.', request, providerId)
            },
        },
        {
            id: 'similar',
            label: 'Similar in Different Topic',
            icon: Code,
            color: 'from-purple-500 to-purple-600',
            action: (providerId) => {
                const request: GenerateQuestionFromStyleRequest = {
                    reference_question_ids: [],
                    new_topic: problemForm.topic || 'arrays',
                    new_difficulty: mapDifficultyToAi(problemForm.difficulty),
                    provider: resolveProvider(providerId),
                }
                handleQuickAction('Generate a similar question in a new topic.', request, providerId)
            },
        },
        {
            id: 'generate',
            label: 'Generate from Constraints',
            icon: Target,
            color: 'from-green-500 to-green-600',
            action: (providerId) => {
                const request: GenerateQuestionFromConstraintsRequest = {
                    constraints: `Time limit: ${problemForm.time_limit}ms, Memory limit: ${problemForm.memory_limit}MB`,
                    topics: problemForm.topic ? [problemForm.topic] : [],
                    difficulty: mapDifficultyToAi(problemForm.difficulty),
                    provider: resolveProvider(providerId),
                }
                handleQuickAction('Generate a question from the current constraints.', request, providerId)
            },
        },
        {
            id: 'evaluate',
            label: 'Evaluate Question',
            icon: CheckCircle,
            color: 'from-orange-500 to-orange-600',
            action: (providerId) => {
                const request: EvaluateQuestionRequest = {
                    title: problemForm.title,
                    description: problemForm.description,
                    examples: problemForm.examples.map((example) => ({
                        input: example.input,
                        output: example.expected_output,
                    })),
                    test_cases: testCases.map((testCase) => ({
                        input: testCase.input,
                        expected_output: testCase.expectedOutput,
                    })),
                    provider: resolveProvider(providerId),
                }
                handleQuickAction('Evaluate the current question.', request, providerId)
            },
        },
        {
            id: 'gen-tests',
            label: 'Generate Test Cases',
            icon: FlaskConical,
            color: 'from-teal-500 to-teal-600',
            action: (providerId) => {
                const request: GenerateTestCasesRequest = {
                    question_description: problemForm.description,
                    constraints: `Time limit: ${problemForm.time_limit}ms, Memory limit: ${problemForm.memory_limit}MB`,
                    examples: problemForm.examples.map((example) => ({
                        input: example.input,
                        output: example.expected_output,
                    })),
                    difficulty: mapDifficultyToAi(problemForm.difficulty),
                    provider: resolveProvider(providerId),
                }
                handleQuickAction('Generate test cases for the current question.', request, providerId)
            },
        },
        {
            id: 'eval-tests',
            label: 'Evaluate Test Cases',
            icon: MessageSquare,
            color: 'from-pink-500 to-pink-600',
            action: (providerId) => {
                const request: EvaluateTestCasesRequest = {
                    question_description: problemForm.description,
                    test_cases: testCases.map((testCase) => ({
                        input: testCase.input,
                        expected_output: testCase.expectedOutput,
                    })),
                    provider: resolveProvider(providerId),
                }
                handleQuickAction('Evaluate the current test cases.', request, providerId)
            },
        },
    ]

    const addTestCase = () => {
        const maxExistingId = testCases.reduce((maxId, testCase) => {
            const parsedId = Number.parseInt(testCase.id, 10)
            if (Number.isNaN(parsedId)) return maxId
            return Math.max(maxId, parsedId)
        }, 0)

        const newTestCase: TestCase = {
            id: String(maxExistingId + 1),
            input: '',
            expectedOutput: '',
            isHidden: false,
        }
        setTestCases((prev) => [...prev, newTestCase])
    }

    const deleteTestCase = (id: string) => {
        setTestCases((prev) => prev.filter((testCase) => testCase.id !== id))
    }

    const updateTestCase = (id: string, field: keyof TestCase, value: string | boolean) => {
        setTestCases((prev) =>
            prev.map((testCase) => (testCase.id === id ? { ...testCase, [field]: value } : testCase))
        )
    }

    const replaceTestCases = (nextTestCases: TestCase[]) => {
        setTestCases(nextTestCases)
    }

    const toggleQuestionPanel = () => {
        const panel = questionPanelRef.current
        if (!panel) return
        if (isQuestionCollapsed) {
            panel.expand()
        } else {
            panel.collapse()
        }
        setIsQuestionCollapsed((prev) => !prev)
    }

    const toggleTestCasesPanel = () => {
        const panel = testCasesPanelRef.current
        if (!panel) return
        if (isTestCasesCollapsed) {
            panel.expand()
        } else {
            panel.collapse()
        }
        setIsTestCasesCollapsed((prev) => !prev)
    }

    const closeAiPanel = () => {
        aiPanelRef.current?.resize('0%')
        aiPanelRef.current?.collapse()
        setIsAiCollapsed(true)
    }

    const openAiPanel = () => {
        aiPanelRef.current?.expand()
        setIsAiCollapsed(false)
    }

    useEffect(() => {
        const panel = aiPanelRef.current
        const leftPanel = leftColumnRef.current
        if (!panel) return
        if (isAiCollapsed) {
            panel.resize('0%')
            panel.collapse()
            leftPanel?.resize('100%')
        } else {
            panel.expand()
            panel.resize('50%')
            leftPanel?.resize('50%')
        }
    }, [aiPanelRef, isAiCollapsed, leftColumnRef])

    const maximizeQuestion = () => {
        setIsQuestionMaximized((prev) => !prev)
        if (!isQuestionMaximized) {
            testCasesPanelRef.current?.collapse()
            setIsTestCasesCollapsed(true)
        } else {
            testCasesPanelRef.current?.expand()
            setIsTestCasesCollapsed(false)
        }
    }

    const maximizeTestCases = () => {
        setIsTestCasesMaximized((prev) => !prev)
        if (!isTestCasesMaximized) {
            questionPanelRef.current?.collapse()
            setIsQuestionCollapsed(true)
        } else {
            questionPanelRef.current?.expand()
            setIsQuestionCollapsed(false)
        }
    }

    const handleCreateProblem = async () => {
        const title = problemForm.title.trim()
        const description = problemForm.description.trim()
        const topic = problemForm.topic.trim()

        if (!title || !description || !topic) {
            setSubmitSuccess(null)
            setSubmitError('Title, topic, and description are required.')
            return
        }

        const sanitizedExamples = problemForm.examples
            .filter((example) => example.input.trim() || example.expected_output.trim())
            .map((example) => ({
                input: parseStructuredInput(example.input),
                expected_output: parseStructuredInput(example.expected_output),
            }))

        const functionName = problemForm.function_name.trim() || 'solution'

        const payload: CreateProblemRequest = {
            title,
            description,
            difficulty: problemForm.difficulty,
            topic,
            examples: sanitizedExamples,
            test_cases: testCases.map((testCase) => ({
                id: testCase.id,
                input: parseStructuredInput(testCase.input),
                expected_output: parseStructuredInput(testCase.expectedOutput),
                function_name: functionName,
            })),
            starter_code: problemForm.starter_code,
            evaluation_criteria: {
                check_correctness: problemForm.check_correctness,
                check_efficiency: problemForm.check_efficiency,
            },
            hints: problemForm.hints.filter((hint) => hint.trim()),
            time_limit: problemForm.time_limit,
            memory_limit: problemForm.memory_limit,
        }

        setIsSubmitting(true)
        setSubmitError(null)
        setSubmitSuccess(null)

        try {
            const created = await createProblem(payload)
            setSubmitSuccess(`Problem created successfully with id ${created.id}.`)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create problem'
            setSubmitError(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <InstructorLayout
            currentPage="create-question"
            title="Create Question"
            subtitle="Instructor authoring surface for composing, categorizing, and previewing new questions."
            showHeader={false}
        >
            <div className="-m-4 flex h-[calc(100vh-2rem)] flex-col overflow-hidden bg-background sm:-m-6 lg:-m-10">
                <div className="px-6 py-4 border-b border-border bg-(--charcoal)/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-(--electric-purple) to-purple-600 flex items-center justify-center shadow-(--electric-purple-glow)">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-foreground">AI Question Assistant</h1>
                                <p className="text-sm text-muted-foreground">
                                    Create and improve questions with AI
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {(submitError || submitSuccess) && (
                    <div className="px-6 py-3 border-b border-border">
                        {submitError ? (
                            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                                {submitError}
                            </div>
                        ) : null}
                        {submitSuccess ? (
                            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
                                {submitSuccess}
                            </div>
                        ) : null}
                    </div>
                )}

                <div className="flex-1 overflow-hidden relative">
                    <Group
                        orientation="horizontal"
                        resizeTargetMinimumSize={{ coarse: 30, fine: 12 }}
                    >
                        <Panel
                            panelRef={leftColumnRef}
                            defaultSize="50%"
                            minSize="25%"
                            maxSize={isAiCollapsed ? '100%' : '75%'}
                            collapsible
                            collapsedSize="0%"
                        >
                            <Group orientation="vertical">
                                <Panel
                                    panelRef={questionPanelRef}
                                    defaultSize="60%"
                                    minSize="5%"
                                    collapsible
                                    collapsedSize="5%"
                                >
                                    <QuestionPanel
                                        problemForm={problemForm}
                                        onChange={setProblemForm}
                                        onMaximize={maximizeQuestion}
                                        onCollapse={toggleQuestionPanel}
                                        onSubmit={handleCreateProblem}
                                        isLoading={isSubmitting}
                                        isCollapsed={isQuestionCollapsed}
                                        isMaximized={isQuestionMaximized}
                                    />
                                </Panel>

                                <Separator className="h-1 bg-border hover:bg-(--electric-purple) transition-colors relative" />

                                <Panel
                                    panelRef={testCasesPanelRef}
                                    defaultSize="40%"
                                    minSize="5%"
                                    collapsible
                                    collapsedSize="5%"
                                >
                                    <TestCasePanel
                                        testCases={testCases}
                                        onAdd={addTestCase}
                                        onUpdate={updateTestCase}
                                        onDelete={deleteTestCase}
                                        onReplaceAll={replaceTestCases}
                                        onMaximize={maximizeTestCases}
                                        onCollapse={toggleTestCasesPanel}
                                        isCollapsed={isTestCasesCollapsed}
                                        isMaximized={isTestCasesMaximized}
                                    />
                                </Panel>
                            </Group>
                        </Panel>

                        <Separator
                            className={`w-2 h-full bg-border hover:bg-(--electric-purple) transition-colors relative cursor-col-resize ${isAiCollapsed ? 'opacity-0 pointer-events-none' : ''}`}
                            style={{ touchAction: 'none' }}
                        />

                        <Panel
                            panelRef={aiPanelRef}
                            defaultSize={isAiCollapsed ? '0%' : '50%'}
                            minSize="0%"
                            maxSize={isAiCollapsed ? '0%' : '75%'}
                            collapsible
                            collapsedSize="0%"
                        >
                            <GenericAIPanel
                                messages={messages}
                                isTyping={isTyping}
                                quickActions={quickActions}
                                onSendMessage={sendInstructorMessage}
                                onCollapse={closeAiPanel}
                                onProviderChange={setSelectedProviderId}
                            />
                        </Panel>
                    </Group>

                    {/* Left-side collapse buttons removed */}

                    <AnimatePresence>
                        {isAiCollapsed && (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={openAiPanel}
                                className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-16 bg-(--charcoal) border border-border border-r-0 rounded-l-md flex items-center justify-center hover:bg-(--slate-gray) transition-colors z-10 group"
                                title="Open AI panel"
                            >
                                <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-(--electric-purple)" />
                            </motion.button>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {isQuestionCollapsed && !isLeftColumnCollapsed && (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={toggleQuestionPanel}
                                className="absolute left-1/4 top-0 w-32 h-6 bg-(--charcoal) border border-border border-t-0 rounded-b-md flex items-center justify-center hover:bg-(--slate-gray) transition-colors z-10 group text-xs text-muted-foreground"
                                title="Expand question panel"
                            >
                                <ChevronDown className="w-3 h-3 mr-1" />
                                Question
                            </motion.button>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {isTestCasesCollapsed && !isLeftColumnCollapsed && (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={toggleTestCasesPanel}
                                className="absolute left-1/4 bottom-0 w-32 h-6 bg-(--charcoal) border border-border border-b-0 rounded-t-md flex items-center justify-center hover:bg-(--slate-gray) transition-colors z-10 group text-xs text-muted-foreground"
                                title="Expand test cases panel"
                            >
                                <ChevronUp className="w-3 h-3 mr-1" />
                                Test Cases
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </InstructorLayout>
    )
}
