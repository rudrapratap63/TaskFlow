import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"

export interface Comment {
  id: number
  content: string
  task_id: number
  user_id: number
  created_at: string
  updated_at: string
}

export function useCommentsByTask(taskId: number) {
  return useQuery({
    queryKey: ["comments", "task", taskId],
    queryFn: async (): Promise<Comment[]> => {
      const response = await api.get(`/comments/task/${taskId}`)
      return response.data
    },
    enabled: !!taskId,
  })
}

export function useCreateComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { content: string; task_id: number }) => {
      const response = await api.post("/comments/", data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", "task", variables.task_id] })
    },
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ commentId, taskId }: { commentId: number; taskId: number }) => {
      await api.delete(`/comments/${commentId}`)
      return { commentId, taskId }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["comments", "task", data.taskId] })
    },
  })
}
