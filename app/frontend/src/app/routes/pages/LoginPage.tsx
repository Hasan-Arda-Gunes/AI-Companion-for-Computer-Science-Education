import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LoginView } from '../../../components/auth/LoginView'
import { loginUser } from '../../../features/auth/api/authApi'
import { useAuthSession } from '../../../features/auth/context/useAuthSession'
import { saveAuthToken } from '../../../features/auth/storage/authStorage'

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
            const loginResponse = await loginUser({ email, password })
            saveAuthToken(loginResponse.access_token, loginResponse.token_type)
            await refreshSession()
            navigate('/student/dashboard', { replace: true })
        } catch (error) {
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
