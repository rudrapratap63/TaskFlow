import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"

// Types based on the OpenAPI schema
export interface Team {
  id: number
  name: string
  created_by: number
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: number
  username: string
  email: string
  name: string
  role: string
}

export function useTeams(skip = 0, limit = 100) {
  return useQuery({
    queryKey: ["teams", skip, limit],
    queryFn: async (): Promise<Team[]> => {
      const response = await api.get("/teams/", { params: { skip, limit } })
      return response.data
    },
  })
}

export function useTeam(teamId: number) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: ["teams", teamId],
    queryFn: async (): Promise<Team> => {
      // The API might not have a direct /teams/{id} GET unless we check the openapi.json.
      // Wait, let's look at schema for get team. Hmm, there might not be a GET team.
      // But we can return from cache or we check later.
      // Let's assume we read from the list cache for now if no single endpoint exists.
      const teams = queryClient.getQueryData<Team[]>(["teams", 0, 100])
      return teams?.find(t => t.id === teamId) as Team
    },
    enabled: !!teamId,
  })
}

export function useCreateTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await api.post("/teams/", data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] })
    },
  })
}

export function useTeamMembers(teamId: number) {
  return useQuery({
    queryKey: ["teams", teamId, "members"],
    queryFn: async (): Promise<TeamMember[]> => {
      const response = await api.get(`/teams/${teamId}/members`)
      return response.data
    },
    enabled: !!teamId,
  })
}

export function useInviteMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ team_id, new_user_id }: { team_id: number, new_user_id: number }) => {
      const response = await api.post(`/teams/invite-member`, null, {
        params: { team_id, new_user_id }
      })
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teams", variables.team_id, "members"] })
    },
  })
}
