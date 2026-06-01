/**
 * WorkspacePanel
 *
 * A resizable panel wrapper that provides:
 *  - A compact header bar with title, icon, collapse, and maximize buttons
 *  - Collapsible behaviour (always enabled internally for maximize support)
 *  - Maximize = collapse all sibling panels, giving this one maximum space
 *  - Overflow-hidden shell with an internal overflow-auto content area
 *
 * Usage:
 *   <WorkspacePanel id="editor" title="Code Editor" icon={<Code />} collapsible defaultSize={60}>
 *     <EditorContent />
 *   </WorkspacePanel>
 */

import { Panel, usePanelRef } from 'react-resizable-panels'
import {
    useState,
    useCallback,
    useEffect,
    type ReactNode,
} from 'react'
import { cn } from '../../ui/utils'
import { useWorkspace, useCurrentGroupInfo } from './WorkspaceContext'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface WorkspacePanelProps {
    /** Unique id – also used for localStorage persistence */
    id: string
    /** Human-readable title shown in the header */
    title?: string
    /** Small icon rendered before the title */
    icon?: ReactNode
    /** Panel content */
    children: ReactNode
    /** Default percentage size (0-100) within the parent PanelGroup */
    defaultSize?: number | string
    /** Minimum percentage size */
    minSize?: number | string
    /** Whether this panel shows a collapse button in its header */
    collapsible?: boolean
    /** Whether this panel shows a maximize button in its header */
    maximizable?: boolean
    /** Extra className on the outer card wrapper */
    className?: string
    /** Rendered in the header's right slot before the action buttons */
    headerExtra?: ReactNode
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Convert a numeric percentage (0-100) to a v4 percentage string */
function toPercent(value: number | string | undefined): string | undefined {
    if (value === undefined) return undefined
    if (typeof value === 'string') return value
    return `${value}%`
}

const COLLAPSED_SIZE = '4%'

/* ------------------------------------------------------------------ */
/*  Icons (inline SVG – avoids lucide-react dependency in this module) */
/* ------------------------------------------------------------------ */

function MaximizeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
    )
}

function MinimizeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 14 10 14 10 20" />
            <polyline points="20 10 14 10 14 4" />
            <line x1="14" y1="10" x2="21" y2="3" />
            <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
    )
}

function CollapseIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    )
}

function ExpandIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="shrink-0">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
    )
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function WorkspacePanel({
    id,
    title,
    icon,
    children,
    defaultSize,
    minSize = 10,
    collapsible = false,
    maximizable = true,
    className,
    headerExtra,
}: WorkspacePanelProps) {
    const panelRef = usePanelRef()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const { maximize, restore, maximizedPanelId, registerPanel, unregisterPanel } = useWorkspace()
    const groupInfo = useCurrentGroupInfo()
    const groupId = groupInfo?.id
    const isInHorizontalGroup = groupInfo?.orientation === 'horizontal'

    const isMaximized = maximizedPanelId === id
    const isSomeoneElseMaximized = maximizedPanelId !== null && !isMaximized

    /* ---- Register with workspace context ---- */
    useEffect(() => {
        const handle = panelRef.current
        if (handle && groupId) {
            registerPanel(id, handle, groupId)
        }
        return () => {
            unregisterPanel(id)
        }
    }, [id, panelRef, groupId, registerPanel, unregisterPanel])

    /* ---- Track collapse state via resize events ---- */
    const handleResize = useCallback(() => {
        const panel = panelRef.current
        if (panel) {
            setIsCollapsed(panel.isCollapsed())
        }
    }, [panelRef])

    /* ---- Sync on mount ---- */
    useEffect(() => {
        const panel = panelRef.current
        if (panel) {
            setIsCollapsed(panel.isCollapsed())
        }
    }, [panelRef])

    /* ---- Collapse / Expand ---- */
    const handleToggleCollapse = useCallback(() => {
        const panel = panelRef.current
        if (!panel) return
        if (panel.isCollapsed()) {
            panel.expand()
        } else {
            panel.collapse()
        }
    }, [panelRef])

    /* ---- Maximize / Restore ---- */
    const handleMaximize = useCallback(() => {
        if (isMaximized) {
            restore()
        } else {
            maximize(id)
        }
    }, [id, isMaximized, maximize, restore])

    /* ---- Header action button style ---- */
    const actionBtnClass =
        'flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

    return (
        <Panel
            panelRef={panelRef}
            id={id}
            defaultSize={toPercent(defaultSize)}
            minSize={toPercent(minSize) || COLLAPSED_SIZE}
            collapsible
            collapsedSize={COLLAPSED_SIZE}
            onResize={handleResize}
            className={cn(
                'overflow-hidden rounded-lg border border-border bg-card transition-[border-color] duration-200',
                isCollapsed && 'border-border/50',
                className,
            )}
        >
            {/* -------- Collapsed state -------- */}
            {isCollapsed ? (
                <button
                    type="button"
                    onClick={isSomeoneElseMaximized ? restore : handleToggleCollapse}
                    className={cn(
                        'flex h-full w-full items-center justify-center gap-3 p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                        isInHorizontalGroup ? 'flex-col' : 'flex-row',
                    )}
                    aria-label={`Expand ${title ?? id}`}
                >
                    {icon && (
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-primary">
                            {icon}
                        </span>
                    )}
                    {title && (
                        <span className={cn(
                            'text-xs font-medium',
                            isInHorizontalGroup
                                ? '[writing-mode:vertical-rl]'
                                : 'truncate',
                        )}>
                            {title}
                        </span>
                    )}
                    <ExpandIcon />
                </button>
            ) : (
                <div className="flex h-full flex-col">
                    {/* -------- Header bar -------- */}
                    <div className="flex h-10 shrink-0 items-center justify-between border-b border-border/60 bg-card px-3">
                        {/* Left: icon + title */}
                        <div className="flex items-center gap-2 overflow-hidden">
                            {icon && (
                                <span className="flex h-4 w-4 shrink-0 items-center justify-center text-primary">
                                    {icon}
                                </span>
                            )}
                            {title && (
                                <span className="truncate text-xs font-medium text-foreground">
                                    {title}
                                </span>
                            )}
                        </div>

                        {/* Right: extra + action buttons */}
                        <div className="flex items-center gap-1">
                            {headerExtra}

                            {/* Maximize / Restore button */}
                            {maximizable && (
                                <button
                                    type="button"
                                    onClick={handleMaximize}
                                    className={cn(
                                        actionBtnClass,
                                        isMaximized && 'text-primary hover:text-primary',
                                    )}
                                    aria-label={isMaximized ? `Restore ${title ?? id}` : `Maximize ${title ?? id}`}
                                >
                                    {isMaximized ? <MinimizeIcon /> : <MaximizeIcon />}
                                </button>
                            )}

                            {/* Collapse button (only when user explicitly enables it) */}
                            {collapsible && !isSomeoneElseMaximized && (
                                <button
                                    type="button"
                                    onClick={handleToggleCollapse}
                                    className={actionBtnClass}
                                    aria-label={`Collapse ${title ?? id}`}
                                >
                                    <CollapseIcon />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* -------- Content area -------- */}
                    <div className="flex-1 overflow-auto">
                        {children}
                    </div>
                </div>
            )}
        </Panel>
    )
}
