import { useState } from 'react'
import { CodeLabWorkspace } from '../../../components/codelab/CodeLabWorkspace'
import { StudentLayout } from '../../../components/layout/StudentLayout'
import type { CodeEditorData, CodeLabHeaderData, ConsoleData, ConsoleLog, EvolutionStage, MentorData, QuestionData } from '../../../components/codelab/types'

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
    defaultLanguageId: 'javascript',
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
    const [mentorOpen, setMentorOpen] = useState(true)
    const [isRunning, setIsRunning] = useState(false)
    const [consoleData, setConsoleData] = useState<ConsoleData>(sampleConsole)
    const [headerData, setHeaderData] = useState<CodeLabHeaderData>({
        isLoggedIn: true,
        username: 'Student',
        xp: 1280,
    })

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
        setIsRunning(true)
        appendLogs([createLog('info', `Running ${languageId} solution...`)])

        window.setTimeout(() => {
            appendLogs([
                createLog('log', `Language: ${languageId}`),
                createLog('success', 'Execution completed (UI placeholder)'),
                createLog('info', `Code length: ${code.length} chars`),
                createLog('log', 'Ready for backend execution hook.'),
            ])
            setIsRunning(false)
        }, 900)
    }

    const handleClearConsole = () => {
        setConsoleData((prev) => ({
            ...prev,
            logs: [],
        }))
    }

    return (
        <StudentLayout
            currentPage="codelab"
            title="Code Lab"
            subtitle="Solve algorithm problems with guided AI support and an integrated coding workspace."
            showHeader={false}
        >
            <div className="-m-4 h-dvh overflow-hidden border border-border bg-card shadow-sm sm:-m-6 lg:-m-10 lg:border-0">
                <CodeLabWorkspace
                    title="Code Evolution Lab"
                    stages={sampleStages}
                    headerData={headerData}
                    question={sampleQuestion}
                    editor={sampleEditor}
                    consoleData={consoleData}
                    mentor={sampleMentor}
                    mentorOpen={mentorOpen}
                    onToggleMentor={() => setMentorOpen((prev) => !prev)}
                    onSignIn={handleSignIn}
                    onSignUp={handleSignUp}
                    onLogout={handleLogout}
                    isRunning={isRunning}
                    onRunCode={handleRunCode}
                    onClearConsole={handleClearConsole}
                />
            </div>
        </StudentLayout>
    )
}
