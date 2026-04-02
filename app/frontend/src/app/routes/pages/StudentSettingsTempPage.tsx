import { useState } from 'react'
import { StudentLayout } from '../../../components/layout/StudentLayout'
import {
    AVAILABLE_EDITOR_LANGUAGES,
    type EditorLanguageId,
    getDefaultEditorLanguage,
    setDefaultEditorLanguage,
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

export function StudentSettingsTempPage() {
    const [defaultLanguage, setDefaultLanguage] = useState<EditorLanguageId>(() => getDefaultEditorLanguage())
    const [savedMessage, setSavedMessage] = useState<string | null>(null)

    const handleSave = () => {
        setDefaultEditorLanguage(defaultLanguage)
        setSavedMessage(`Default language saved as ${languageLabelMap[defaultLanguage]}.`)
    }

    return (
        <StudentLayout
            currentPage="settings"
            title="Settings"
            subtitle="Temporary preferences page for Code Lab editor defaults."
            showHeader={false}
        >
            <div className="space-y-4">
                <section className="rounded-xl border border-border bg-card p-5">
                    <h1 className="text-2xl font-semibold text-foreground">Settings (Temp)</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Configure your default Code Lab language.
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
        </StudentLayout>
    )
}
