import { DashboardLayout } from '../../../components/layout/DashboardLayout'

export function CreateQuestionPage() {
    return (
        <DashboardLayout
            title="Create Question"
            subtitle="Instructor authoring surface for composing, categorizing, and previewing new questions."
        >
            <article className="rounded-xl border border-border bg-card p-5">
                <form className="grid gap-4 lg:grid-cols-2">
                    <label className="block space-y-2 lg:col-span-2">
                        <span className="text-sm text-muted-foreground">Question Title</span>
                        <input className="w-full rounded-lg border border-input bg-input-background px-3 py-2 text-sm" placeholder="Example: Merge Intervals" />
                    </label>

                    <label className="block space-y-2">
                        <span className="text-sm text-muted-foreground">Difficulty</span>
                        <select className="w-full rounded-lg border border-input bg-input-background px-3 py-2 text-sm">
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                        </select>
                    </label>

                    <label className="block space-y-2">
                        <span className="text-sm text-muted-foreground">Subject</span>
                        <select className="w-full rounded-lg border border-input bg-input-background px-3 py-2 text-sm">
                            <option>Arrays</option>
                            <option>Linked Lists</option>
                            <option>Graphs</option>
                        </select>
                    </label>

                    <label className="block space-y-2 lg:col-span-2">
                        <span className="text-sm text-muted-foreground">Prompt</span>
                        <textarea className="h-40 w-full rounded-lg border border-input bg-input-background px-3 py-2 text-sm" placeholder="Describe the question and constraints." />
                    </label>

                    <label className="block space-y-2 lg:col-span-2">
                        <span className="text-sm text-muted-foreground">Hidden Test Cases</span>
                        <textarea className="h-28 w-full rounded-lg border border-input bg-input-background px-3 py-2 text-sm" placeholder="Static placeholder for hidden tests." />
                    </label>

                    <div className="lg:col-span-2 flex flex-wrap gap-3">
                        <button type="button" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                            Save Draft
                        </button>
                        <button type="button" className="rounded-lg border border-border px-4 py-2 text-sm">
                            Publish
                        </button>
                    </div>
                </form>
            </article>
        </DashboardLayout>
    )
}
