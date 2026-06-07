/**
 * WorkspaceContext
 *
 * Provides shared state for the multi-panel workspace:
 * - Panel registration (so maximize can collapse siblings)
 * - Maximize = collapse every other panel, giving the target max space
 * - Restore = expand all panels back to their previous sizes
 * - localStorage persistence key prefix
 */

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useRef,
    type ReactNode,
} from 'react'
import type { PanelImperativeHandle } from 'react-resizable-panels'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface WorkspaceContextValue {
    /** ID of the panel currently maximized, or null */
    maximizedPanelId: string | null
    /** Collapse all other panels, giving this panel maximum space */
    maximize: (panelId: string) => void
    /** Restore all panels to their pre-maximize sizes */
    restore: () => void
    /** Prefix used for localStorage keys */
    storageKeyPrefix: string
    /** Register a panel's imperative handle (called by WorkspacePanel on mount) */
    registerPanel: (panelId: string, handle: PanelImperativeHandle, groupId: string) => void
    /** Unregister a panel (called on unmount) */
    unregisterPanel: (panelId: string) => void
    /**
     * Register a group-to-wrapper mapping (called by WorkspacePanelGroup
     * when it auto-wraps itself in a Panel for nesting).
     * This tells maximize that collapsing the wrapper would hide the group's children.
     */
    registerGroupWrapper: (groupId: string, wrapperId: string) => void
    /** Unregister a group wrapper */
    unregisterGroupWrapper: (groupId: string) => void
}

/* ------------------------------------------------------------------ */
/*  Internal group-info context (id + orientation for collapsed UI)    */
/* ------------------------------------------------------------------ */

export interface GroupInfo {
    id: string
    orientation: 'horizontal' | 'vertical'
}

const GroupInfoCtx = createContext<GroupInfo | undefined>(undefined)

export function GroupInfoProvider({ value, children }: { value: GroupInfo; children: ReactNode }) {
    return <GroupInfoCtx.Provider value={value}>{children}</GroupInfoCtx.Provider>
}

export function useCurrentGroupInfo(): GroupInfo | undefined {
    return useContext(GroupInfoCtx)
}

/** Convenience: just the id */
export function useCurrentGroupId(): string | undefined {
    return useContext(GroupInfoCtx)?.id
}

/* ------------------------------------------------------------------ */
/*  Main workspace context                                             */
/* ------------------------------------------------------------------ */

const WorkspaceCtx = createContext<WorkspaceContextValue | null>(null)

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

interface WorkspaceProviderProps {
    children: ReactNode
    storageKeyPrefix?: string
}

export function WorkspaceProvider({ children, storageKeyPrefix = 'workspace' }: WorkspaceProviderProps) {
    const [maximizedPanelId, setMaximizedPanelId] = useState<string | null>(null)

    // panelId → { handle, groupId }
    const panelRegistry = useRef<Map<string, { handle: PanelImperativeHandle; groupId: string }>>(new Map())
    // groupId → wrapperId  (for nested groups that are auto-wrapped in a Panel)
    const groupWrapperMap = useRef<Map<string, string>>(new Map())
    // Saved sizes before maximize so we can restore
    const savedSizes = useRef<Map<string, number>>(new Map())

    /* ---- Registration ---- */
    const registerPanel = useCallback(
        (panelId: string, handle: PanelImperativeHandle, groupId: string) => {
            panelRegistry.current.set(panelId, { handle, groupId })
        },
        [],
    )

    const unregisterPanel = useCallback((panelId: string) => {
        panelRegistry.current.delete(panelId)
    }, [])

    const registerGroupWrapper = useCallback((groupId: string, wrapperId: string) => {
        groupWrapperMap.current.set(groupId, wrapperId)
    }, [])

    const unregisterGroupWrapper = useCallback((groupId: string) => {
        groupWrapperMap.current.delete(groupId)
    }, [])

    /* ---- Ancestor lookup ----
     * Given a panelId, find all wrapper-Panel ids that are ancestors.
     * e.g. if panel "code-editor" is in group "right-column",
     * and group "right-column" is wrapped by panel "right-column-wrapper",
     * then "right-column-wrapper" is an ancestor.
     */
    const getAncestorIds = useCallback((panelId: string): Set<string> => {
        const ancestors = new Set<string>()
        const entry = panelRegistry.current.get(panelId)
        if (!entry) return ancestors

        let groupId: string | undefined = entry.groupId
        while (groupId) {
            const wrapperId = groupWrapperMap.current.get(groupId)
            if (!wrapperId) break
            ancestors.add(wrapperId)
            const wrapperEntry = panelRegistry.current.get(wrapperId)
            groupId = wrapperEntry?.groupId
        }
        return ancestors
    }, [])

    /* ---- Maximize ---- */
    const maximize = useCallback(
        (panelId: string) => {
            const ancestors = getAncestorIds(panelId)

            // Save current sizes and collapse non-ancestors / non-target
            savedSizes.current.clear()
            for (const [id, { handle }] of panelRegistry.current) {
                const size = handle.getSize()
                savedSizes.current.set(id, size.asPercentage)

                if (id !== panelId && !ancestors.has(id) && !handle.isCollapsed()) {
                    handle.collapse()
                }
            }
            setMaximizedPanelId(panelId)
        },
        [getAncestorIds],
    )

    /* ---- Restore ---- */
    const restore = useCallback(() => {
        // Expand all collapsed panels
        for (const [, { handle }] of panelRegistry.current) {
            if (handle.isCollapsed()) {
                handle.expand()
            }
        }
        // Attempt to restore saved percentage sizes
        for (const [id, pct] of savedSizes.current) {
            const entry = panelRegistry.current.get(id)
            if (entry) {
                try {
                    entry.handle.resize(`${pct}%`)
                } catch {
                    // Size may conflict with constraints; library will clamp
                }
            }
        }
        savedSizes.current.clear()
        setMaximizedPanelId(null)
    }, [])

    return (
        <WorkspaceCtx.Provider
            value={{
                maximizedPanelId,
                maximize,
                restore,
                storageKeyPrefix,
                registerPanel,
                unregisterPanel,
                registerGroupWrapper,
                unregisterGroupWrapper,
            }}
        >
            {children}
        </WorkspaceCtx.Provider>
    )
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useWorkspace(): WorkspaceContextValue {
    const ctx = useContext(WorkspaceCtx)
    if (!ctx) {
        throw new Error('useWorkspace must be used within a <Workspace /> (WorkspaceProvider)')
    }
    return ctx
}
