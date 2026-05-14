/**
 * Types for Instructor Question Creation Components
 */

export type LLMProvider = 'gemini' | 'ollama'

// Chat message type
export type ChatMessage = {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

// Question form data
export type QuestionFormData = {
    title: string
    difficulty: 'easy' | 'medium' | 'hard'
    subject: string
    constraints: string
    examples: Array<{
        id: string
        input: string
        output: string
        explanation?: string
    }>
    prompt: string
    testCases: Array<{
        id: string
        input: string
        expectedOutput: string
        explanation?: string
    }>
    solution?: string
    starterCode?: string
    hints?: string[]
}

// Referenced question
export type ReferencedQuestion = {
    id: number
    title: string
    difficulty?: string
    topic?: string
}

// Referenced test case
export type ReferencedTestCase = {
    id: string
    input: string
    expectedOutput: string
}

// AI Panel state
export type AIPanelState = {
    provider: LLMProvider
    messages: ChatMessage[]
    isLoading: boolean
    referencedQuestions: ReferencedQuestion[]
    selectedReferencedQuestions: number[]
}

// Quick action type
export type QuickActionType =
    | 'variation'
    | 'similar-style'
    | 'from-constraints'
    | 'evaluate-question'
    | 'generate-test-cases'
    | 'evaluate-test-cases'

// Panel resize info
export type PanelResizeInfo = {
    leftWidth: number
    rightWidth: number
    isDragging: boolean
}

// Auto-save info
export type AutoSaveInfo = {
    lastSaved: Date | null
    isSaving: boolean
    isDirty: boolean
}
