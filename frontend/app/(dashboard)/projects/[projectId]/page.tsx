"use client"

import { useProject } from "@/hooks/use-projects"
import { useTasksByProject } from "@/hooks/use-tasks"
import { CreateTaskModal } from "@/components/forms/create-task-modal"
import { TaskStatusSelect } from "@/components/shared/task-status-select"
import { TaskDetailModal } from "@/components/shared/task-detail-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, use } from "react"
import { Task } from "@/hooks/use-tasks"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = use(params)
  const projectId = parseInt(resolvedParams.projectId, 10)
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const { data: project, isLoading: isProjectLoading } = useProject(projectId)
  const { data: tasks, isLoading: isTasksLoading } = useTasksByProject(projectId)

  if (isProjectLoading) return <div>Loading project details...</div>
  if (!project) return <div>Project not found</div>

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground">Project Board</p>
        </div>
        <CreateTaskModal projectId={projectId} />
      </div>

      <div className="flex-1 min-h-0">
        <h2 className="text-xl font-semibold tracking-tight mb-4">Tasks</h2>
        
        {isTasksLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             <Skeleton className="h-[150px] w-full" />
             <Skeleton className="h-[150px] w-full" />
             <Skeleton className="h-[150px] w-full" />
          </div>
        ) : tasks?.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground border rounded-lg border-dashed">
            No tasks found. Create one to get started!
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                  </div>
                </CardHeader>
                <CardContent className="mt-auto flex flex-col gap-4">
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {task.description}
                    </p>
                  )}
                  <div 
                    className="flex items-center justify-between mt-2 pt-4 border-t" 
                    onClick={(e) => e.stopPropagation()} // Prevent modal open when changing status
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
