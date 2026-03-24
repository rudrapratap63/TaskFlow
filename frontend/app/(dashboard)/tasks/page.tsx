"use client"

import { useAssignedTasks, Task } from "@/hooks/use-tasks"
import { TaskStatusSelect } from "@/components/shared/task-status-select"
import { TaskDetailModal } from "@/components/shared/task-detail-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useState } from "react"

export default function MyTasksPage() {
  const { data: tasks, isLoading } = useAssignedTasks()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-muted-foreground">Tasks assigned to you across all projects.</p>
        </div>
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="grid gap-4 flex-col lg:grid-cols-2">
             <Skeleton className="h-[120px] w-full" />
             <Skeleton className="h-[120px] w-full" />
          </div>
        ) : tasks?.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground border rounded-lg border-dashed">
            You don't have any assigned tasks right now!
          </div>
        ) : (
          <div className="grid gap-4 flex-col lg:grid-cols-2 xl:grid-cols-3">
            {tasks?.map((task) => (
              <Card 
                key={task.id} 
                className="flex flex-col cursor-pointer transition-shadow hover:ring-1 hover:ring-primary/50"
                onClick={() => setSelectedTask(task)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-base font-medium leading-tight">
                      {task.title}
                    </CardTitle>
                    <Link 
                      href={`/projects/${task.project_id}`}
                      className="text-xs text-primary hover:underline whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Project
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="mt-auto flex flex-col gap-4">
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  <div 
                    className="flex items-center justify-between mt-2 pt-4 border-t"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <TaskStatusSelect taskId={task.id} currentStatus={task.status} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          open={!!selectedTask} 
          onOpenChange={(open) => !open && setSelectedTask(null)} 
        />
      )}
    </div>
  )
}
