import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CodeLabWorkspace } from '../../../components/codelab/CodeLabWorkspace'
import { chatWithAi, explainError, requestHint } from '../../../features/ai/api/aiApi'
import { getProblemById } from '../../../features/problems/api/problemsApi'
import { getDefaultEditorLanguage, getEditorTabSize } from '../../../features/settings/editorPreferences'
import { startSession } from '../../../features/sessions/api/sessionsApi'
import {
    completeAndClearActiveLearningSession,
    getActiveLearningSession,
    setActiveLearningSession,
} from '../../../features/sessions/sessionLifecycle'
import { getSubmission, submitCode } from '../../../features/submissions/api/submissionsApi'
import type { CodeEditorData, CodeLabHeaderData, ConsoleData, ConsoleLog, EvolutionStage, MentorData, QuestionData } from '../../../components/codelab/types'
import type { LLMProvider } from '../../../features/ai/types'
import type { SubmissionDetails } from '../../../features/submissions/types'
import { useAuthSession } from '../../../features/auth/context/useAuthSession'
import { defaultInstructorSidebarPagePathMap } from '../../../components/layout/instructorSidebarConfig'
import { defaultStudentSidebarPagePathMap } from '../../../components/layout/studentSidebarConfig'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { RoleAwareSidebar } from '../../../components/layout/RoleAwareSidebar'

const sampleStages: EvolutionStage[] = [
    { id: 'stage-1', label: 'Stage 1', active: true },
    { id: 'stage-2', label: 'Stage 2', locked: true },
]

const sampleQuestion: QuestionData = {
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    examples: [
        { id: 'ex-1', input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9' },
        { id: 'ex-2', input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
        { id: 'ex-3', input: 'nums = [3,3], target = 6', output: '[0,1]' },
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
    followUp: 'Can you come up with an algorithm that is less than O(n^2) time complexity?',
    markdownContent: `# Two Sum

Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

## Example 1:

\
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\

## Example 2:

\
Input: nums = [3,2,4], target = 6
Output: [1,2]
\

## Constraints:

- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\`
- Only one valid answer exists.

## Follow-up:

Can you come up with an algorithm that is less than O(n^2) time complexity?
`,
    complexityTarget: {
        time: 'O(n)',
        space: 'O(n)',
    },
}

const sampleEditor: CodeEditorData = {
    fileBaseName: 'solution',
    defaultLanguageId: 'python',
    runButtonLabel: 'Run Evolution',
    languages: [
        { id: 'javascript', name: 'JavaScript', extension: '.js' },
        { id: 'typescript', name: 'TypeScript', extension: '.ts' },
        { id: 'python', name: 'Python', extension: '.py' },
        { id: 'java', name: 'Java', extension: '.java' },
        { id: 'cpp', name: 'C++', extension: '.cpp' },
        { id: 'csharp', name: 'C#', extension: '.cs' },
        { id: 'go', name: 'Go', extension: '.go' },
        { id: 'rust', name: 'Rust', extension: '.rs' },
        { id: 'ruby', name: 'Ruby', extension: '.rb' },
        { id: 'php', name: 'PHP', extension: '.php' },
    ],
    codeTemplates: {
        javascript: `function twoSum(nums, target) {
  // Write your solution here







  return [];
}`,
        typescript: `function twoSum(nums: number[], target: number): number[] {
  // Write your solution here







  return [];
}`,
        python: `def two_sum(nums, target):
    # Write your solution here







    return []`,
        java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here







        return new int[]{};
    }
}`,
        cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here







        return {};
    }
};`,
        csharp: `public class Solution {
    public int[] TwoSum(int[] nums, int target) {
        // Write your solution here







        return new int[]{};
    }
}`,
        go: `func twoSum(nums []int, target int) []int {
    // Write your solution here







    return []int{}
}`,
        rust: `impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        // Write your solution here







        vec![]
    }
}`,
        ruby: `def two_sum(nums, target)
  # Write your solution here







  []
end`,
        php: `<?php
function twoSum($nums, $target) {
    // Write your solution here







    return [];
}`,
    },
}

const sampleConsole: ConsoleData = {
    title: 'Console',
    logs: [
        {
            id: 'boot-log',
            type: 'info',
            message: 'Console initialized. Ready to run code.',
            timestamp: 'now',
        },
    ],
}

const sampleMentor: MentorData = {
    title: 'Socratic Mentor',
    subtitle: 'AI-Powered Guidance',
    initialMessages: [
        {
            id: 'mentor-1',
            role: 'assistant',
            content: "Hello! I'm your Socratic Mentor. I won't give you the answer directly, but I'll guide you with questions. What's your initial approach to solving this problem?",
        },
    ],
    hintSuggestions: [
        'What data structure could help you quickly check if a complement exists?',
        "Have you considered storing values you've seen in a way that allows O(1) lookup?",
        'Think about the relationship between the current number and the target. What would its pair be?',
    ],
    responseSuggestions: [
        'That is an interesting approach. What would be the time complexity of that solution?',
        'Good thinking. How could you optimize this further?',
        'Excellent. Can you walk me through why this works?',
    ],
    hintButtonLabel: 'Request Hint',
    inputPlaceholder: 'Ask your mentor a question...',
}

export function CodeLabPage() {
    const navigate = useNavigate()
    const { user, signOut } = useAuthSession()
    const isTeacher = user?.role === 'teacher'
    const [searchParams] = useSearchParams()
    const selectedProblemId = searchParams.get('problemId')
    const [mentorOpen, setMentorOpen] = useState(true)
    const [isRunning, setIsRunning] = useState(false)
    const [hintLevel, setHintLevel] = useState(1)
    const [starterCode, setStarterCode] = useState<string | null>(null)
    const [currentCode, setCurrentCode] = useState(sampleEditor.codeTemplates.python)
    const [activeSessionId, setActiveSessionId] = useState<number | null>(null)
    const [questionData, setQuestionData] = useState<QuestionData>(sampleQuestion)
    const [consoleData, setConsoleData] = useState<ConsoleData>(sampleConsole)
    const [headerData, setHeaderData] = useState<CodeLabHeaderData>({
        isLoggedIn: true,
        username: 'Student',
        xp: 1280,
    })
    const [defaultLanguageId, setDefaultLanguageId] = useState(() => getDefaultEditorLanguage())
    const [tabSize] = useState(() => getEditorTabSize())

    const pagePathMap = isTeacher
        ? defaultInstructorSidebarPagePathMap
        : defaultStudentSidebarPagePathMap

    const resolvedEditor = useMemo<CodeEditorData>(() => {
        const languageExists = sampleEditor.languages.some((language) => language.id === defaultLanguageId)
        const resolvedDefaultLanguage = languageExists ? defaultLanguageId : 'python'

        return {
            ...sampleEditor,
            defaultLanguageId: resolvedDefaultLanguage,
            codeTemplates: {
                ...sampleEditor.codeTemplates,
                python: starterCode && starterCode.length > 0 ? starterCode : sampleEditor.codeTemplates.python,
            },
            tabSize,
        }
    }, [defaultLanguageId, starterCode, tabSize])

    const createLog = (type: ConsoleLog['type'], message: string): ConsoleLog => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type,
        message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    })

    const appendLogs = (logs: ConsoleLog[]) => {
        setConsoleData((prev) => ({
            ...prev,
            logs: [...prev.logs, ...logs],
        }))
    }

    const handleSignIn = () => {
        setHeaderData({
            isLoggedIn: true,
            username: 'Student',
            xp: 1280,
        })
        appendLogs([createLog('info', 'Signed in (placeholder action).')])
    }

    const handleSignUp = () => {
        setHeaderData({
            isLoggedIn: true,
            username: 'New User',
            xp: 0,
        })
        appendLogs([createLog('success', 'Account created (placeholder action).')])
    }

    const handleLogout = () => {
        setHeaderData((prev) => ({
            ...prev,
            isLoggedIn: false,
        }))
        appendLogs([createLog('info', 'Signed out (placeholder action).')])
    }

    const handleRunCode = (code: string, languageId: string) => {
        const resolvedProblemId = Number(selectedProblemId)
        if (!Number.isFinite(resolvedProblemId) || resolvedProblemId <= 0) {
            appendLogs([createLog('error', 'Select a problem before submitting code.')])
            return
        }

        if (!activeSessionId) {
            appendLogs([createLog('error', 'Session is not ready yet. Please wait and try again.')])
            return
        }

        const normalizedLanguageMap: Record<string, string> = {
            javascript: 'javascript',
            typescript: 'typescript',
            python: 'python',
            java: 'java',
            cpp: 'cpp',
            csharp: 'csharp',
            go: 'go',
            rust: 'rust',
            ruby: 'ruby',
            php: 'php',
        }
        const backendLanguage = normalizedLanguageMap[languageId] ?? languageId

        const toDisplayText = (value: unknown) => {
            if (typeof value === 'string') {
                return value
            }
            try {
                return JSON.stringify(value)
            } catch {
                return String(value)
            }
        }

        const isTerminalStatus = (status: string) => !['pending', 'running'].includes(status)

        const pollSubmission = async (submissionId: number): Promise<SubmissionDetails> => {
            const maxAttempts = 15
            const delayMs = 1200

            for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
                const details = await getSubmission(submissionId)
                appendLogs([createLog('log', `Submission #${submissionId} status: ${details.status} (check ${attempt}/${maxAttempts})`)])

                if (isTerminalStatus(details.status)) {
                    return details
                }

                await new Promise((resolve) => {
                    window.setTimeout(resolve, delayMs)
                })
            }

            return await getSubmission(submissionId)
        }

        const runSubmission = async () => {
            setIsRunning(true)
            appendLogs([
                createLog('info', `Submitting ${backendLanguage} solution for problem #${resolvedProblemId}...`),
                createLog('log', `Session ID: ${activeSessionId}`),
            ])

            try {
                const sanitizedCode = code.replace(/\t/g, ' '.repeat(tabSize))
                const submission = await submitCode({
                    problem_id: resolvedProblemId,
                    code: sanitizedCode,
                    language: backendLanguage,
                    session_id: activeSessionId,
                })

                appendLogs([
                    createLog('success', `Submission created: #${submission.id}`),
                    createLog('info', 'Fetching evaluation result...'),
                ])

                const details = await pollSubmission(submission.id)
                const summaryType = details.status === 'correct' ? 'success' : details.status === 'error' ? 'error' : 'info'
                appendLogs([
                    createLog(summaryType, `Final status: ${details.status}`),
                    ...(typeof details.score === 'number' ? [createLog('log', `Score: ${details.score}`)] : []),
                    ...(typeof details.execution_time === 'number'
                        ? [createLog('log', `Execution time: ${details.execution_time} ms`)]
                        : []),
                ])

                if (details.test_results?.length) {
                    appendLogs([createLog('info', `Test results (${details.test_results.length}):`)])
                    appendLogs(
                        details.test_results.map((test) =>
                            createLog(
                                test.passed ? 'success' : 'error',
                                `${test.test_id}: ${test.passed ? 'PASSED' : 'FAILED'} | expected=${toDisplayText(test.expected)} | actual=${toDisplayText(test.actual)}`,
                            ),
                        ),
                    )
                }

                if (details.ai_feedback?.overall_assessment) {
                    appendLogs([createLog('info', `AI: ${details.ai_feedback.overall_assessment}`)])
                }

                if (typeof details.score === 'number') {
                    const active = getActiveLearningSession()
                    if (active && active.id === activeSessionId) {
                        setActiveLearningSession({
                            ...active,
                            bestScore: Math.max(active.bestScore, details.score),
                        })
                    }
                }

                if (details.ai_feedback?.suggestions?.length) {
                    appendLogs([
                        createLog('info', 'AI Suggestions:'),
                        ...details.ai_feedback.suggestions.map((suggestion) => createLog('log', `- ${suggestion}`)),
                    ])
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Submission failed'
                appendLogs([createLog('error', message)])
            } finally {
                setIsRunning(false)
            }
        }

        void runSubmission()
    }

    const handleClearConsole = () => {
        setConsoleData((prev) => ({
            ...prev,
            logs: [],
        }))
    }

    const handleMentorRequestHint = async (provider: LLMProvider) => {
        const resolvedProblemId = Number(selectedProblemId)
        if (!Number.isFinite(resolvedProblemId) || resolvedProblemId <= 0) {
            throw new Error('Select a problem to request a hint.')
        }

        if (!activeSessionId) {
            throw new Error('Session is not ready yet. Please wait and try again.')
        }

        const result = await requestHint({
            problem_id: resolvedProblemId,
            session_id: activeSessionId,
            current_code: currentCode,
            hint_level: hintLevel,
            provider,
        })

        setHintLevel(result.hint_level + 1)
        appendLogs([
            createLog('info', `Hint level ${result.hint_level} received (${result.remaining_hints} remaining).`),
        ])

        return result.hint
    }

    const handleMentorChat = async (message: string, provider: LLMProvider) => {
        const result = await chatWithAi({
            message,
            context: {
                current_code: currentCode,
            },
            provider,
        })

        return result.response
    }

    const handleMentorExplainError = async (provider: LLMProvider) => {
        const lastErrorLog = [...consoleData.logs].reverse().find((log) => log.type === 'error')

        if (!lastErrorLog) {
            throw new Error('No error output found in console to explain.')
        }

        const result = await explainError({
            code: currentCode,
            language: defaultLanguageId,
            context: `Runtime error: ${lastErrorLog.message}`,
            provider,
        })

        const explanation = result.explanation ?? result.response
        if (!explanation) {
            throw new Error('No explanation returned by AI.')
        }

        appendLogs([createLog('info', 'Received AI error explanation.')])
        return explanation
    }

    useEffect(() => {
        if (!selectedProblemId) {
            setQuestionData(sampleQuestion)
            setStarterCode(null)
            setCurrentCode(sampleEditor.codeTemplates.python)
            setHintLevel(1)
            setActiveSessionId(null)
            setDefaultLanguageId(getDefaultEditorLanguage())
            return
        }

        const parsedProblemId = Number(selectedProblemId)
        if (!Number.isFinite(parsedProblemId) || parsedProblemId <= 0) {
            setQuestionData(sampleQuestion)
            appendLogs([createLog('error', 'Invalid problem id in URL.')])
            return
        }

        let isMounted = true

        const formatUnknown = (value: unknown) => {
            if (typeof value === 'string') {
                return value
            }

            try {
                return JSON.stringify(value)
            } catch {
                return String(value)
            }
        }

        const loadProblem = async () => {
            appendLogs([createLog('info', `Loading problem ${parsedProblemId}...`)])

            try {
                const activeSession = getActiveLearningSession()
                if (activeSession && activeSession.problemId === parsedProblemId) {
                    setActiveSessionId(activeSession.id)
                } else {
                    if (activeSession && activeSession.problemId !== parsedProblemId) {
                        await completeAndClearActiveLearningSession()
                    }

                    const createdSession = await startSession(parsedProblemId)
                    setActiveLearningSession({
                        id: createdSession.id,
                        problemId: parsedProblemId,
                        bestScore: 0,
                    })
                    setActiveSessionId(createdSession.id)
                    appendLogs([createLog('success', `Started session #${createdSession.id}`)])
                }

                const detail = await getProblemById(parsedProblemId)
                if (!isMounted) {
                    return
                }

                const constraintsList = detail.constraints
                    ? Object.entries(detail.constraints).map(([key, value]) => `- ${key}: ${formatUnknown(value)}`)
                    : []

                const examplesMarkdown = (detail.examples ?? []).map((example, index) => {
                    return [
                        `### Example ${index + 1}`,
                        '',
                        '```',
                        `Input: ${formatUnknown(example.input)}`,
                        `Expected Output: ${formatUnknown(example.expected_output)}`,
                        '```',
                    ].join('\n')
                })

                const markdownSections = [
                    `# ${detail.title}`,
                    '',
                    detail.description,
                    '',
                    ...(examplesMarkdown.length > 0 ? ['## Examples', '', ...examplesMarkdown, ''] : []),
                    ...(constraintsList.length > 0 ? ['## Constraints', '', ...constraintsList, ''] : []),
                    ...(detail.hints && detail.hints.length > 0 ? ['## Hints', '', ...detail.hints.map((hint) => `- ${hint}`), ''] : []),
                ]

                const mappedQuestion: QuestionData = {
                    title: detail.title,
                    description: detail.description,
                    examples: (detail.examples ?? []).map((example, index) => ({
                        id: `api-example-${index + 1}`,
                        input: formatUnknown(example.input),
                        output: formatUnknown(example.expected_output),
                    })),
                    constraints: detail.constraints
                        ? Object.entries(detail.constraints).map(([key, value]) => `${key}: ${formatUnknown(value)}`)
                        : [],
                    markdownContent: markdownSections.join('\n').trim(),
                    complexityTarget: {
                        time: 'N/A',
                        space: 'N/A',
                    },
                }

                setQuestionData(mappedQuestion)
                const resolvedStarterCode = detail.starter_code ?? null
                setStarterCode(resolvedStarterCode && resolvedStarterCode.length > 0 ? resolvedStarterCode : null)
                setCurrentCode(resolvedStarterCode && resolvedStarterCode.length > 0 ? resolvedStarterCode : sampleEditor.codeTemplates.python)
                setHintLevel(1)
                setDefaultLanguageId(getDefaultEditorLanguage())
                appendLogs([createLog('success', `Loaded problem: ${detail.title}`)])
            } catch (error) {
                if (!isMounted) {
                    return
                }

                const message = error instanceof Error ? error.message : 'Failed to load problem details'
                appendLogs([createLog('error', message)])
            }
        }

        loadProblem()

        return () => {
            isMounted = false
        }
    }, [selectedProblemId])

    return (
        <DashboardLayout
            title="Code Lab"
            subtitle="Solve algorithm problems with guided AI support and an integrated coding workspace."
            sidebar={
                <RoleAwareSidebar
                    className="hidden lg:flex"
                    currentPage="codelab"
                    onNavigate={(page) => {
                        const path = pagePathMap[page]
                        if (path) {
                            navigate(path)
                        }
                    }}
                    onLogout={() => {
                        void completeAndClearActiveLearningSession()
                        signOut()
                        navigate('/login', { replace: true })
                    }}
                />
            }
        >
            <div className="-m-4 h-dvh overflow-hidden border border-border bg-card shadow-sm sm:-m-6 lg:-m-10 lg:border-0">
                <CodeLabWorkspace
                    title="Code Evolution Lab"
                    stages={sampleStages}
                    headerData={headerData}
                    question={questionData}
                    editor={resolvedEditor}
                    consoleData={consoleData}
                    mentor={sampleMentor}
                    mentorOpen={mentorOpen}
                    onToggleMentor={() => setMentorOpen((prev) => !prev)}
                    onSignIn={handleSignIn}
                    onSignUp={handleSignUp}
                    onLogout={handleLogout}
                    isRunning={isRunning}
                    onRunCode={handleRunCode}
                    onEditorCodeChange={(code) => setCurrentCode(code)}
                    onClearConsole={handleClearConsole}
                    onMentorRequestHint={handleMentorRequestHint}
                    onMentorChat={handleMentorChat}
                    onMentorExplainError={handleMentorExplainError}
                />
            </div>
        </DashboardLayout>
    )
}
