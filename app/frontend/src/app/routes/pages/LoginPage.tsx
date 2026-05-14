import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LoginView } from '../../../components/auth/LoginView'
import { loginUser, getCurrentUser } from '../../../features/auth/api/authApi'
import { useAuthSession } from '../../../features/auth/context/useAuthSession'
import { saveAuthToken, getAuthToken } from '../../../features/auth/storage/authStorage'

export function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { refreshSession } = useAuthSession()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState<string>()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const noticeMessage = (location.state as { notice?: string } | null)?.notice

    const handleLogin = async () => {
        if (!email || !password) {
            setErrorMessage('Please fill in email and password.')
            return
        }

        setErrorMessage(undefined)
        setIsSubmitting(true)

        try {
            console.log('[LoginPage] Starting login...')
            const loginResponse = await loginUser({ email, password })
            console.log('[LoginPage] Login successful, saving token...')
            saveAuthToken(loginResponse.access_token, loginResponse.token_type)

            console.log('[LoginPage] Fetching current user...')
            const { accessToken, tokenType } = getAuthToken()
            if (!accessToken) {
                throw new Error('Failed to retrieve auth token')
            }
            const user = await getCurrentUser(accessToken, tokenType)
            console.log('[LoginPage] User loaded, role:', user.role)

            // Refresh session in the background (for context updates)
            void refreshSession()

            // Route immediately based on user role
            if (user.role === 'teacher') {
                console.log('[LoginPage] Routing teacher to /instructor/dashboard')
                navigate('/instructor/dashboard', { replace: true })
            } else {
                console.log('[LoginPage] Routing student to /student/dashboard')
                navigate('/student/dashboard', { replace: true })
            }
        } catch (error) {
            console.log('[LoginPage] Login error:', error)
            setErrorMessage(error instanceof Error ? error.message : 'Login failed.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <LoginView
            email={email}
            password={password}
            errorMessage={errorMessage}
            noticeMessage={noticeMessage}
            isSubmitting={isSubmitting}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleLogin}
        />
    )
}
