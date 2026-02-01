import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Zap, Users, TrendingUp } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#1d1d1f]">Dealpress</h1>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" className="text-[#1d1d1f]">
                  Sign In
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 py-24 text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-[#1d1d1f] mb-6 leading-tight">
          Deal approvals,<br />made simple.
        </h2>
        <p className="text-xl text-[#86868b] mb-8 max-w-2xl mx-auto">
          Stop chasing approvals in email threads. Get deals approved faster with visual workflows,
          real-time notifications, and seamless CRM integration.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full text-lg px-8 py-6">
              Try Demo →
            </Button>
          </Link>
        </div>
        <p className="text-sm text-[#86868b] mt-4">
          No credit card required • 14-day free trial
        </p>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-2xl mb-4">
              <Zap className="w-7 h-7 text-[#0071e3]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">Lightning Fast</h3>
            <p className="text-[#86868b]">
              One-click approvals from email. No login required.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-50 rounded-2xl mb-4">
              <CheckCircle className="w-7 h-7 text-[#34c759]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">Visual Timeline</h3>
            <p className="text-[#86868b]">
              See approval status at a glance with our beautiful tracker.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-50 rounded-2xl mb-4">
              <Users className="w-7 h-7 text-[#0071e3]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">Team Collaboration</h3>
            <p className="text-[#86868b]">
              Multi-step approvals with parallel and sequential workflows.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-50 rounded-2xl mb-4">
              <TrendingUp className="w-7 h-7 text-[#ff9500]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">Analytics</h3>
            <p className="text-[#86868b]">
              Track approval times and identify bottlenecks.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-24">
        <div className="bg-[#f5f5f7] rounded-[32px] p-12 md:p-16 text-center">
          <h2 className="text-4xl font-bold text-[#1d1d1f] mb-4">
            Ready to speed up your approvals?
          </h2>
          <p className="text-xl text-[#86868b] mb-8">
            Join teams who have cut their approval time by 75%.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full text-lg px-8 py-6">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#86868b]">
              © 2024 Dealpress. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-[#86868b]">
              <a href="#" className="hover:text-[#1d1d1f]">Privacy</a>
              <a href="#" className="hover:text-[#1d1d1f]">Terms</a>
              <a href="#" className="hover:text-[#1d1d1f]">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
