import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"

export interface Project {
  id: number
  name: string
  team_id: number
  created_at: string
  updated_at: string
}

export function useProjects(teamId: number) {
  return useQuery({
    // Important: Include teamId in queryKey
    queryKey: ["projects", teamId],
    queryFn: async (): Promise<Project[]> => {
      const response = await api.get(`/projects/team/${teamId}`)
      return response.data
    },
    enabled: !!teamId,
  })
}

export function useProject(projectId: number) {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async (): Promise<Project> => {
      const response = await api.get(`/projects/${projectId}`)
      return response.data
    },
    enabled: !!projectId,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; team_id: number }) => {
      const response = await api.post("/projects/", data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects", variables.team_id] })
    },
  })
}
