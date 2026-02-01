"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Bell, Users, Plug, Mail } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2">Settings</h1>
        <p className="text-[#86868b]">Manage your workspace and integrations</p>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-4">
        {/* Notifications */}
        <Card className="p-6 rounded-[18px] border border-gray-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Bell className="w-6 h-6 text-[#0071e3]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-1">Notifications</h3>
              <p className="text-sm text-[#86868b] mb-4">
                Configure email and in-app notification preferences
              </p>
              <Button variant="outline" className="rounded-full" disabled>
                Configure
              </Button>
            </div>
          </div>
        </Card>

        {/* Team Members */}
        <Card className="p-6 rounded-[18px] border border-gray-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <Users className="w-6 h-6 text-[#34c759]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-1">Team Members</h3>
              <p className="text-sm text-[#86868b] mb-4">
                Invite team members and manage roles and permissions
              </p>
              <Button variant="outline" className="rounded-full" disabled>
                Manage Team
              </Button>
            </div>
          </div>
        </Card>

        {/* Integrations */}
        <Card className="p-6 rounded-[18px] border border-gray-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Plug className="w-6 h-6 text-[#0071e3]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-1">Integrations</h3>
              <p className="text-sm text-[#86868b] mb-4">
                Connect Salesforce, HubSpot, and other CRM systems
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-full" disabled>
                  <Plug className="w-4 h-4 mr-2" />
                  Salesforce
                </Button>
                <Button variant="outline" className="rounded-full" disabled>
                  <Plug className="w-4 h-4 mr-2" />
                  HubSpot
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Email Settings */}
        <Card className="p-6 rounded-[18px] border border-gray-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Mail className="w-6 h-6 text-[#ff9500]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-1">Email Approvals</h3>
              <p className="text-sm text-[#86868b] mb-4">
                Enable one-click approvals directly from email notifications
              </p>
              <Button variant="outline" className="rounded-full" disabled>
                Configure
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Coming Soon Notice */}
      <Card className="p-6 rounded-[18px] border border-blue-200 bg-blue-50">
        <div className="flex items-start gap-3">
          <Settings className="w-5 h-5 text-[#0071e3] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#0071e3] mb-1">
              Settings Configuration Coming Soon
            </p>
            <p className="text-sm text-[#1d1d1f]">
              Full settings management, including team administration, integrations, and notification
              preferences will be available in the next release.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
