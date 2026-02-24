import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Zap,
  Users,
  TrendingUp,
  Clock,
  Shield,
  ArrowRight,
  Sparkles,
  BarChart3,
  FileCheck,
  Mail,
  Slack,
  Star
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#0071e3] to-[#00c6ff] rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1d1d1f] to-[#0071e3] bg-clip-text text-transparent">
                DealPress
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-[#1d1d1f] hover:bg-gray-100">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-[#0071e3] to-[#00c6ff] hover:from-[#0077ed] hover:to-[#00d4ff] text-white rounded-full shadow-lg shadow-blue-500/25">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-20 pb-24">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-[#0071e3]" />
            <span className="text-sm font-medium text-[#0071e3]">
              Trusted by 500+ RevOps teams
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-7xl font-bold text-[#1d1d1f] mb-6 leading-tight tracking-tight">
            Stop chasing
            <span className="block bg-gradient-to-r from-[#0071e3] to-[#00c6ff] bg-clip-text text-transparent">
              deal approvals
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-[#6e6e73] mb-12 max-w-3xl mx-auto leading-relaxed">
            DealPress transforms chaotic email threads into structured workflows.
            Get deals approved <span className="font-semibold text-[#1d1d1f]">3x faster</span> with
            one-click approvals, real-time tracking, and automatic notifications.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-[#0071e3] to-[#00c6ff] hover:from-[#0077ed] hover:to-[#00d4ff] text-white rounded-full text-lg px-10 py-7 shadow-xl shadow-blue-500/25 group">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="border-2 border-gray-300 rounded-full text-lg px-10 py-7 hover:border-[#0071e3] hover:text-[#0071e3]">
                Watch Demo
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-8 text-sm text-[#86868b]">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-white"></div>
                ))}
              </div>
              <span>500+ teams</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-[#ff9500] text-[#ff9500]" />
              ))}
              <span className="ml-2">4.9/5 rating</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#34c759]" />
              <span>No credit card</span>
            </div>
          </div>
        </div>

        {/* Hero Image/Dashboard Preview */}
        <div className="mt-20 max-w-6xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0071e3]/20 to-[#00c6ff]/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white rounded-2xl border-2 border-gray-200 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#f5f5f7] to-white p-3 border-b border-gray-200 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff3b30]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ff9500]"></div>
                <div className="w-3 h-3 rounded-full bg-[#34c759]"></div>
                <div className="ml-4 text-xs text-gray-500 font-medium">dealpress.ai/dashboard</div>
              </div>
              <div className="p-8 bg-gradient-to-br from-blue-50/50 to-purple-50/30">
                <div className="space-y-6">
                  {/* Header Row */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-8 w-48 bg-gradient-to-r from-[#1d1d1f] to-[#1d1d1f]/80 rounded-lg mb-2 flex items-center px-3">
                        <span className="text-white text-sm font-bold">Enterprise Deal - $250k</span>
                      </div>
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    </div>
                    <div className="px-6 py-2 bg-[#34c759] rounded-full">
                      <span className="text-white text-sm font-semibold">Approved</span>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                      {/* Step 1 - Completed */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[#34c759] flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-xs text-[#34c759] font-medium">Sales Manager</div>
                      </div>
                      <div className="flex-1 h-1 bg-[#34c759] rounded"></div>

                      {/* Step 2 - Completed */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[#34c759] flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-xs text-[#34c759] font-medium">Finance</div>
                      </div>
                      <div className="flex-1 h-1 bg-[#34c759] rounded"></div>

                      {/* Step 3 - Current */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[#0071e3] flex items-center justify-center animate-pulse">
                          <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-xs text-[#0071e3] font-medium">VP Sales</div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg mb-3 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-[#0071e3]" />
                      </div>
                      <div className="text-2xl font-bold text-[#1d1d1f] mb-1">$250k</div>
                      <div className="text-xs text-[#6e6e73]">Deal Value</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg mb-3 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-[#0071e3]" />
                      </div>
                      <div className="text-2xl font-bold text-[#1d1d1f] mb-1">4.2h</div>
                      <div className="text-xs text-[#6e6e73]">Approval Time</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg mb-3 flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#34c759]" />
                      </div>
                      <div className="text-2xl font-bold text-[#1d1d1f] mb-1">3/3</div>
                      <div className="text-xs text-[#6e6e73]">Approvers</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-24 bg-gradient-to-b from-[#1d1d1f] to-[#2d2d2f] text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Your approval process is <span className="text-[#ff3b30]">broken</span>
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Email threads get lost. Slack messages disappear. Deals stall waiting for approvals.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-white/5 backdrop-blur rounded-2xl border border-white/10">
                <div className="text-5xl font-bold text-[#ff3b30] mb-2">47%</div>
                <div className="text-gray-400">of deals delayed by approvals</div>
              </div>
              <div className="p-6 bg-white/5 backdrop-blur rounded-2xl border border-white/10">
                <div className="text-5xl font-bold text-[#ff9500] mb-2">5.3</div>
                <div className="text-gray-400">days average approval time</div>
              </div>
              <div className="p-6 bg-white/5 backdrop-blur rounded-2xl border border-white/10">
                <div className="text-5xl font-bold text-[#0071e3] mb-2">23</div>
                <div className="text-gray-400">emails per approval request</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Bento Box Style */}
      <section className="py-24 bg-gradient-to-b from-white via-purple-50/20 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] mb-4">
              Everything RevOps needs
            </h2>
            <p className="text-xl text-[#6e6e73]">
              Built for speed, designed for control
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Feature 1 - Large */}
            <div className="lg:col-span-2 lg:row-span-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border-2 border-gray-200 hover:border-[#0071e3] transition-colors group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Zap className="w-6 h-6 text-[#0071e3]" />
                </div>
                <h3 className="text-2xl font-bold text-[#1d1d1f]">One-Click Approvals</h3>
              </div>
              <p className="text-lg text-[#6e6e73] mb-6">
                Approve or reject deals directly from email. No login, no friction, no delays.
              </p>
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-[#34c759]" />
                    <span className="text-sm font-medium">Approved in 2 seconds</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <Mail className="w-5 h-5 text-[#0071e3]" />
                    <span className="text-sm font-medium">Email notification sent</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-[#0071e3] transition-colors">
              <div className="w-12 h-12 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-[#34c759]" />
              </div>
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">Real-Time Analytics</h3>
              <p className="text-[#6e6e73]">
                Track approval velocity, identify bottlenecks, optimize your process.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-[#0071e3] transition-colors">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-[#0071e3]" />
              </div>
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">Multi-Step Workflows</h3>
              <p className="text-[#6e6e73]">
                Sequential or parallel approvals. Custom rules. Automatic routing.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-8 border-2 border-gray-200 hover:border-[#ff9500] transition-colors">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <Slack className="w-6 h-6 text-[#ff9500]" />
              </div>
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">Slack Integration</h3>
              <p className="text-[#6e6e73]">
                Approve deals without leaving Slack. Full notification support.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-[#0071e3] transition-colors">
              <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-[#ff3b30]" />
              </div>
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">Audit Trail</h3>
              <p className="text-[#6e6e73]">
                Complete compliance tracking. See who approved what, when, and why.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-[#0071e3] transition-colors">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6 text-[#0071e3]" />
              </div>
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">Document Uploads</h3>
              <p className="text-[#6e6e73]">
                Attach contracts, quotes, and supporting docs. All in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-[#6e6e73]">
              Start free, upgrade as you grow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-gray-300 transition-colors">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#1d1d1f] mb-2">Starter</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-bold text-[#1d1d1f]">Free</span>
                </div>
                <p className="text-[#6e6e73]">Perfect for trying out DealPress</p>
              </div>
              <Link href="/signup">
                <Button className="w-full rounded-full mb-6 bg-gray-900 hover:bg-gray-800">
                  Get Started Free
                </Button>
              </Link>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#34c759] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[#1d1d1f]">3 approval requests/month</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#34c759] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[#1d1d1f]">1 template</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#34c759] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[#1d1d1f]">1 team member</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#34c759] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[#1d1d1f]">Email notifications</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#34c759] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[#1d1d1f]">Basic analytics</span>
                </div>
              </div>
            </div>

            {/* Professional Plan - Most Popular */}
            <div className="bg-gradient-to-br from-[#0071e3] to-[#00c6ff] rounded-3xl p-8 border-2 border-[#0071e3] relative shadow-2xl shadow-blue-500/25 transform md:scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#ff9500] text-white px-6 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-bold text-white">$49</span>
                  <span className="text-blue-100">/month</span>
                </div>
                <p className="text-blue-100">For growing teams</p>
              </div>
              <Link href="/signup">
                <Button className="w-full rounded-full mb-6 bg-white text-[#0071e3] hover:bg-gray-100">
                  Start Free Trial
                </Button>
              </Link>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white font-medium">50 approval requests/month</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white font-medium">Unlimited templates</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white font-medium">Up to 5 team members</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white font-medium">Slack integration</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white font-medium">Advanced analytics</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white font-medium">Priority support</span>
                </div>
              </div>
            </div>

            {/* Business Plan */}
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-gray-300 transition-colors">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#1d1d1f] mb-2">Business</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-bold text-[#1d1d1f]">$99</span>
                  <span className="text-[#6e6e73]">/month</span>
                </div>
                <p className="text-[#6e6e73]">For scaling organizations</p>
              </div>
              <Link href="/signup">
                <Button className="w-full rounded-full mb-6 bg-gray-900 hover:bg-gray-800">
                  Start Free Trial
                </Button>
              </Link>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#34c759] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[#1d1d1f] font-medium">Unlimited requests</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#34c759] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[#1d1d1f]">Unlimited templates</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#34c759] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[#1d1d1f]">Up to 15 team members</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#34c759] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[#1d1d1f]">Everything in Professional</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#34c759] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[#1d1d1f]">Custom workflows</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#34c759] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[#1d1d1f]">Dedicated support</span>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Note */}
          <div className="text-center mt-12">
            <p className="text-[#6e6e73]">
              All plans include a 14-day free trial. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-24 bg-[#f5f5f7]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] mb-4">
              Loved by RevOps teams
            </h2>
            <p className="text-xl text-[#6e6e73]">
              See why teams are switching to DealPress
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-[#ff9500] text-[#ff9500]" />
                ))}
              </div>
              <p className="text-[#1d1d1f] mb-6 text-lg">
                "Cut our approval time from 3 days to 4 hours. Game changer for closing deals faster."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400"></div>
                <div>
                  <div className="font-semibold text-[#1d1d1f]">Sarah Chen</div>
                  <div className="text-sm text-[#6e6e73]">VP RevOps, TechCorp</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-[#ff9500] text-[#ff9500]" />
                ))}
              </div>
              <p className="text-[#1d1d1f] mb-6 text-lg">
                "Finally, no more chasing approvals in email. Everything's in one place."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-400"></div>
                <div>
                  <div className="font-semibold text-[#1d1d1f]">Mike Rodriguez</div>
                  <div className="text-sm text-[#6e6e73]">Head of Sales Ops, GrowthCo</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-[#ff9500] text-[#ff9500]" />
                ))}
              </div>
              <p className="text-[#1d1d1f] mb-6 text-lg">
                "The analytics alone are worth it. We identified our biggest bottleneck in week one."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-400"></div>
                <div>
                  <div className="font-semibold text-[#1d1d1f]">Emily Park</div>
                  <div className="text-sm text-[#6e6e73]">Director of Operations, ScaleCo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#0071e3] to-[#00c6ff] rounded-[32px] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/10"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Stop losing deals to slow approvals
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                Join 500+ teams who have accelerated their approval process with DealPress.
                Start your free trial today.
              </p>
              <Link href="/signup">
                <Button size="lg" className="bg-white text-[#0071e3] hover:bg-gray-100 rounded-full text-lg px-12 py-7 shadow-2xl font-semibold group">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <p className="text-blue-100 mt-6">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-[#0071e3] to-[#00c6ff] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#1d1d1f]">DealPress</h3>
              </div>
              <p className="text-sm text-[#6e6e73]">
                Deal approvals, made simple.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[#1d1d1f] mb-3">Product</h4>
              <div className="space-y-2 text-sm text-[#6e6e73]">
                <a href="#" className="block hover:text-[#0071e3]">Features</a>
                <a href="#" className="block hover:text-[#0071e3]">Pricing</a>
                <a href="#" className="block hover:text-[#0071e3]">Integrations</a>
                <a href="#" className="block hover:text-[#0071e3]">Changelog</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-[#1d1d1f] mb-3">Company</h4>
              <div className="space-y-2 text-sm text-[#6e6e73]">
                <a href="#" className="block hover:text-[#0071e3]">About</a>
                <a href="#" className="block hover:text-[#0071e3]">Blog</a>
                <a href="#" className="block hover:text-[#0071e3]">Careers</a>
                <a href="#" className="block hover:text-[#0071e3]">Contact</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-[#1d1d1f] mb-3">Legal</h4>
              <div className="space-y-2 text-sm text-[#6e6e73]">
                <a href="#" className="block hover:text-[#0071e3]">Privacy</a>
                <a href="#" className="block hover:text-[#0071e3]">Terms</a>
                <a href="#" className="block hover:text-[#0071e3]">Security</a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200">
            <p className="text-sm text-[#6e6e73] text-center">
              © 2026 DealPress. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
