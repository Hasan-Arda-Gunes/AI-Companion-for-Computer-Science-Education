import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from './AuthGuards'
import { CodeLabPage } from './pages/CodeLabPage'
import { CreateQuestionPage } from './pages/CreateQuestionPage'
import { InstructorDashboardPage } from './pages/InstructorDashboardPage'
import { LoginPage } from './pages/LoginPage'
import { ProblemsPage } from './pages/ProblemsPage'
import { QuestionBankPage } from './pages/QuestionBankPage'
import { RegisterPage } from './pages/RegisterPage'
import { StudentDashboardPage } from './pages/StudentDashboardPage'
import { StudentCreateQuestionTempPage } from './pages/StudentCreateQuestionTempPage'
import { StudentSettingsTempPage } from './pages/StudentSettingsTempPage'

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
            <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboardPage /></ProtectedRoute>} />
            <Route path="/student/problems" element={<ProtectedRoute><ProblemsPage /></ProtectedRoute>} />
            <Route path="/student/create-question" element={<ProtectedRoute><StudentCreateQuestionTempPage /></ProtectedRoute>} />
            <Route path="/student/settings" element={<ProtectedRoute><StudentSettingsTempPage /></ProtectedRoute>} />
            <Route path="/instructor/dashboard" element={<ProtectedRoute><InstructorDashboardPage /></ProtectedRoute>} />
            <Route path="/code-lab" element={<ProtectedRoute><CodeLabPage /></ProtectedRoute>} />
            <Route path="/instructor/question-bank" element={<ProtectedRoute><QuestionBankPage /></ProtectedRoute>} />
            <Route path="/instructor/create-question" element={<ProtectedRoute><CreateQuestionPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}
