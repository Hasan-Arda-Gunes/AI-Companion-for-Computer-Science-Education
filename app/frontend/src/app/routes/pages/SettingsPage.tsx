import { useState } from 'react'
import { useAuthSession } from '../../../features/auth/context/useAuthSession'
import { ROLES } from '../../../features/auth/constants'
import { StudentLayout } from '../../../components/layout/StudentLayout'
import { InstructorLayout } from '../../../components/layout/InstructorLayout'
import {
    AVAILABLE_EDITOR_LANGUAGES,
    AVAILABLE_EDITOR_TAB_SIZES,
    type EditorLanguageId,
    type EditorTabSize,
    getDefaultEditorLanguage,
    getEditorTabSize,
    setDefaultEditorLanguage,
    setEditorTabSize,
} from '../../../features/settings/editorPreferences'

const languageLabelMap: Record<EditorLanguageId, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
    csharp: 'C#',
    go: 'Go',
    rust: 'Rust',
    ruby: 'Ruby',
    php: 'PHP',
}

export function SettingsPage() {
    const { user } = useAuthSession()
    const [defaultLanguage, setDefaultLanguage] = useState<EditorLanguageId>(() => getDefaultEditorLanguage())
    const [tabSize, setTabSize] = useState<EditorTabSize>(() => getEditorTabSize())
    const [savedMessage, setSavedMessage] = useState<string | null>(null)

    const handleSave = () => {
        setDefaultEditorLanguage(defaultLanguage)
        setEditorTabSize(tabSize)
        setSavedMessage(`Saved ${languageLabelMap[defaultLanguage]} with tab size ${tabSize}.`)
    }

    const layoutProps = {
        currentPage: 'settings',
        title: 'Settings',
        subtitle: 'Configure your preferences and editor defaults.',
        showHeader: false,
    }

    const settingsContent = (
        <div className="space-y-4">
            <section className="rounded-xl border border-border bg-card p-5">
                <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Configure your default Code Lab language and other preferences.
                </p>
            </section>

            <section className="rounded-xl border border-border bg-card p-5">
                <div className="max-w-sm space-y-3">
                    <label className="block space-y-2">
                        <span className="text-sm text-muted-foreground">Default Editor Language</span>
                        <select
                            value={defaultLanguage}
                            onChange={(event) => {
                                setDefaultLanguage(event.target.value as EditorLanguageId)
                                setSavedMessage(null)
                            }}
                            className="w-full rounded-lg border border-input bg-input-background px-3 py-2 text-sm"
                        >
                            {AVAILABLE_EDITOR_LANGUAGES.map((languageId) => (
                                <option key={languageId} value={languageId}>
                                    {languageLabelMap[languageId]}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block space-y-2">
                        <span className="text-sm text-muted-foreground">Editor Tab Size</span>
                        <select
                            value={tabSize}
                            onChange={(event) => {
                                setTabSize(Number(event.target.value) as EditorTabSize)
                                setSavedMessage(null)
                            }}
                            className="w-full rounded-lg border border-input bg-input-background px-3 py-2 text-sm"
                        >
                            {AVAILABLE_EDITOR_TAB_SIZES.map((size) => (
                                <option key={size} value={size}>
                                    {size} spaces
                                </option>
                            ))}
                        </select>
                    </label>

                    <button
                        type="button"
                        onClick={handleSave}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                    >
                        Save Preferences
                    </button>

                    {savedMessage ? (
                        <p className="text-sm text-emerald-300">{savedMessage}</p>
                    ) : null}
                </div>
            </section>
        </div>
    )

    // Render appropriate layout based on user role
    if (user?.role === ROLES.TEACHER) {
        return (
            <InstructorLayout {...layoutProps}>
                {settingsContent}
            </InstructorLayout>
        )
    }

    return (
        <StudentLayout {...layoutProps}>
            {settingsContent}
        </StudentLayout>
    )
}
