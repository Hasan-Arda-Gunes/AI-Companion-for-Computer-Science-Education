/**
 * Instructor-specific sidebar component.
 * Uses the same rendering logic as StudentSidebar but with instructor-specific branding and configuration.
 */

import { StudentSidebar } from './StudentSidebar'

export function InstructorSidebar(props: React.ComponentProps<typeof StudentSidebar>) {
    return <StudentSidebar {...props} />
}
