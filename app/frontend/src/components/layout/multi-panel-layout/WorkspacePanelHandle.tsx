/**
 * WorkspacePanelHandle
 *
 * A styled "grabber" resize handle placed between adjacent panels.
 * Wraps `Separator` from react-resizable-panels v4 and adds a
 * visible drag indicator with hover/active animations.
 */

import { Separator } from 'react-resizable-panels'
import { cn } from '../../ui/utils'

interface WorkspacePanelHandleProps {
    /** Override the direction hint for styling; the parent Group controls actual orientation */
    direction?: 'horizontal' | 'vertical'
    /** Extra className on the outer wrapper */
    className?: string
    /** HTML id */
    id?: string
}

export function WorkspacePanelHandle({ direction, className, id }: WorkspacePanelHandleProps) {
    const isVertical = direction === 'vertical'

    return (
        <Separator
            id={id}
            className={cn(
                'group relative flex items-center justify-center transition-colors',
                isVertical
                    ? 'h-2 w-full cursor-row-resize'
                    : 'h-full w-2 cursor-col-resize',
                'hover:bg-primary/10 data-[separator]:hover:bg-primary/10',
                className,
            )}
        >
            {/* Visible drag indicator dot cluster */}
            <div
                className={cn(
                    'rounded-full bg-muted-foreground/40 transition-all group-hover:bg-primary',
                    isVertical ? 'h-1 w-8' : 'h-8 w-1',
                )}
            />
        </Separator>
    )
}
