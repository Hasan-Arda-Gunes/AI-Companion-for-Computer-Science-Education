import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from './AuthGuards'
import { RoleBasedRoute } from './RoleGuards'
import { CodeLabPage } from './pages/CodeLabPage'
import { CreateQuestionPage } from './pages/CreateQuestionPage'
import { InstructorDashboardPage } from './pages/InstructorDashboardPage'
import { LoginPage } from './pages/LoginPage'
import { ProblemsPage } from './pages/ProblemsPage'
import { QuestionBankPage } from './pages/QuestionBankPage'
import { RegisterPage } from './pages/RegisterPage'
import { StudentDashboardPage } from './pages/StudentDashboardPage'
import { StudentCreateQuestionTempPage } from './pages/StudentCreateQuestionTempPage'
import { SettingsPage } from './pages/SettingsPage'
import { UnauthorizedPage } from './pages/UnauthorizedPage'

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Student Routes */}
            <Route
                path="/student/dashboard"
                element={
                    <ProtectedRoute>
                        <RoleBasedRoute requiredRoles={['student']}>
                            <StudentDashboardPage />
                        </RoleBasedRoute>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student/problems"
                element={
                    <ProtectedRoute>
                        <RoleBasedRoute requiredRoles={['student']}>
                            <ProblemsPage />
                        </RoleBasedRoute>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student/create-question"
                element={
                    <ProtectedRoute>
                        <RoleBasedRoute requiredRoles={['student']}>
                            <StudentCreateQuestionTempPage />
                        </RoleBasedRoute>
                    </ProtectedRoute>
                }
            />


            {/* Teacher/Instructor Routes */}
            <Route
                path="/instructor/dashboard"
                element={
                    <ProtectedRoute>
                        <RoleBasedRoute requiredRoles={['teacher']}>
                            <InstructorDashboardPage />
                        </RoleBasedRoute>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/instructor/question-bank"
                element={
                    <ProtectedRoute>
                        <RoleBasedRoute requiredRoles={['teacher']}>
                            <QuestionBankPage />
                        </RoleBasedRoute>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/instructor/create-question"
                element={
                    <ProtectedRoute>
                        <RoleBasedRoute requiredRoles={['teacher']}>
                            <CreateQuestionPage />
                        </RoleBasedRoute>
                    </ProtectedRoute>
                }
            />

            {/* Shared Routes (both roles) */}
            <Route
                path="/code-lab"
                element={
                    <ProtectedRoute>
                        <CodeLabPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/settings"
                element={
                    <ProtectedRoute>
                        <SettingsPage />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}
