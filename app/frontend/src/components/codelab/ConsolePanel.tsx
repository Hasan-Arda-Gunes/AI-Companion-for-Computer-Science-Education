import { CheckCircle, Info, Terminal, XCircle } from 'lucide-react'
import { motion } from 'motion/react'
import type { ConsoleData, ConsoleLogType } from './types'
import { ScrollArea } from '../ui/scroll-area'

type ConsolePanelProps = {
    consoleData: ConsoleData
    onClear?: () => void
    useInternalScroll?: boolean
}

const getLogIcon = (type: ConsoleLogType) => {
    switch (type) {
        case 'error':
            return <XCircle className="size-4 text-red-400" />
        case 'success':
            return <CheckCircle className="size-4 text-green-400" />
        case 'info':
            return <Info className="size-4 text-blue-400" />
        default:
            return <Terminal className="size-4 text-muted-foreground" />
    }
}

const getLogTextColor = (type: ConsoleLogType) => {
    switch (type) {
        case 'error':
            return 'text-red-400'
        case 'success':
            return 'text-green-400'
        case 'info':
            return 'text-blue-400'
        default:
            return 'text-foreground'
    }
}

export function ConsolePanel({ consoleData, onClear, useInternalScroll = true }: ConsolePanelProps) {
    return (
        <section className={[useInternalScroll ? 'flex h-full min-h-0 flex-col' : 'flex flex-col', 'border-t border-border bg-background'].join(' ')}>
            <div className="flex items-center justify-between border-b border-border bg-secondary px-4 py-2">
                <div className="flex items-center gap-2">
                    <Terminal className="size-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">{consoleData.title}</span>
                    {consoleData.logs.length > 0 ? (
                        <span className="rounded bg-card px-2 py-0.5 text-xs text-muted-foreground">
                            {consoleData.logs.length} {consoleData.logs.length === 1 ? 'log' : 'logs'}
                        </span>
                    ) : null}
                </div>
                {onClear && consoleData.logs.length > 0 ? (
                    <button
                        type="button"
                        onClick={onClear}
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Clear
                    </button>
                ) : null}
            </div>

            {useInternalScroll ? (
                <ScrollArea className="min-h-0 flex-1">
                    <ConsoleLogList consoleData={consoleData} />
                </ScrollArea>
            ) : (
                <div className="p-4">
                    <ConsoleLogList consoleData={consoleData} />
                </div>
            )}
        </section>
    )
}

type ConsoleLogListProps = {
    consoleData: ConsoleData
}

function ConsoleLogList({ consoleData }: ConsoleLogListProps) {
    return (
        <div className="space-y-2 font-mono text-sm">
            {consoleData.logs.length === 0 ? (
                <div className="italic text-muted-foreground">Console output will appear here...</div>
            ) : (
                consoleData.logs.map((log) => (
                    <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-2 py-1"
                    >
                        {getLogIcon(log.type)}
                        <div className="flex flex-1 items-baseline gap-2">
                            <span className={[getLogTextColor(log.type), 'break-all'].join(' ')}>{log.message}</span>
                            <span className="whitespace-nowrap text-xs text-muted-foreground">{log.timestamp}</span>
                        </div>
                    </motion.div>
                ))
            )}
        </div>
    )
}
