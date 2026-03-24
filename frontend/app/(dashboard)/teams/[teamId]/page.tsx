"use client"

import { useTeam, useTeamMembers } from "@/hooks/use-teams"
import { useProjects } from "@/hooks/use-projects"
import { CreateProjectModal } from "@/components/forms/create-project-modal"
import { InviteMemberModal } from "@/components/forms/invite-member-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { use } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function TeamDetailPage({ params }: { params: Promise<{ teamId: string }> }) {
  const resolvedParams = use(params)
  const teamId = parseInt(resolvedParams.teamId, 10)
  
  const { data: team, isLoading: isTeamLoading } = useTeam(teamId)
  const { data: projects, isLoading: isProjectsLoading } = useProjects(teamId)
  const { data: members, isLoading: isMembersLoading } = useTeamMembers(teamId)

  if (isTeamLoading) return <div>Loading team details...</div>
  if (!team) return <div>Team not found</div>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
          <p className="text-muted-foreground">Team Workspace</p>
        </div>
        <InviteMemberModal teamId={teamId} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Projects</h2>
          <CreateProjectModal teamId={teamId} />
        </div>

        {isProjectsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             <Skeleton className="h-[120px] w-full" />
             <Skeleton className="h-[120px] w-full" />
          </div>
        ) : projects?.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground border rounded-lg border-dashed">
            No projects found. Create one to get started!
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects?.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 pt-6 mt-6 border-t">
        <h2 className="text-xl font-semibold tracking-tight">Team Members</h2>
        
        {isMembersLoading ? (
          <div>Loading members...</div>
        ) : members?.length === 0 ? (
          <div className="text-muted-foreground">No extra members found.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {members?.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 bg-card border rounded-md">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-semibold text-xs border">
                  {member.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
                <div className="ml-auto text-xs font-medium uppercase px-2 py-1 bg-muted rounded">
                  {member.role || "Member"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
