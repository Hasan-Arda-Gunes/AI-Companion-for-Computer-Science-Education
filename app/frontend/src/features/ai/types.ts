export type RequestHintRequest = {
    problem_id: number
    session_id: number
    current_code: string
    hint_level: number
}

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
}

export type ChatWithAiResponse = {
    response: string
}

export type ExplainErrorRequest = {
    error_message: string
    code: string
}

export type ExplainErrorResponse = {
    explanation?: string
    response?: string
}
