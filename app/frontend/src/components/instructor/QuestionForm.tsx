/**
 * QuestionForm Component
 * Form for creating and editing instructor questions with auto-save
 */

import React, { useState, useCallback, useEffect } from 'react'
import type { QuestionFormData } from './types'
import styles from './QuestionForm.module.css'

interface QuestionFormProps {
    data: Partial<QuestionFormData>
    onChange: (data: Partial<QuestionFormData>) => void
    onAutoSave?: (data: Partial<QuestionFormData>) => Promise<void>
    autoSaveInterval?: number // milliseconds
    isSaving?: boolean
    lastSaved?: Date | null
}

export function QuestionForm({
    data,
    onChange,
    onAutoSave,
    autoSaveInterval = 30000, // 30 seconds
    isSaving = false,
    lastSaved = null,
}: QuestionFormProps) {
    const [isDirty, setIsDirty] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)

    // Auto-save effect
    useEffect(() => {
        if (!isDirty || !onAutoSave) return

        const timer = setTimeout(async () => {
            try {
                setSaveError(null)
                await onAutoSave(data)
                setIsDirty(false)
            } catch (error) {
                setSaveError(error instanceof Error ? error.message : 'Auto-save failed')
            }
        }, autoSaveInterval)

        return () => clearTimeout(timer)
    }, [isDirty, data, onAutoSave, autoSaveInterval])

    const handleChange = useCallback(
        (updates: Partial<QuestionFormData>) => {
            onChange(updates)
            setIsDirty(true)
        },
        [onChange]
    )

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange({ title: e.target.value })
    }

    const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        handleChange({ difficulty: e.target.value as 'easy' | 'medium' | 'hard' })
    }

    const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange({ subject: e.target.value })
    }

    const handleConstraintsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        handleChange({ constraints: e.target.value })
    }

    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        handleChange({ prompt: e.target.value })
    }

    const handleAddExample = () => {
        const newExample = {
            id: Math.random().toString(36).substr(2, 9),
            input: '',
            output: '',
        }
        handleChange({
            examples: [...(data.examples ?? []), newExample],
        })
    }

    const handleUpdateExample = (
        id: string,
        field: 'input' | 'output' | 'explanation',
        value: string
    ) => {
        const updated = data.examples?.map((ex) =>
            ex.id === id ? { ...ex, [field]: value } : ex
        )
        handleChange({ examples: updated })
    }

    const handleRemoveExample = (id: string) => {
        const filtered = data.examples?.filter((ex) => ex.id !== id)
        handleChange({ examples: filtered })
    }

    const handleAddTestCase = () => {
        const newTestCase = {
            id: Math.random().toString(36).substr(2, 9),
            input: '',
            expectedOutput: '',
        }
        handleChange({
            testCases: [...(data.testCases ?? []), newTestCase],
        })
    }

    const handleUpdateTestCase = (
        id: string,
        field: 'input' | 'expectedOutput' | 'explanation',
        value: string
    ) => {
        const updated = data.testCases?.map((tc) =>
            tc.id === id ? { ...tc, [field]: value } : tc
        )
        handleChange({ testCases: updated })
    }

    const handleRemoveTestCase = (id: string) => {
        const filtered = data.testCases?.filter((tc) => tc.id !== id)
        handleChange({ testCases: filtered })
    }

    return (
        <div className={styles.formContainer}>
            {/* Header with save status */}
            <div className={styles.formHeader}>
                <h2>Create Question</h2>
                <div className={styles.saveStatus}>
                    {isSaving && <span className={styles.saving}>💾 Saving...</span>}
                    {lastSaved && !isSaving && (
                        <span className={styles.saved}>✓ Saved</span>
                    )}
                    {saveError && (
                        <span className={styles.error} title={saveError}>
                            ⚠ Error
                        </span>
                    )}
                    {isDirty && (
                        <span className={styles.unsaved}>● Unsaved</span>
                    )}
                </div>
            </div>

            {/* Basic Info Section */}
            <section className={styles.section}>
                <h3>Basic Information</h3>

                <div className={styles.formGroup}>
                    <label htmlFor="title">Title *</label>
                    <input
                        id="title"
                        type="text"
                        value={data.title ?? ''}
                        onChange={handleTitleChange}
                        placeholder="Enter question title (e.g., 'Two Sum')"
                        className={styles.input}
                    />
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="difficulty">Difficulty *</label>
                        <select
                            id="difficulty"
                            value={data.difficulty ?? 'easy'}
                            onChange={handleDifficultyChange}
                            className={styles.select}
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="subject">Subject/Topic *</label>
                        <input
                            id="subject"
                            type="text"
                            value={data.subject ?? ''}
                            onChange={handleSubjectChange}
                            placeholder="e.g., Arrays, Sorting, Dynamic Programming"
                            className={styles.input}
                        />
                    </div>
                </div>
            </section>

            {/* Problem Description */}
            <section className={styles.section}>
                <h3>Problem Description</h3>

                <div className={styles.formGroup}>
                    <label htmlFor="constraints">Constraints</label>
                    <textarea
                        id="constraints"
                        value={data.constraints ?? ''}
                        onChange={handleConstraintsChange}
                        placeholder="Define constraints and limitations (e.g., array length, time complexity)"
                        className={styles.textarea}
                        rows={4}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="prompt">Prompt *</label>
                    <textarea
                        id="prompt"
                        value={data.prompt ?? ''}
                        onChange={handlePromptChange}
                        placeholder="Complete problem statement and requirements"
                        className={styles.textarea}
                        rows={6}
                    />
                </div>
            </section>

            {/* Examples Section */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3>Examples</h3>
                    <button onClick={handleAddExample} className={styles.addButton} title="Add example">
                        + Add Example
                    </button>
                </div>

                {data.examples && data.examples.length > 0 ? (
                    <div className={styles.examplesList}>
                        {data.examples.map((example, idx) => (
                            <div key={example.id} className={styles.exampleItem}>
                                <div className={styles.exampleNumber}>Example {idx + 1}</div>

                                <textarea
                                    value={example.input}
                                    onChange={(e) =>
                                        handleUpdateExample(example.id, 'input', e.target.value)
                                    }
                                    placeholder="Input"
                                    className={styles.exampleInput}
                                    rows={2}
                                />

                                <textarea
                                    value={example.output}
                                    onChange={(e) =>
                                        handleUpdateExample(example.id, 'output', e.target.value)
                                    }
                                    placeholder="Output"
                                    className={styles.exampleOutput}
                                    rows={2}
                                />

                                {example.explanation && (
                                    <textarea
                                        value={example.explanation}
                                        onChange={(e) =>
                                            handleUpdateExample(
                                                example.id,
                                                'explanation',
                                                e.target.value
                                            )
                                        }
                                        placeholder="Explanation (optional)"
                                        className={styles.exampleExplanation}
                                        rows={2}
                                    />
                                )}

                                <button
                                    onClick={() => handleRemoveExample(example.id)}
                                    className={styles.removeButton}
                                    title="Remove example"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>No examples yet. Add one to get started!</div>
                )}
            </section>

            {/* Test Cases Section */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3>Test Cases</h3>
                    <button onClick={handleAddTestCase} className={styles.addButton} title="Add test case">
                        + Add Test Case
                    </button>
                </div>

                {data.testCases && data.testCases.length > 0 ? (
                    <div className={styles.testCasesList}>
                        {data.testCases.map((tc, idx) => (
                            <div key={tc.id} className={styles.testCaseItem}>
                                <div className={styles.testCaseNumber}>Test Case {idx + 1}</div>

                                <textarea
                                    value={tc.input}
                                    onChange={(e) =>
                                        handleUpdateTestCase(tc.id, 'input', e.target.value)
                                    }
                                    placeholder="Input"
                                    className={styles.testCaseInput}
                                    rows={2}
                                />

                                <textarea
                                    value={tc.expectedOutput}
                                    onChange={(e) =>
                                        handleUpdateTestCase(tc.id, 'expectedOutput', e.target.value)
                                    }
                                    placeholder="Expected Output"
                                    className={styles.testCaseOutput}
                                    rows={2}
                                />

                                <button
                                    onClick={() => handleRemoveTestCase(tc.id)}
                                    className={styles.removeButton}
                                    title="Remove test case"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>No test cases yet. Add some to validate solutions!</div>
                )}
            </section>

            {/* Additional Fields */}
            <section className={styles.section}>
                <h3>Optional Fields</h3>

                <div className={styles.formGroup}>
                    <label htmlFor="starterCode">Starter Code</label>
                    <textarea
                        id="starterCode"
                        value={data.starterCode ?? ''}
                        onChange={(e) => handleChange({ starterCode: e.target.value })}
                        placeholder="Provide starter code template for students"
                        className={styles.textarea}
                        rows={4}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="solution">Solution</label>
                    <textarea
                        id="solution"
                        value={data.solution ?? ''}
                        onChange={(e) => handleChange({ solution: e.target.value })}
                        placeholder="Reference solution (for instructors only)"
                        className={styles.textarea}
                        rows={4}
                    />
                </div>
            </section>
        </div>
    )
}
