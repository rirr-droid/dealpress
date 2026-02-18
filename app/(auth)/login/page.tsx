"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (useMagicLink) {
        // Send magic link
        const response = await fetch('/api/auth/magic-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send magic link');
        }

        setMagicLinkSent(true);
      } else {
        // Traditional password login
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.session) {
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Back to Landing */}
      <Link href="/">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </Link>

      <Card className="p-8 rounded-[24px] border border-gray-200 shadow-lg">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2">
            Welcome back
          </h1>
          <p className="text-[#86868b]">
            Sign in to your DealPress account
          </p>
        </div>

        {/* Magic Link Sent Success */}
        {magicLinkSent && (
          <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-xl text-center">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Check your email!</h3>
            <p className="text-sm text-green-700 mb-4">
              We sent a magic link to <strong>{email}</strong>
            </p>
            <p className="text-xs text-green-600">
              Click the link to instantly sign in
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#1d1d1f] mb-2"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="h-12 rounded-xl border-gray-200"
            />
          </div>

          {!useMagicLink && (
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#1d1d1f] mb-2"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required={!useMagicLink}
                className="h-12 rounded-xl border-gray-200"
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || magicLinkSent}
            className="w-full h-12 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full text-base font-semibold mt-6"
          >
            {loading ? (useMagicLink ? "Sending..." : "Signing in...") : (useMagicLink ? "Send Magic Link" : "Sign In")}
          </Button>

          {/* Toggle Magic Link / Password */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setUseMagicLink(!useMagicLink)}
              className="text-sm text-[#0071e3] hover:underline"
            >
              {useMagicLink ? "Use password instead" : "Send me a magic link"}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-[#86868b]">or</span>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-[#86868b]">
          Do not have an account?{" "}
          <Link
            href="/signup"
            className="text-[#0071e3] hover:underline font-semibold"
          >
            Sign up for free
          </Link>
        </p>
      </Card>
    </>
  );
}
