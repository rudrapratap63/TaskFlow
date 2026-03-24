"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { Task, TaskStatusType } from "@/hooks/use-tasks"
import { TaskComments } from "@/components/shared/task-comments"
import { TaskStatusSelect } from "@/components/shared/task-status-select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { CalendarIcon, User as UserIcon } from "lucide-react"

interface TaskDetailModalProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDetailModal({ task, open, onOpenChange }: TaskDetailModalProps) {
  const queryClient = useQueryClient()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return
    setIsDeleting(true)
    try {
      await api.delete(`/tasks/${task.id}`)
      queryClient.invalidateQueries({ queryKey: ["tasks", "project", task.project_id] })
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to delete task", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 overflow-hidden gap-0">
        <div className="grid grid-cols-3 h-full">
          {/* Main Info */}
          <div className="col-span-2 p-6 flex flex-col h-full overflow-y-auto">
            <DialogHeader className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <DialogTitle className="text-2xl">{task.title}</DialogTitle>
                <div className="flex items-center gap-2">
                  <TaskStatusSelect taskId={task.id} currentStatus={task.status} />
                </div>
              </div>
              {task.deadline && (
                <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
                  <CalendarIcon className="h-4 w-4" />
                  Due: {new Date(task.deadline).toLocaleDateString()}
                </div>
              )}
            </DialogHeader>

            <div className="space-y-6 flex-1">
              <div>
                <h4 className="text-sm font-semibold mb-2">Description</h4>
                <div className="text-sm text-foreground bg-muted/30 rounded-md p-4 min-h-[100px] border whitespace-pre-wrap">
                  {task.description || <span className="text-muted-foreground italic">No description provided.</span>}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <UserIcon className="h-4 w-4" />
                  {task.assigned_user_id ? `Assigned to User ${task.assigned_user_id}` : "Unassigned"}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t flex justify-end">
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Task"}
              </Button>
            </div>
          </div>

          {/* Comments Sidebar */}
          <div className="col-span-1 bg-muted/10">
             <TaskComments taskId={task.id} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
