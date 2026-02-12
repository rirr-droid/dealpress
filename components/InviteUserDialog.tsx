"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { inviteUser } from "@/app/actions/team";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import UpgradePrompt from "./UpgradePrompt";

export default function InviteUserDialog() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const resetForm = () => {
    setEmail("");
    setJobTitle("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await inviteUser(email.trim(), jobTitle.trim() || undefined);

      if (result.success) {
        toast({
          title: "Invitation sent",
          description: result.message || "User has been invited to join your team",
        });
        resetForm();
        setOpen(false);
        router.refresh();
      } else {
        // Check if it's a usage limit error
        if ('errorCode' in result && result.errorCode === 'USAGE_LIMIT_REACHED') {
          setUpgradeMessage(result.error || "Upgrade to Pro to add more team members");
          setOpen(false);
          setShowUpgradePrompt(true);
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to invite user",
            variant: "destructive",
          });
        }
      }
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation email to add a new member to your team.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="job-title">Job Title (Optional)</Label>
                <Input
                  id="job-title"
                  placeholder="e.g., Sales Manager, Account Executive"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-[#1d1d1f]">
                  <strong>Note:</strong> New members will be added as <strong>Members</strong> by
                  default. You can change their role to Admin after they join.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setOpen(false);
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || !email.trim()}
                className="bg-[#0071e3] hover:bg-[#0077ed]"
              >
                {isPending ? "Sending..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <UpgradePrompt
        open={showUpgradePrompt}
        onOpenChange={setShowUpgradePrompt}
        message={upgradeMessage}
      />
    </>
  );
}
