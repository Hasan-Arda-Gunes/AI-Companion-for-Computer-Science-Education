const ACCESS_TOKEN_KEY = 'auth.accessToken'
const TOKEN_TYPE_KEY = 'auth.tokenType'

export function saveAuthToken(accessToken: string, tokenType: string) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    window.localStorage.setItem(TOKEN_TYPE_KEY, tokenType)
}

export function getAuthToken() {
    return {
        accessToken: window.localStorage.getItem(ACCESS_TOKEN_KEY),
        tokenType: window.localStorage.getItem(TOKEN_TYPE_KEY) ?? 'bearer',
    }
}

export function clearAuthToken() {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY)
    window.localStorage.removeItem(TOKEN_TYPE_KEY)
}
