import { DashboardLayout } from '../../../components/layout/DashboardLayout'

export function StudentDashboardPage() {
    return (
        <DashboardLayout
            title="Student Dashboard"
            subtitle="Track your learning journey across topics and continue your evolution path."
        >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {['Solved Today', 'Current Streak', 'Avg. Hint Depth', 'Focus Topic'].map((card) => (
                    <article key={card} className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Metric</p>
                        <h2 className="mt-2 text-lg font-medium">{card}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">Static placeholder for Figma data card.</p>
                    </article>
                ))}
            </div>

            <article className="mt-6 rounded-xl border border-border bg-card p-5">
                <h3 className="text-lg font-medium">Progress by Subject</h3>
                <p className="mt-2 text-sm text-muted-foreground">Arrays, Linked Lists, Graphs and other subjects will be visualized here.</p>
                <div className="mt-4 h-40 rounded-lg border border-dashed border-border bg-background" />
            </article>
        </DashboardLayout>
    )
}
