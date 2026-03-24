"use client"

import { useState } from "react"
import { useCommentsByTask, useCreateComment, useDeleteComment } from "@/hooks/use-comments"
import { useProject } from "@/hooks/use-projects"
import { useTeamMembers } from "@/hooks/use-teams"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2 } from "lucide-react"

export function TaskComments({ taskId, projectId }: { taskId: number, projectId: number }) {
  const { data: project } = useProject(projectId)
  const { data: members } = useTeamMembers(project?.team_id as number)
  
  const { data: comments, isLoading } = useCommentsByTask(taskId)
  const { mutate: createComment, isPending: isCreating } = useCreateComment()
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment()
  const { user } = useAuth()
  
  const [newComment, setNewComment] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    createComment(
      { content: newComment, task_id: taskId },
      {
        onSuccess: () => {
          setNewComment("")
        }
      }
    )
  }

  return (
    <div className="flex flex-col h-full border-l pl-6 py-6">
      <h3 className="font-semibold text-lg mb-4">Comments</h3>
      
      <ScrollArea className="flex-1 pr-4 -mr-4 mb-4">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading comments...</div>
        ) : comments?.length === 0 ? (
          <div className="text-sm text-muted-foreground">No comments yet.</div>
        ) : (
          <div className="space-y-4">
            {comments?.map((comment) => {
              const member = members?.find(m => m.id === comment.user_id)
              const displayName = member?.name || `User ${comment.user_id}`
              const avatarFallback = member?.name ? member.name.charAt(0).toUpperCase() : `U${comment.user_id}`
              
              return (
              <div key={comment.id} className="flex gap-3 group">
                <Avatar className="h-8 w-8">
                  {member?.username && <AvatarImage src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${member.username}`} />}
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{displayName}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground border-r pr-2">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                      {user?.id === comment.user_id && (
                        <button 
                          onClick={() => deleteComment({ commentId: comment.id, taskId })}
                          disabled={isDeleting}
                          className="opacity-0 group-hover:opacity-100 text-destructive transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
              )
            })}
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="mt-auto flex flex-col gap-2 pt-4 border-t">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-20"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isCreating || !newComment.trim()}>
            {isCreating ? "Posting..." : "Comment"}
          </Button>
        </div>
      </form>
    </div>
  )
}
