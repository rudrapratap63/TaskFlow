"use client"

import { useTask, useUpdateTaskStatus, TaskStatusType } from "@/hooks/use-tasks"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function TaskStatusSelect({ taskId, currentStatus }: { taskId: number, currentStatus: TaskStatusType }) {
  const { mutate: updateStatus, isPending } = useUpdateTaskStatus()

  return (
    <Select 
      defaultValue={currentStatus} 
      onValueChange={(value) => updateStatus({ taskId, status: value as TaskStatusType })}
      disabled={isPending}
    >
      <SelectTrigger className="w-[140px] h-8 text-xs">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todo">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            To Do
          </div>
        </SelectItem>
        <SelectItem value="in_progress">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            In Progress
          </div>
        </SelectItem>
        <SelectItem value="done">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Done
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
