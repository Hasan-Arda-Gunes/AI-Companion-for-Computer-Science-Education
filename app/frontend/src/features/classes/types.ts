export type ClassSummary = {
    id: number
    name: string
    description: string
    teacher_id: number
    is_active: boolean
    created_at: string
    updated_at: string | null
    student_count: number
}

export type ClassStudent = {
    id: number
    email: string
    username: string
    full_name: string
    role: 'student'
}

export type ClassDetails = ClassSummary & {
    students: ClassStudent[]
}

export type CreateClassRequest = {
    name: string
    description: string
}

export type AddStudentToClassRequest = {
    student_id: number
}

export type AddStudentToClassResponse = {
    class_id: number
    student: ClassStudent
    added_at: string
}
