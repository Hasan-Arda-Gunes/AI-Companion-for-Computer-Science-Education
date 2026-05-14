/**
 * Workspace
 *
 * The top-level provider component for the multi-panel layout system.
 * Wrap your entire panel tree in <Workspace> to enable fullscreen mode
 * and localStorage persistence.
 *
 * Usage:
 *   <Workspace storageKeyPrefix="leetcode">
 *     <WorkspacePanelGroup direction="horizontal" id="root">
 *       ...
 *     </WorkspacePanelGroup>
 *   </Workspace>
 */

import type { ReactNode } from 'react'
import { cn } from '../../ui/utils'
import { WorkspaceProvider } from './WorkspaceContext'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface WorkspaceProps {
    children: ReactNode
    /** Prefix for localStorage keys (default: "workspace") */
    storageKeyPrefix?: string
    /** Extra className on the outer container div */
    className?: string
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Workspace({ children, storageKeyPrefix, className }: WorkspaceProps) {
    return (
        <WorkspaceProvider storageKeyPrefix={storageKeyPrefix}>
            <div
                className={cn(
                    'flex h-full w-full flex-col gap-1 bg-background p-1',
                    className,
                )}
            >
                {children}
            </div>
        </WorkspaceProvider>
    )
}
