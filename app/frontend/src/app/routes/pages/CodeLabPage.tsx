import { StudentLayout } from '../../../components/layout/StudentLayout'
import { AiPanel } from '../../../components/panels/AiPanel'

export function CodeLabPage() {
    return (
        <StudentLayout
            currentPage="codelab"
            title="Code Lab"
            subtitle="Practice in a focused environment with real-time execution placeholders and AI guidance panel."
        >
            <div className="flex flex-col gap-6 xl:flex-row">
                <section className="flex-1 rounded-xl border border-border bg-card p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Workspace</p>
                            <h2 className="mt-1 text-lg font-medium">Editor</h2>
                        </div>
                        <div className="flex gap-2">
                            <button type="button" className="rounded-lg border border-border px-3 py-2 text-sm">
                                Python
                            </button>
                            <button type="button" className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                                Run
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 h-96 rounded-lg border border-dashed border-border bg-background p-4">
                        <p className="text-sm text-muted-foreground">Code editor design placeholder.</p>
                    </div>

                    <div className="mt-4 rounded-lg border border-border bg-background p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Execution Output</p>
                        <p className="mt-2 text-sm text-muted-foreground">Compile/run result area placeholder.</p>
                    </div>
                </section>

                <AiPanel />
            </div>
        </StudentLayout>
    )
}
