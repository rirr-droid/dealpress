"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateMemberRole, removeMember } from "@/app/actions/team";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Crown, User, Trash2 } from "lucide-react";

interface TeamMemberActionsProps {
  memberId: string;
  memberName: string;
  role: string;
}

export default function TeamMemberActions({
  memberId,
  memberName,
  role,
}: TeamMemberActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const handleRoleChange = (newRole: 'admin' | 'member') => {
    startTransition(async () => {
      const result = await updateMemberRole(memberId, newRole);

      if (result.success) {
        toast({
          title: "Role updated",
          description: `${memberName} is now ${newRole === 'admin' ? 'an Admin' : 'a Member'}`,
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update role",
          variant: "destructive",
        });
      }
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      const result = await removeMember(memberId);

      if (result.success) {
        toast({
          title: "Member removed",
          description: `${memberName} has been removed from the team`,
        });
        setShowRemoveDialog(false);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to remove member",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {role === 'member' ? (
            <DropdownMenuItem onClick={() => handleRoleChange('admin')}>
              <Crown className="mr-2 h-4 w-4 text-[#0071e3]" />
              Make Admin
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => handleRoleChange('member')}>
              <User className="mr-2 h-4 w-4" />
              Make Member
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setShowRemoveDialog(true)}
            className="text-[#ff3b30]"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove from Team
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{memberName}</strong> from your team? They
              will lose access to all approval requests and data.
              <br />
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-[#ff3b30] hover:bg-[#ff2d20]"
              disabled={isPending}
            >
              {isPending ? "Removing..." : "Remove Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
