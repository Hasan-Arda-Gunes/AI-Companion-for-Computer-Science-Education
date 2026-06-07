import { StudentLayout } from '../../../components/layout/StudentLayout'
import { motion } from 'motion/react'
import {
    Calendar,
    CheckCircle2,
    Code2,
    Sparkles,
    Target,
    TrendingUp,
    Trophy,
    Zap,
} from 'lucide-react'
import {
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
} from 'recharts'
import { useAuthSession } from '../../../features/auth/context/useAuthSession'

type Milestone = {
    id: string
    title: string
    status: 'completed' | 'locked' | 'current'
}

type EvolutionHistory = {
    id: string
    problemName: string
    initialComplexity: string
    evolvedComplexity: string
    date: string
    improvement: string
}

export function StudentDashboardPage() {
    const { user } = useAuthSession()
    const displayName = user?.full_name?.trim() || user?.username || 'Learner'

    const proficiencyData = [
        { subject: 'Correctness', value: 85, fullMark: 100 },
        { subject: 'Efficiency', value: 72, fullMark: 100 },
        { subject: 'Cleanliness', value: 90, fullMark: 100 },
        { subject: 'Logic', value: 78, fullMark: 100 },
        { subject: 'Speed', value: 65, fullMark: 100 },
    ]

    const milestones: Milestone[] = [
        { id: '1', title: 'Binary Search Trees', status: 'completed' },
        { id: '2', title: 'Graph Traversal', status: 'completed' },
        { id: '3', title: 'Dynamic Programming', status: 'current' },
        { id: '4', title: 'Advanced Sorting', status: 'locked' },
    ]

    const evolutionHistory: EvolutionHistory[] = [
        {
            id: '1',
            problemName: 'Merge Sort Implementation',
            initialComplexity: 'O(n²)',
            evolvedComplexity: 'O(n log n)',
            date: 'Mar 3, 2026',
            improvement: '+40% faster',
        },
        {
            id: '2',
            problemName: 'Binary Search Tree Validation',
            initialComplexity: 'O(n²)',
            evolvedComplexity: 'O(n)',
            date: 'Mar 2, 2026',
            improvement: '+50% faster',
        },
        {
            id: '3',
            problemName: 'Fibonacci Sequence',
            initialComplexity: 'O(2ⁿ)',
            evolvedComplexity: 'O(n)',
            date: 'Mar 1, 2026',
            improvement: '+95% faster',
        },
        {
            id: '4',
            problemName: 'Two Sum Problem',
            initialComplexity: 'O(n²)',
            evolvedComplexity: 'O(n)',
            date: 'Feb 28, 2026',
            improvement: '+50% faster',
        },
    ]

    const currentStage = 1
    const stages = ['Functional', 'Optimized', 'Clean']

    return (
        <StudentLayout
            currentPage="studentdashboard"
            title="Student Dashboard"
            subtitle="Track your learning journey across topics and continue your evolution path."
            showHeader={false}
        >
            <div className="-m-4 flex h-[calc(100vh-2rem)] flex-col overflow-hidden bg-background sm:-m-6 lg:-m-10">
                <div className="border-b border-border bg-card/80 px-8 py-6">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-4xl font-semibold text-foreground">
                            Welcome back, <span className="text-primary">{displayName}</span>
                        </h1>
                        <p className="mt-2 text-2xl text-muted-foreground">
                            Continue your coding evolution journey
                        </p>
                    </motion.div>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-7">
                    <div className="space-y-6 pb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative overflow-hidden rounded-2xl border border-border bg-card p-8"
                        >
                            <div
                                className="pointer-events-none absolute inset-0 opacity-30"
                                style={{
                                    background:
                                        'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
                                }}
                            />

                            <motion.div
                                animate={{
                                    background: [
                                        'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
                                        'radial-gradient(circle at 80% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
                                        'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
                                    ],
                                }}
                                transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                                className="pointer-events-none absolute inset-0"
                            />

                            <div className="relative z-10">
                                <div className="mb-6 flex items-start justify-between gap-5">
                                    <div>
                                        <div className="mb-2 flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-primary" />
                                            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                                                Current Evolution
                                            </span>
                                        </div>
                                        <h2 className="text-5xl font-semibold text-foreground">
                                            Dijkstra&apos;s Algorithm
                                        </h2>
                                        <p className="mt-2 text-3xl text-muted-foreground">
                                            Master shortest path finding with optimal complexity
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <div className="mb-1 text-6xl font-semibold text-primary">1,340 XP</div>
                                        <div className="text-2xl text-muted-foreground">Level 12</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Evolution Progress</span>
                                        <span className="font-semibold text-foreground">
                                            Stage {currentStage + 1} of {stages.length}
                                        </span>
                                    </div>

                                    <div className="relative">
                                        <div className="h-3 overflow-hidden rounded-full bg-secondary">
                                            <motion.div
                                                initial={{ width: '0%' }}
                                                animate={{ width: `${((currentStage + 1) / stages.length) * 100}%` }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                className="relative h-full bg-linear-to-r from-primary to-purple-500"
                                            >
                                                <motion.div
                                                    animate={{ x: ['-100%', '100%'] }}
                                                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                                                    className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
                                                />
                                            </motion.div>
                                        </div>

                                        <div className="mt-3 flex justify-between">
                                            {stages.map((stage, index) => {
                                                const isCompleted = index <= currentStage
                                                const isCurrent = index === currentStage

                                                return (
                                                    <div key={stage} className="flex flex-col items-center gap-2">
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ delay: index * 0.1 }}
                                                            className={[
                                                                'flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all',
                                                                isCompleted
                                                                    ? 'bg-linear-to-br from-primary to-purple-600 text-white shadow-[0_0_16px_var(--electric-purple-glow)]'
                                                                    : 'border-2 border-border bg-secondary text-muted-foreground',
                                                            ].join(' ')}
                                                        >
                                                            {isCompleted ? (
                                                                isCurrent ? <Zap className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />
                                                            ) : (
                                                                index + 1
                                                            )}
                                                        </motion.div>
                                                        <span
                                                            className={[
                                                                'text-xs font-medium',
                                                                isCompleted ? 'text-primary' : 'text-muted-foreground',
                                                            ].join(' ')}
                                                        >
                                                            {stage}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="relative overflow-hidden rounded-xl border border-border bg-card p-6"
                            >
                                <div
                                    className="pointer-events-none absolute inset-0 opacity-20"
                                    style={{
                                        background:
                                            'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.2) 0%, transparent 60%)',
                                    }}
                                />

                                <div className="relative z-10">
                                    <div className="mb-6 flex items-center gap-2">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-primary to-purple-600 shadow-[0_0_16px_var(--electric-purple-glow)]">
                                            <Trophy className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-semibold text-foreground">Engineer Proficiency</h3>
                                            <p className="text-xs text-muted-foreground">Your coding skill breakdown</p>
                                        </div>
                                    </div>

                                    <div className="relative h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart data={proficiencyData}>
                                                <PolarGrid stroke="rgba(168, 85, 247, 0.2)" strokeWidth={1} />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                                                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} />
                                                <Radar
                                                    name="Proficiency"
                                                    dataKey="value"
                                                    stroke="rgba(168, 85, 247, 1)"
                                                    fill="rgba(168, 85, 247, 0.5)"
                                                    fillOpacity={0.6}
                                                    strokeWidth={2}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="mt-4 grid grid-cols-5 gap-2">
                                        {proficiencyData.map((item) => (
                                            <div key={item.subject} className="text-center">
                                                <div className="text-xl font-bold text-primary">{item.value}</div>
                                                <div className="truncate text-xs text-muted-foreground">{item.subject}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="rounded-xl border border-border bg-card p-6"
                            >
                                <div className="mb-6 flex items-center gap-2">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-amber-500 to-amber-600 shadow-[0_0_16px_rgba(245,158,11,0.4)]">
                                        <Target className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-semibold text-foreground">Upcoming Milestones</h3>
                                        <p className="text-xs text-muted-foreground">Your learning roadmap</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {milestones.map((milestone, index) => (
                                        <motion.div
                                            key={milestone.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 + index * 0.05 }}
                                            className={[
                                                'flex items-center gap-3 rounded-lg border p-3 transition-all',
                                                milestone.status === 'current'
                                                    ? 'border-primary/30 bg-primary/10'
                                                    : milestone.status === 'completed'
                                                        ? 'border-emerald-500/30 bg-emerald-500/10'
                                                        : 'border-border bg-secondary/30',
                                            ].join(' ')}
                                        >
                                            <div
                                                className={[
                                                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white',
                                                    milestone.status === 'current'
                                                        ? 'bg-primary'
                                                        : milestone.status === 'completed'
                                                            ? 'bg-emerald-500'
                                                            : 'bg-slate-500',
                                                ].join(' ')}
                                            >
                                                {milestone.status === 'completed' ? (
                                                    <CheckCircle2 className="h-5 w-5" />
                                                ) : milestone.status === 'current' ? (
                                                    <Zap className="h-5 w-5" />
                                                ) : (
                                                    <Target className="h-5 w-5" />
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h4 className={[
                                                    'text-sm font-semibold',
                                                    milestone.status === 'locked' ? 'text-muted-foreground' : 'text-foreground',
                                                ].join(' ')}>
                                                    {milestone.title}
                                                </h4>
                                            </div>

                                            {milestone.status === 'completed' ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-400">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Done
                                                </span>
                                            ) : milestone.status === 'current' ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-1 text-xs font-semibold text-primary">
                                                    <Zap className="h-3 w-3" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs font-semibold text-muted-foreground">
                                                    Locked
                                                </span>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-2xl font-semibold text-foreground">Recent Evolution History</h2>
                                <button className="text-sm font-medium text-primary transition-colors hover:opacity-85">
                                    View All →
                                </button>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-border bg-card">
                                <div className="grid grid-cols-12 gap-4 border-b border-border bg-secondary/30 px-6 py-4 text-sm font-semibold text-muted-foreground">
                                    <div className="col-span-4">Problem Name</div>
                                    <div className="col-span-2">Initial Complexity</div>
                                    <div className="col-span-2">Evolved Complexity</div>
                                    <div className="col-span-2">Improvement</div>
                                    <div className="col-span-2">Date</div>
                                </div>

                                <div className="divide-y divide-border">
                                    {evolutionHistory.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 + index * 0.05 }}
                                            className="group grid grid-cols-12 gap-4 px-6 py-4 transition-colors hover:bg-secondary/30"
                                        >
                                            <div className="col-span-4 flex items-center gap-2">
                                                <Code2 className="h-4 w-4 shrink-0 text-primary" />
                                                <span className="font-medium text-foreground transition-colors group-hover:text-primary">
                                                    {item.problemName}
                                                </span>
                                            </div>

                                            <div className="col-span-2 flex items-center">
                                                <code className="rounded bg-red-500/10 px-2 py-1 font-mono text-sm text-red-400">
                                                    {item.initialComplexity}
                                                </code>
                                            </div>

                                            <div className="col-span-2 flex items-center">
                                                <code className="rounded bg-emerald-500/10 px-2 py-1 font-mono text-sm text-emerald-400">
                                                    {item.evolvedComplexity}
                                                </code>
                                            </div>

                                            <div className="col-span-2 flex items-center">
                                                <div className="flex items-center gap-1 text-emerald-400">
                                                    <TrendingUp className="h-4 w-4" />
                                                    <span className="text-sm font-semibold">{item.improvement}</span>
                                                </div>
                                            </div>

                                            <div className="col-span-2 flex items-center">
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    <span className="text-sm">{item.date}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    )
}
