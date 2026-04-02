export const DEFAULT_EDITOR_LANGUAGE_STORAGE_KEY = 'codelab.defaultLanguage'

export const AVAILABLE_EDITOR_LANGUAGES = [
    'javascript',
    'typescript',
    'python',
    'java',
    'cpp',
    'csharp',
    'go',
    'rust',
    'ruby',
    'php',
] as const

export type EditorLanguageId = (typeof AVAILABLE_EDITOR_LANGUAGES)[number]

export const FALLBACK_EDITOR_LANGUAGE: EditorLanguageId = 'python'

export function getDefaultEditorLanguage(): EditorLanguageId {
    if (typeof window === 'undefined') {
        return FALLBACK_EDITOR_LANGUAGE
    }

    const stored = window.localStorage.getItem(DEFAULT_EDITOR_LANGUAGE_STORAGE_KEY)

    if (!stored) {
        return FALLBACK_EDITOR_LANGUAGE
    }

    if (AVAILABLE_EDITOR_LANGUAGES.includes(stored as EditorLanguageId)) {
        return stored as EditorLanguageId
    }

    return FALLBACK_EDITOR_LANGUAGE
}

export function setDefaultEditorLanguage(languageId: EditorLanguageId) {
    if (typeof window === 'undefined') {
        return
    }

    window.localStorage.setItem(DEFAULT_EDITOR_LANGUAGE_STORAGE_KEY, languageId)
}
