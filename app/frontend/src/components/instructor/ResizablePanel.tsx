/**
 * ResizablePanel Component
 * Provides a resizable container with drag handle between two panels
 * Used for instructor question form and AI panel layout
 */

import React, { useState, useRef, useEffect } from 'react'
import styles from './ResizablePanel.module.css'

interface ResizablePanelProps {
    leftPanel: React.ReactNode
    rightPanel: React.ReactNode
    leftMinWidth?: number // pixels
    rightMinWidth?: number // pixels
    defaultLeftRatio?: number // 0-1, default 0.6
    onResize?: (leftWidth: number, totalWidth: number) => void
}

export function ResizablePanel({
    leftPanel,
    rightPanel,
    leftMinWidth = 300,
    rightMinWidth = 250,
    defaultLeftRatio = 0.6,
    onResize,
}: ResizablePanelProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [leftWidth, setLeftWidth] = useState<number | null>(null)

    // Initialize left panel width based on default ratio
    useEffect(() => {
        if (containerRef.current && leftWidth === null) {
            const totalWidth = containerRef.current.clientWidth
            setLeftWidth(Math.round(totalWidth * defaultLeftRatio))
        }
    }, [leftWidth, defaultLeftRatio])

    const handleMouseDown = () => {
        setIsDragging(true)
    }

    useEffect(() => {
        if (!isDragging) return

        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return

            const containerRect = containerRef.current.getBoundingClientRect()
            const newLeftWidth = e.clientX - containerRect.left

            // Enforce minimum widths
            const totalWidth = containerRef.current.clientWidth
            const maxLeftWidth = totalWidth - rightMinWidth

            if (newLeftWidth >= leftMinWidth && newLeftWidth <= maxLeftWidth) {
                setLeftWidth(newLeftWidth)
                onResize?.(newLeftWidth, totalWidth)
            }
        }

        const handleMouseUp = () => {
            setIsDragging(false)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, leftMinWidth, rightMinWidth, onResize])

    const rightWidth = containerRef.current && leftWidth ? containerRef.current.clientWidth - leftWidth : undefined

    return (
        <div
            ref={containerRef}
            className={`${styles.resizableContainer} ${isDragging ? styles.dragging : ''}`}
        >
            {/* Left Panel */}
            <div
                className={styles.leftPanel}
                style={leftWidth ? { width: `${leftWidth}px` } : undefined}
            >
                {leftPanel}
            </div>

            {/* Resizable Divider */}
            <div
                className={styles.divider}
                onMouseDown={handleMouseDown}
                role="separator"
                aria-label="Resize panels"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft' && leftWidth) {
                        const newWidth = Math.max(leftMinWidth, leftWidth - 10)
                        setLeftWidth(newWidth)
                        onResize?.(newWidth, containerRef.current?.clientWidth ?? 0)
                    } else if (e.key === 'ArrowRight' && leftWidth && containerRef.current) {
                        const totalWidth = containerRef.current.clientWidth
                        const maxLeftWidth = totalWidth - rightMinWidth
                        const newWidth = Math.min(maxLeftWidth, leftWidth + 10)
                        setLeftWidth(newWidth)
                        onResize?.(newWidth, totalWidth)
                    }
                }}
            >
                <div className={styles.dragHandle} />
            </div>

            {/* Right Panel */}
            <div
                className={styles.rightPanel}
                style={rightWidth ? { width: `${rightWidth}px` } : undefined}
            >
                {rightPanel}
            </div>
        </div>
    )
}
