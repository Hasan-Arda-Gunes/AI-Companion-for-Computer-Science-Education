/**
 * MultiPanelDemo
 *
 * A self-contained demo that showcases the multi-panel layout system
 * with a LeetCode-style three-panel layout:
 *   Left:  Problem description
 *   Right-top:  Code editor placeholder
 *   Right-bottom: Terminal / output
 */

import {
    Workspace,
    WorkspacePanelGroup,
    WorkspacePanel,
    WorkspacePanelHandle,
} from '../index'

/* ------------------------------------------------------------------ */
/*  Tiny mock content components                                       */
/* ------------------------------------------------------------------ */

function DescriptionContent() {
    return (
        <div className="space-y-4 p-4 text-sm text-foreground/90">
            <div className="flex items-center gap-2">
                <span className="rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-semibold text-green-400">
                    Easy
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">Arrays</span>
            </div>
            <h2 className="text-lg font-semibold text-foreground">1. Two Sum</h2>
            <p className="leading-relaxed text-muted-foreground">
                Given an array of integers <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-primary">nums</code> and
                an integer <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-primary">target</code>, return indices
                of the two numbers such that they add up to <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-primary">target</code>.
            </p>
            <div className="rounded-lg border border-border bg-background p-3">
                <p className="mb-1 text-xs font-semibold text-muted-foreground">Example 1:</p>
                <pre className="whitespace-pre-wrap text-xs text-foreground/80">
{`Input:  nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: nums[0] + nums[1] == 9`}
                </pre>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
                <p className="mb-1 text-xs font-semibold text-muted-foreground">Example 2:</p>
                <pre className="whitespace-pre-wrap text-xs text-foreground/80">
{`Input:  nums = [3,2,4], target = 6
Output: [1,2]`}
                </pre>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">Constraints:</p>
                <ul className="list-inside list-disc space-y-0.5 text-xs text-muted-foreground">
                    <li>2 ≤ nums.length ≤ 10⁴</li>
                    <li>-10⁹ ≤ nums[i] ≤ 10⁹</li>
                    <li>-10⁹ ≤ target ≤ 10⁹</li>
                    <li>Only one valid answer exists.</li>
                </ul>
            </div>
        </div>
    )
}

function EditorContent() {
    return (
        <div className="flex h-full flex-col">
            {/* Language selector bar */}
            <div className="flex h-8 items-center gap-3 border-b border-border/40 bg-background/50 px-3">
                <span className="rounded bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    Python 3
                </span>
                <span className="rounded px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-muted">
                    JavaScript
                </span>
                <span className="rounded px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-muted">
                    C++
                </span>
            </div>
            {/* Code area */}
            <div className="flex-1 overflow-auto p-3 font-mono text-xs leading-relaxed">
                <div className="flex">
                    <div className="mr-4 select-none text-right text-muted-foreground/50">
                        {Array.from({ length: 15 }, (_, i) => (
                            <div key={i}>{i + 1}</div>
                        ))}
                    </div>
                    <pre className="text-foreground/90">
{`class Solution:
    def twoSum(self, nums, target):
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return []


# Test
sol = Solution()
print(sol.twoSum([2,7,11,15], 9))
print(sol.twoSum([3,2,4], 6))`}
                    </pre>
                </div>
            </div>
        </div>
    )
}

function TerminalContent() {
    return (
        <div className="flex h-full flex-col font-mono text-xs">
            <div className="flex h-8 items-center gap-3 border-b border-border/40 bg-background/50 px-3">
                <span className="rounded bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                    Output
                </span>
                <span className="rounded px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-muted">
                    Testcase
                </span>
            </div>
            <div className="flex-1 overflow-auto p-3">
                <p className="text-green-400">✓ All test cases passed</p>
                <div className="mt-2 space-y-1 text-foreground/70">
                    <p><span className="text-muted-foreground">Case 1:</span> [0, 1] <span className="text-green-400">✓</span></p>
                    <p><span className="text-muted-foreground">Case 2:</span> [1, 2] <span className="text-green-400">✓</span></p>
                </div>
                <div className="mt-3 flex gap-4 text-muted-foreground">
                    <span>Runtime: <span className="text-foreground">4ms</span></span>
                    <span>Memory: <span className="text-foreground">16.8 MB</span></span>
                </div>
            </div>
        </div>
    )
}

/* ------------------------------------------------------------------ */
/*  Demo page                                                          */
/* ------------------------------------------------------------------ */

export function MultiPanelDemo() {
    return (
        <div className="h-screen w-screen bg-background">
            <Workspace storageKeyPrefix="demo" className="h-full">
                <WorkspacePanelGroup direction="horizontal" id="root">
                    <WorkspacePanel
                        id="problem-description"
                        title="Description"
                        defaultSize={35}
                        collapsible
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        }
                    >
                        <DescriptionContent />
                    </WorkspacePanel>

                    <WorkspacePanelHandle />

                    {/* Nested group — defaultSize wraps it in a Panel automatically */}
                    <WorkspacePanelGroup
                        direction="vertical"
                        id="right-column"
                        defaultSize={65}
                        title="Code & Output"
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                        }
                    >
                        <WorkspacePanel
                            id="code-editor"
                            title="Code Editor"
                            defaultSize={65}
                            collapsible
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                            }
                        >
                            <EditorContent />
                        </WorkspacePanel>

                        <WorkspacePanelHandle direction="vertical" />

                        <WorkspacePanel
                            id="terminal"
                            title="Terminal"
                            defaultSize={35}
                            collapsible
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                            }
                        >
                            <TerminalContent />
                        </WorkspacePanel>
                    </WorkspacePanelGroup>
                </WorkspacePanelGroup>
            </Workspace>
        </div>
    )
}
