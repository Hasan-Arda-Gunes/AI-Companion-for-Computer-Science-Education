/**
 * WorkspacePanelGroup
 *
 * Wraps react-resizable-panels v4 `Group`.
 *
 * **Nesting**: In v4, a Group's children must be Panel or Separator DOM elements.
 * When this component is nested inside another Group (detected by the `defaultSize`
 * prop), it automatically wraps itself inside a `Panel` so the parent Group can
 * manage its size. The wrapper Panel id is `${id}-wrapper`.
 *
 * When collapsed (e.g. during maximize), the wrapper shows a clickable sidebar
 * strip with a vertical title — matching the style of collapsed content panels.
 */

import { Group, Panel, useDefaultLayout, usePanelRef } from 'react-resizable-panels'
import { useEffect, useState, useCallback, useMemo, type ReactNode } from 'react'
import { cn } from '../../ui/utils'
import { useWorkspace, useCurrentGroupId, GroupInfoProvider } from './WorkspaceContext'

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

function toPercent(value: number | string | undefined): string | undefined {
    if (value === undefined) return undefined
    if (typeof value === 'string') return value
    return `${value}%`
}

const COLLAPSED_SIZE = '4%'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface WorkspacePanelGroupProps {
    /** Unique id for this group – also used for localStorage persistence */
    id?: string
    /** Layout direction */
    direction: 'horizontal' | 'vertical'
    /** Children: Panel, PanelHandle, or nested PanelGroup */
    children: ReactNode
    /** Extra className on the wrapper */
    className?: string
    /**
     * When provided, the group auto-wraps itself inside a Panel with this
     * default percentage size. Required for nesting one group inside another.
     */
    defaultSize?: number | string
    /** Minimum percentage size for the wrapper Panel (default: 10) */
    minSize?: number | string
    /** Title shown when the wrapper Panel is collapsed (nested groups only) */
    title?: string
    /** Icon shown when the wrapper Panel is collapsed (nested groups only) */
    icon?: ReactNode
}

/* ------------------------------------------------------------------ */
/*  Inner Group (no wrapper Panel)                                     */
/* ------------------------------------------------------------------ */

function InnerGroup({
    id,
    direction,
    children,
    className,
}: {
    id?: string
    direction: 'horizontal' | 'vertical'
    children: ReactNode
    className?: string
}) {
    const { storageKeyPrefix } = useWorkspace()
    const storageId = id ? `${storageKeyPrefix}:${id}` : undefined

    const persistenceProps = storageId
        ? useDefaultLayout({ id: storageId })
        : { defaultLayout: undefined, onLayoutChanged: undefined }

    const groupId = id ?? '__anonymous__'
    const groupInfo = useMemo(() => ({ id: groupId, orientation: direction }), [groupId, direction])

    return (
        <GroupInfoProvider value={groupInfo}>
            <Group
                id={id}
                orientation={direction}
                defaultLayout={persistenceProps.defaultLayout}
                onLayoutChanged={persistenceProps.onLayoutChanged}
                className={cn('gap-1', className)}
            >
                {children}
            </Group>
        </GroupInfoProvider>
    )
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function WorkspacePanelGroup({
    id,
    direction,
    children,
    className,
    defaultSize,
    minSize = 10,
    title,
    icon,
}: WorkspacePanelGroupProps) {
    const parentGroupId = useCurrentGroupId()
    const isNested = defaultSize !== undefined
    const groupId = id ?? '__anonymous__'
    const wrapperId = `${groupId}-wrapper`

    if (!isNested) {
        // Top-level group — render directly
        return (
            <InnerGroup id={id} direction={direction} className={className}>
                {children}
            </InnerGroup>
        )
    }

    // Nested group — wrap inside a Panel so the parent Group manages its size
    return (
        <NestedGroupWrapper
            id={id}
            direction={direction}
            className={className}
            defaultSize={defaultSize}
            minSize={minSize}
            groupId={groupId}
            wrapperId={wrapperId}
            parentGroupId={parentGroupId}
            title={title}
            icon={icon}
        >
            {children}
        </NestedGroupWrapper>
    )
}

/* ------------------------------------------------------------------ */
/*  Nested wrapper (needs hooks)                                       */
/* ------------------------------------------------------------------ */

function NestedGroupWrapper({
    id,
    direction,
    className,
    defaultSize,
    minSize,
    groupId,
    wrapperId,
    parentGroupId,
    title,
    icon,
    children,
}: {
    id?: string
    direction: 'horizontal' | 'vertical'
    className?: string
    defaultSize: number | string
    minSize: number | string
    groupId: string
    wrapperId: string
    parentGroupId: string | undefined
    title?: string
    icon?: ReactNode
    children: ReactNode
}) {
    const { registerPanel, unregisterPanel, registerGroupWrapper, unregisterGroupWrapper, restore } =
        useWorkspace()
    const wrapperRef = usePanelRef()
    const [isCollapsed, setIsCollapsed] = useState(false)

    // Track collapsed state via resize
    const handleResize = useCallback(() => {
        const panel = wrapperRef.current
        if (panel) {
            setIsCollapsed(panel.isCollapsed())
        }
    }, [wrapperRef])

    // Handle click on collapsed strip → restore from maximize
    const handleExpand = useCallback(() => {
        const panel = wrapperRef.current
        if (!panel) return
        // If collapsed by maximize, restore the whole workspace
        restore()
    }, [wrapperRef, restore])

    // Register the wrapper panel so maximize can skip collapsing it when
    // one of its children is the maximize target.
    useEffect(() => {
        const handle = wrapperRef.current
        if (handle && parentGroupId) {
            registerPanel(wrapperId, handle, parentGroupId)
            registerGroupWrapper(groupId, wrapperId)
        }
        return () => {
            unregisterPanel(wrapperId)
            unregisterGroupWrapper(groupId)
        }
    }, [wrapperRef, wrapperId, groupId, parentGroupId, registerPanel, unregisterPanel, registerGroupWrapper, unregisterGroupWrapper])

    // Sync on mount
    useEffect(() => {
        const panel = wrapperRef.current
        if (panel) {
            setIsCollapsed(panel.isCollapsed())
        }
    }, [wrapperRef])

    return (
        <Panel
            panelRef={wrapperRef}
            id={wrapperId}
            defaultSize={toPercent(defaultSize)}
            minSize={toPercent(minSize) || COLLAPSED_SIZE}
            collapsible
            collapsedSize={COLLAPSED_SIZE}
            onResize={handleResize}
            className={cn(
                'overflow-hidden rounded-lg transition-[border-color] duration-200',
                isCollapsed && 'border border-border/50 bg-card',
            )}
        >
            {isCollapsed ? (
                /* ---- Collapsed strip (vertical text, like a sidebar tab) ---- */
                <button
                    type="button"
                    onClick={handleExpand}
                    className="flex h-full w-full flex-col items-center justify-center gap-3 p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    aria-label={`Expand ${title ?? groupId}`}
                >
                    {icon && (
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-primary">
                            {icon}
                        </span>
                    )}
                    {title && (
                        <span className="text-xs font-medium [writing-mode:vertical-rl]">
                            {title}
                        </span>
                    )}
                    {/* Small expand icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                </button>
            ) : (
                <InnerGroup id={id} direction={direction} className={cn('h-full', className)}>
                    {children}
                </InnerGroup>
            )}
        </Panel>
    )
}
