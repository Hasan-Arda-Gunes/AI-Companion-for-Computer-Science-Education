/**
 * AI Service Types - Supports both Gemini and Ollama providers
 */

// Provider types
export type LLMProvider = 'gemini' | 'ollama'

// Base request type with provider support
type BaseAIRequest = {
    provider?: LLMProvider
}

// Existing types with provider support
export type RequestHintRequest = {
    problem_id: number
    session_id: number
    current_code: string
    hint_level: number
} & BaseAIRequest

export type RequestHintResponse = {
    hint: string
    hint_level: number
    remaining_hints: number
}

export type ChatWithAiRequest = {
    message: string
    context?: {
        current_code?: string
    }
} & BaseAIRequest

export type ChatWithAiResponse = {
    response: string
}

export type ExplainErrorRequest = {
    error_message: string
    code: string
} & BaseAIRequest

export type ExplainErrorResponse = {
    explanation?: string
    response?: string
}

// Instructor AI Types
export type GenerateQuestionVariationRequest = {
    reference_question_ids: number[]
    variation_type: 'difficulty' | 'constraints' | 'wording'
    additional_constraints?: string
    provider?: LLMProvider
}

export type GenerateQuestionFromStyleRequest = {
    reference_question_ids: number[]
    new_topic: string
    new_difficulty?: 'easy' | 'medium' | 'hard'
    provider?: LLMProvider
}

export type GenerateQuestionFromConstraintsRequest = {
    constraints: string
    topics: string[]
    difficulty: 'easy' | 'medium' | 'hard'
    provider?: LLMProvider
}

export type EvaluateQuestionRequest = {
    title: string
    description: string
    examples?: Array<{ input: string; output: string }>
    test_cases?: Array<{ input: string; expected_output: string }>
    provider?: LLMProvider
}

export type EvaluateQuestionResponse = {
    overall_score: number
    clarity: { score: number; feedback: string }
    completeness: { score: number; feedback: string }
    testability: { score: number; feedback: string }
    suggestions: string[]
}

export type GenerateTestCasesRequest = {
    question_description: string
    constraints: string
    examples?: Array<{ input: string; output: string }>
    difficulty: 'easy' | 'medium' | 'hard'
    provider?: LLMProvider
}

export type GenerateTestCasesResponse = {
    test_cases: Array<{
        input: string
        expected_output: string
        explanation?: string
    }>
}

export type EvaluateTestCasesRequest = {
    question_description: string
    test_cases: Array<{ input: string; expected_output: string }>
    provider?: LLMProvider
}

export type EvaluateTestCasesResponse = {
    coverage_score: number
    edge_cases: string[]
    suggestions: string[]
    missing_cases?: string[]
}

export type InstructorChatRequest = {
    message: string
    context?: {
        current_question?: {
            title?: string
            description?: string
        }
        referenced_questions?: Array<{ id: number; title: string }>
        test_cases?: Array<{ input: string; expected_output: string }>
    }
} & BaseAIRequest

export type InstructorChatResponse = {
    response: string
}
