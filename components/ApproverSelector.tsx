"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { X, Search, Check, Users, Crown, User as UserIcon } from "lucide-react";

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  user_profiles: {
    name: string;
    email: string;
    avatar_url?: string;
  };
}

interface ApproverSelectorProps {
  teamMembers: TeamMember[];
  selectedIds: string[];
  onSelect: (userId: string) => void;
  onClose: () => void;
}

export function ApproverSelector({
  teamMembers,
  selectedIds,
  onSelect,
  onClose,
}: ApproverSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = teamMembers.filter((member) => {
    const name = member.user_profiles?.name?.toLowerCase() || "";
    const email = member.user_profiles?.email?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  const availableMembers = filteredMembers.filter(
    (member) => !selectedIds.includes(member.user_id)
  );

  return (
    <Card className="p-4 bg-gray-50 border-2 border-[#0071e3]/30 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#0071e3]" />
          <h4 className="text-sm font-semibold text-[#1d1d1f]">Select Approver</h4>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 rounded-full"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#86868b]" />
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Member List */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {availableMembers.length === 0 ? (
          <div className="text-center py-6">
            <UserIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-[#86868b]">
              {searchQuery ? "No members found" : "All team members already selected"}
            </p>
          </div>
        ) : (
          availableMembers.map((member) => (
            <button
              key={member.user_id}
              onClick={() => {
                onSelect(member.user_id);
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-[#0071e3] hover:bg-blue-50 transition-all group"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-[#0071e3]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#0071e3]/20 transition-colors">
                {member.user_profiles?.avatar_url ? (
                  <img
                    src={member.user_profiles.avatar_url}
                    alt={member.user_profiles.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <span className="text-[#0071e3] font-semibold">
                    {member.user_profiles?.name?.[0]?.toUpperCase() || "?"}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-[#1d1d1f] truncate">
                  {member.user_profiles?.name || "Unknown User"}
                </p>
                <p className="text-xs text-[#86868b] truncate">
                  {member.user_profiles?.email}
                </p>
              </div>

              {/* Role Badge */}
              {member.role === "admin" ? (
                <Badge
                  variant="default"
                  className="bg-[#0071e3] text-white flex-shrink-0"
                >
                  <Crown className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              ) : (
                <Badge variant="outline" className="flex-shrink-0">
                  <UserIcon className="w-3 h-3 mr-1" />
                  Member
                </Badge>
              )}

              {/* Select Icon */}
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0 group-hover:border-[#0071e3] transition-colors">
                <Check className="w-3 h-3 text-transparent group-hover:text-[#0071e3]" />
              </div>
            </button>
          ))
        )}
      </div>

      {/* Info */}
      <div className="mt-3 p-2 bg-blue-50 rounded-lg">
        <p className="text-xs text-[#0071e3]">
          💡 You can add multiple approvers to a single step. All will need to approve.
        </p>
      </div>
    </Card>
  );
}
