"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCreateTask } from "@/hooks/use-tasks"
import { useTeamMembers } from "@/hooks/use-teams"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type TaskFormValues = {
  title: string
  description?: string
  deadline?: string
  assigned_user_id?: string
}

export function CreateTaskModal({ projectId, teamId }: { projectId: number, teamId: number }) {
  const [open, setOpen] = useState(false)
  const { mutate: createTask, isPending } = useCreateTask()
  const { data: members, isLoading: isLoadingMembers } = useTeamMembers(teamId)
  const { register, handleSubmit, reset, control } = useForm<TaskFormValues>()

  const onSubmit = (data: TaskFormValues) => {
    createTask(
      {
        title: data.title,
        description: data.description,
        deadline: data.deadline || null,
        project_id: projectId,
        assigned_user_id: data.assigned_user_id ? parseInt(data.assigned_user_id, 10) : undefined,
      },
      {
        onSuccess: () => {
          reset()
          setOpen(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add Task</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            Add a new task to your project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Fix navigation bug"
                {...register("title", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="More details..."
                {...register("description")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline (Optional)</Label>
              <Input
                id="deadline"
                type="datetime-local"
                {...register("deadline")}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="assignee">Assign To (Optional)</Label>
              <Controller
                name="assigned_user_id"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingMembers}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {members?.map((member) => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Save task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
