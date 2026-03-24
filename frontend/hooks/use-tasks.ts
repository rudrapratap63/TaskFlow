import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"

export type TaskStatusType = "todo" | "in_progress" | "done"

export interface Task {
  id: number
  title: string
  description?: string
  deadline?: string
  project_id: number
  assigned_user_id?: number
  status: TaskStatusType
  created_at: string
  updated_at: string
}

export function useTasksByProject(projectId: number) {
  return useQuery({
    queryKey: ["tasks", "project", projectId],
    queryFn: async (): Promise<Task[]> => {
      const response = await api.get(`/tasks/project/${projectId}`)
      return response.data
    },
    enabled: !!projectId,
  })
}

export function useAssignedTasks() {
  return useQuery({
    queryKey: ["tasks", "assigned"],
    queryFn: async (): Promise<Task[]> => {
      const response = await api.get("/tasks/assigned")
      return response.data
    },
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { 
      title: string
      description?: string
      deadline?: string | null
      project_id: number
      assigned_user_id?: number | null
    }) => {
      const response = await api.post("/tasks/", data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "project", variables.project_id] })
    },
  })
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: TaskStatusType }) => {
      const response = await api.patch(`/tasks/${taskId}/status`, { status })
      return response.data
    },
    onSuccess: (data) => {
      // Invalidate both project scope and assigned scope to be safe
      queryClient.invalidateQueries({ queryKey: ["tasks", "project", data.project_id] })
      queryClient.invalidateQueries({ queryKey: ["tasks", "assigned"] })
    },
  })
}
