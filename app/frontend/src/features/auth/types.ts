export type UserRole = 'student' | 'teacher'

export type RegisterRequest = {
    email: string
    username: string
    password: string
    full_name: string
    role: UserRole
}

export type User = {
    id: number
    email: string
    username: string
    full_name: string
    role: UserRole
    is_active: boolean
    created_at: string
}

export type LoginRequest = {
    email: string
    password: string
}

export type LoginResponse = {
    access_token: string
    token_type: string
}
