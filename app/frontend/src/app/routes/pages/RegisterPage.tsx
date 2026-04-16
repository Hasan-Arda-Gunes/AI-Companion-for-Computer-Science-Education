import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RegisterView } from '../../../components/auth/RegisterView'
import { registerUser } from '../../../features/auth/api/authApi'
import type { UserRole } from '../../../features/auth/types'

export function RegisterPage() {
    const navigate = useNavigate()
    const [fullName, setFullName] = useState('')
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<UserRole>('student')
    const [errorMessage, setErrorMessage] = useState<string>()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleRegister = async () => {
        if (!fullName || !username || !email || !password) {
            setErrorMessage('Please complete all fields.')
            return
        }

        setErrorMessage(undefined)
        setIsSubmitting(true)

        try {
            await registerUser({
                email,
                username,
                password,
                full_name: fullName,
                role,
            })

            navigate('/login', {
                replace: true,
                state: { notice: 'Registration successful. Please sign in.' },
            })
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Registration failed.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <RegisterView
            fullName={fullName}
            username={username}
            email={email}
            password={password}
            role={role}
            errorMessage={errorMessage}
            isSubmitting={isSubmitting}
            onFullNameChange={setFullName}
            onUsernameChange={setUsername}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onRoleChange={setRole}
            onSubmit={handleRegister}
        />
    )
}
