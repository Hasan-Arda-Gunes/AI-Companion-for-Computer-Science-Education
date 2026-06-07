/**
 * QuickActions Component
 * Provides quick action buttons for common AI-assisted question creation tasks
 */

import { useState } from 'react'
import type { QuestionFormData, QuickActionType } from './types'
import styles from './QuickActions.module.css'

interface QuickActionsProps {
    onAction: (
        actionType: QuickActionType,
        context: {
            currentQuestion?: Partial<QuestionFormData>
            selectedReferences?: number[]
        }
    ) => Promise<void>
    currentQuestion?: Partial<QuestionFormData>
    hasReferences: boolean
    onOpenReferenceSelector: () => void
}

export function QuickActions({
    onAction,
    currentQuestion,
    hasReferences,
    onOpenReferenceSelector,
}: QuickActionsProps) {
    const [loadingAction, setLoadingAction] = useState<QuickActionType | null>(null)

    const handleAction = async (actionType: QuickActionType) => {
        setLoadingAction(actionType)
        try {
            await onAction(actionType, {
                currentQuestion,
                selectedReferences: hasReferences ? [] : undefined,
            })
        } finally {
            setLoadingAction(null)
        }
    }

    const actions: Array<{
        id: QuickActionType
        label: string
        icon: string
        description: string
        requiresReferences: boolean
    }> = [
        {
            id: 'variation',
            label: 'Create Variation',
            icon: '🔄',
            description: 'Generate from reference question(s)',
            requiresReferences: true,
        },
        {
            id: 'similar-style',
            label: 'Similar Style',
            icon: '✨',
            description: 'Different topic, same approach',
            requiresReferences: true,
        },
        {
            id: 'from-constraints',
            label: 'From Constraints',
            icon: '⚙️',
            description: 'Create based on requirements',
            requiresReferences: false,
        },
        {
            id: 'evaluate-question',
            label: 'Evaluate',
            icon: '📊',
            description: 'Analyze clarity & completeness',
            requiresReferences: false,
        },
        {
            id: 'generate-test-cases',
            label: 'Gen Test Cases',
            icon: '✓',
            description: 'Create comprehensive test cases',
            requiresReferences: false,
        },
        {
            id: 'evaluate-test-cases',
            label: 'Eval Tests',
            icon: '🔍',
            description: 'Check coverage & edge cases',
            requiresReferences: false,
        },
    ]

    return (
        <div className={styles.quickActionsContainer}>
            <div className={styles.header}>
                <h3>Quick Actions</h3>
                {hasReferences && <span className={styles.badge}>References Selected</span>}
            </div>

            <div className={styles.actionsGrid}>
                {actions.map((action) => {
                    const isDisabled = action.requiresReferences && !hasReferences
                    const isLoading = loadingAction === action.id

                    return (
                        <button
                            key={action.id}
                            className={`${styles.actionButton} ${isDisabled ? styles.disabled : ''} ${isLoading ? styles.loading : ''}`}
                            onClick={() => {
                                if (action.requiresReferences && !hasReferences) {
                                    onOpenReferenceSelector()
                                } else {
                                    handleAction(action.id)
                                }
                            }}
                            disabled={isLoading}
                            title={action.description}
                        >
                            <div className={styles.icon}>{action.icon}</div>
                            <div className={styles.label}>{action.label}</div>
                            {isLoading && <div className={styles.spinner} />}
                        </button>
                    )
                })}
            </div>

            <div className={styles.info}>
                <p>💡 Click any action or use the chat for more customization</p>
            </div>
        </div>
    )
}
