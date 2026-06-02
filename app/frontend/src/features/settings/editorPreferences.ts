export const DEFAULT_EDITOR_LANGUAGE_STORAGE_KEY = 'codelab.defaultLanguage'
export const DEFAULT_EDITOR_TAB_SIZE_STORAGE_KEY = 'codelab.tabSize'

export const AVAILABLE_EDITOR_LANGUAGES = [
    'python',
    'java'
] as const

export type EditorLanguageId = (typeof AVAILABLE_EDITOR_LANGUAGES)[number]

export const FALLBACK_EDITOR_LANGUAGE: EditorLanguageId = 'python'
export const AVAILABLE_EDITOR_TAB_SIZES = [2, 4, 8] as const
export type EditorTabSize = (typeof AVAILABLE_EDITOR_TAB_SIZES)[number]
export const FALLBACK_EDITOR_TAB_SIZE: EditorTabSize = 2

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

export function getEditorTabSize(): EditorTabSize {
    if (typeof window === 'undefined') {
        return FALLBACK_EDITOR_TAB_SIZE
    }

    const stored = window.localStorage.getItem(DEFAULT_EDITOR_TAB_SIZE_STORAGE_KEY)
    const parsed = stored ? Number(stored) : NaN

    if (AVAILABLE_EDITOR_TAB_SIZES.includes(parsed as EditorTabSize)) {
        return parsed as EditorTabSize
    }

    return FALLBACK_EDITOR_TAB_SIZE
}

export function setEditorTabSize(tabSize: EditorTabSize) {
    if (typeof window === 'undefined') {
        return
    }

    window.localStorage.setItem(DEFAULT_EDITOR_TAB_SIZE_STORAGE_KEY, String(tabSize))
}
