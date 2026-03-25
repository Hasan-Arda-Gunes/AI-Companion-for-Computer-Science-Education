import { Navigate, Route, Routes } from 'react-router-dom'
import { CodeLabPage } from './pages/CodeLabPage'
import { CreateQuestionPage } from './pages/CreateQuestionPage'
import { InstructorDashboardPage } from './pages/InstructorDashboardPage'
import { LoginPage } from './pages/LoginPage'
import { QuestionBankPage } from './pages/QuestionBankPage'
import { RegisterPage } from './pages/RegisterPage'
import { StudentDashboardPage } from './pages/StudentDashboardPage'

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/student/dashboard" element={<StudentDashboardPage />} />
            <Route path="/instructor/dashboard" element={<InstructorDashboardPage />} />
            <Route path="/code-lab" element={<CodeLabPage />} />
            <Route path="/instructor/question-bank" element={<QuestionBankPage />} />
            <Route path="/instructor/create-question" element={<CreateQuestionPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}
