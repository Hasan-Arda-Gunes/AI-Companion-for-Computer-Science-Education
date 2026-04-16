/**
 * Auto-save utility for question creation
 * Handles debounced saving of form data
 */

type SaveCallback<T> = (data: T) => Promise<void>

export class AutoSaveManager<T> {
    saveTimer: ReturnType<typeof setTimeout> | null = null
    isSaving = false
    lastSaved: Date | null = null
    saveError: Error | null = null
    saveCallback: SaveCallback<T>
    debounceMs: number

    constructor(saveCallback: SaveCallback<T>, debounceMs: number = 30000) {
        this.saveCallback = saveCallback
        this.debounceMs = debounceMs
    }

    /**
     * Mark data as dirty and schedule save
     */
    markDirty(data: T) {
        // Cancel previous timer
        if (this.saveTimer) {
            clearTimeout(this.saveTimer)
        }

        // Schedule new save
        this.saveTimer = setTimeout(() => {
            this.save(data)
        }, this.debounceMs)
    }

    /**
     * Cancel pending save
     */
    cancel() {
        if (this.saveTimer) {
            clearTimeout(this.saveTimer)
            this.saveTimer = null
        }
    }

    /**
     * Save immediately
     */
    async save(data: T) {
        if (this.isSaving) return

        this.isSaving = true
        this.saveError = null

        try {
            await this.saveCallback(data)
            this.lastSaved = new Date()
        } catch (error) {
            this.saveError = error instanceof Error ? error : new Error('Save failed')
            throw this.saveError
        } finally {
            this.isSaving = false
            this.saveTimer = null
        }
    }

    /**
     * Get current state
     */
    getState() {
        return {
            isSaving: this.isSaving,
            lastSaved: this.lastSaved,
            error: this.saveError,
        }
    }

    /**
     * Reset all state
     */
    reset() {
        this.cancel()
        this.isSaving = false
        this.lastSaved = null
        this.saveError = null
    }
}

/**
 * Hook-like utility for managing form auto-save
 */
export function createAutoSaver<T>(
    saveCallback: SaveCallback<T>,
    debounceMs: number = 30000
) {
    let manager: AutoSaveManager<T> | null = null

    return {
        init: () => {
            manager = new AutoSaveManager(saveCallback, debounceMs)
            return manager
        },
        getManager: () => manager,
        dispose: () => {
            manager?.reset()
            manager = null
        },
    }
}
