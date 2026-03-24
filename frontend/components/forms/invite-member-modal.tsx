"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
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
import { useInviteMember } from "@/hooks/use-teams"

export function InviteMemberModal({ teamId }: { teamId: number }) {
  const [open, setOpen] = useState(false)
  const { mutate: inviteMember, isPending } = useInviteMember()
  const { register, handleSubmit, reset } = useForm<{ user_id: string }>()

  const onSubmit = (data: { user_id: string }) => {
    inviteMember(
      { team_id: teamId, new_user_id: parseInt(data.user_id, 10) },
      {
        onSuccess: () => {
          reset()
          setOpen(false)
        },
        onError: (err: any) => {
          alert(err.response?.data?.detail || "Failed to invite member. Make sure the User ID is correct.")
        }
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Invite Member</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Enter the User ID of the person you want to invite to this team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="user_id" className="text-right">
                User ID
              </Label>
              <Input
                id="user_id"
                type="number"
                className="col-span-3"
                placeholder="Ex: 2"
                required
                {...register("user_id", { required: true, valueAsNumber: true })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Inviting..." : "Send Invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
