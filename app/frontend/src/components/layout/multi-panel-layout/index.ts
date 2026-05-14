/**
 * Multi-Panel Layout – Barrel Exports
 *
 * A LeetCode-style resizable, collapsible, maximizable panel system
 * built on top of `react-resizable-panels` v4.
 *
 * Quick start:
 * ```tsx
 * import {
 *   Workspace,
 *   WorkspacePanelGroup,
 *   WorkspacePanel,
 *   WorkspacePanelHandle,
 * } from '@/components/layout/multi-panel-layout'
 *
 * <Workspace>
 *   <WorkspacePanelGroup direction="horizontal" id="root">
 *     <WorkspacePanel id="sidebar" title="Description" collapsible defaultSize={40}>
 *       <DescriptionContent />
 *     </WorkspacePanel>
 *     <WorkspacePanelHandle />
 *     <WorkspacePanelGroup direction="vertical" id="right" defaultSize={60}>
 *       <WorkspacePanel id="editor" title="Code" defaultSize={70}>
 *         <EditorContent />
 *       </WorkspacePanel>
 *       <WorkspacePanelHandle direction="vertical" />
 *       <WorkspacePanel id="terminal" title="Terminal" collapsible defaultSize={30}>
 *         <TerminalContent />
 *       </WorkspacePanel>
 *     </WorkspacePanelGroup>
 *   </WorkspacePanelGroup>
 * </Workspace>
 * ```
 */

export { Workspace } from './Workspace'
export type { WorkspaceProps } from './Workspace'

export { WorkspacePanelGroup } from './WorkspacePanelGroup'
export type { WorkspacePanelGroupProps } from './WorkspacePanelGroup'

export { WorkspacePanel } from './WorkspacePanel'
export type { WorkspacePanelProps } from './WorkspacePanel'

export { WorkspacePanelHandle } from './WorkspacePanelHandle'

export { useWorkspace } from './WorkspaceContext'
export type { WorkspaceContextValue } from './WorkspaceContext'
