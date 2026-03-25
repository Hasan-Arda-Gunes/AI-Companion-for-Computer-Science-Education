export function AiPanel() {
    return (
        <aside className="w-full rounded-xl border border-border bg-card p-5 lg:w-[360px]">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">AI Mentor Panel</p>
            <h2 className="mt-2 text-lg font-medium">Socratic Guidance</h2>
            <p className="mt-2 text-sm text-muted-foreground">
                This panel is a static design placeholder for hint prompts, reasoning checkpoints, and
                evolution advice.
            </p>

            <div className="mt-6 space-y-3">
                <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs text-muted-foreground">Hint Type</p>
                    <p className="mt-1 text-sm">Conceptual Nudge</p>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs text-muted-foreground">Focus Area</p>
                    <p className="mt-1 text-sm">Time Complexity</p>
                </div>
                <button
                    type="button"
                    className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                    Request Socratic Hint
                </button>
            </div>
        </aside>
    )
}
