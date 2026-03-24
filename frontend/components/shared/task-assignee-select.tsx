"use client"

import { useProject } from "@/hooks/use-projects"
import { useTeamMembers } from "@/hooks/use-teams"
import { useUpdateTask } from "@/hooks/use-tasks"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function TaskAssigneeSelect({
  taskId,
  projectId,
  currentAssigneeId,
}: {
  taskId: number
  projectId: number
  currentAssigneeId?: number | null
}) {
  const { data: project } = useProject(projectId)
  const { data: members, isLoading: isLoadingMembers } = useTeamMembers(project?.team_id!)
  const { mutate: updateTask, isPending } = useUpdateTask()

  const handleAssigneeChange = (value: string) => {
    const newAssigneeId = value === "unassigned" ? null : parseInt(value, 10)
    updateTask({ taskId, data: { assigned_user_id: newAssigneeId } })
  }

  const currentMember = members?.find(m => m.id === currentAssigneeId)

  return (
    <Select
      value={currentAssigneeId?.toString() ?? "unassigned"}
      onValueChange={handleAssigneeChange}
      disabled={isPending || isLoadingMembers}
    >
      <SelectTrigger className="w-50 h-9 text-sm">
        <SelectValue placeholder="Assign to..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unassigned">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback>?</AvatarFallback>
            </Avatar>
            Unassigned
          </div>
        </SelectItem>
        {members?.map((member) => (
          <SelectItem key={member.id} value={member.id.toString()}>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${member.username}`} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {member.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
