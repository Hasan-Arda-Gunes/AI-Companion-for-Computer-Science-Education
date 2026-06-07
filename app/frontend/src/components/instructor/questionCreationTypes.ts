import type { ElementType } from 'react'

export type ChatMessage = {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

export type ShortcutAction = {
    id: string
    label: string
    icon: ElementType
    color: string
    action: (providerId: string) => void
}

export type TestCase = {
    id: string
    input: string
    expectedOutput: string
    isHidden: boolean
}

export type Example = {
    id: string
    input: string
    expected_output: string
}

export type ProblemForm = {
    title: string
    description: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    topic: string
    starter_code: string
    starter_code_java?: string
    function_name: string
    hints: string[]
    time_limit: number
    memory_limit: number
    check_correctness: boolean
    check_efficiency: boolean
    examples: Example[]
}
