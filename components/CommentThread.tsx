"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addStepComment, deleteStepComment } from "@/app/actions/comments";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { MessageSquare, Trash2, Send } from "lucide-react";
import type { StepComment } from "@/lib/db/comments";

interface CommentThreadProps {
  stepId: string;
  comments: StepComment[];
  currentUserId: string;
}

export default function CommentThread({
  stepId,
  comments,
  currentUserId,
}: CommentThreadProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [newComment, setNewComment] = useState("");
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await addStepComment(stepId, newComment);

      if (result.success) {
        toast({
          title: "Comment added",
          description: "Your comment has been posted",
        });
        setNewComment("");
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add comment",
          variant: "destructive",
        });
      }
    });
  };

  const handleDeleteComment = () => {
    if (!deleteCommentId) return;

    startTransition(async () => {
      const result = await deleteStepComment(deleteCommentId);

      if (result.success) {
        toast({
          title: "Comment deleted",
          description: "The comment has been removed",
        });
        setDeleteCommentId(null);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete comment",
          variant: "destructive",
        });
      }
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Comments header */}
      <div className="flex items-center gap-2 text-sm text-[#86868b]">
        <MessageSquare className="w-4 h-4" />
        <span>
          {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
        </span>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="flex gap-3 p-4 rounded-[12px] bg-gray-50 border border-gray-200"
          >
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={comment.user?.avatar_url} />
              <AvatarFallback className="bg-[#0071e3] text-white text-xs">
                {comment.user?.name?.split(" ").map((n) => n[0]).join("") || "?"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#1d1d1f]">
                    {comment.user?.name || comment.user?.email}
                  </span>
                  <span className="text-xs text-[#86868b]">
                    {formatDate(comment.created_at)}
                  </span>
                </div>

                {comment.user_id === currentUserId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-[#ff3b30] hover:text-[#ff2d20] hover:bg-red-50"
                    onClick={() => setDeleteCommentId(comment.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <p className="text-sm text-[#1d1d1f] whitespace-pre-wrap break-words">
                {comment.comment}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add comment form */}
      <form onSubmit={handleAddComment} className="space-y-3">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={isPending}
          className="min-h-[80px] rounded-[12px] border-gray-200 focus:border-[#0071e3] focus:ring-[#0071e3]"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isPending || !newComment.trim()}
            className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {isPending ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </form>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={deleteCommentId !== null}
        onOpenChange={(open) => !open && setDeleteCommentId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteComment}
              className="bg-[#ff3b30] hover:bg-[#ff2d20]"
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
