"use client"

import { useTeams } from "@/hooks/use-teams"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateTeamModal } from "@/components/forms/create-team-modal"
import Link from "next/link"

export default function TeamsPage() {
  const { data: teams, isLoading, error } = useTeams()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">
            Manage your teams and collaborate with others.
          </p>
        </div>
        <CreateTeamModal />
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading teams...</div>
      ) : error ? (
        <div className="text-destructive">Failed to load teams</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams?.length === 0 ? (
            <div className="col-span-full py-8 text-center text-muted-foreground border rounded-lg border-dashed">
              No teams found. Create one to get started!
            </div>
          ) : (
            teams?.map((team) => (
              <Link key={team.id} href={`/teams/${team.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>{team.name}</CardTitle>
                    <CardDescription>
                      Created on {new Date(team.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Could add member count here later */}
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
