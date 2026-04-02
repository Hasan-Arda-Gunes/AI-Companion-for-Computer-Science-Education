import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from './AuthGuards'
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
            <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
            <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboardPage /></ProtectedRoute>} />
            <Route path="/instructor/dashboard" element={<ProtectedRoute><InstructorDashboardPage /></ProtectedRoute>} />
            <Route path="/code-lab" element={<ProtectedRoute><CodeLabPage /></ProtectedRoute>} />
            <Route path="/instructor/question-bank" element={<ProtectedRoute><QuestionBankPage /></ProtectedRoute>} />
            <Route path="/instructor/create-question" element={<ProtectedRoute><CreateQuestionPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}
