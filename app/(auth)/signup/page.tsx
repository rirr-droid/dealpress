"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMagicLink, setUseMagicLink] = useState(true); // Default to magic link
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const router = useRouter();

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to sign up with Google");
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (useMagicLink) {
        // Send magic link
        const response = await fetch('/api/auth/magic-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            name,
            companyName,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send magic link');
        }

        setMagicLinkSent(true);
      } else {
        // Traditional signup with password
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            name,
            companyName,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Signup failed');
        }

        // Sign in the user after successful signup
        const supabase = createClient();
        await supabase.auth.signInWithPassword({ email, password });

        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError(error instanceof Error ? error.message : "Failed to create account");
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
            Get started free
          </h1>
          <p className="text-[#86868b]">
            {useMagicLink ? "No password needed - we'll email you a login link" : "Create your DealPress account"}
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
              Click the link in the email to instantly access your account
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Google Sign Up */}
        <Button
          type="button"
          onClick={handleGoogleSignup}
          disabled={loading}
          variant="outline"
          className="w-full h-12 rounded-full border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 mb-6"
        >
          <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign up with Google
        </Button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-[#86868b]">Or continue with email</span>
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[#1d1d1f] mb-2"
            >
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="h-12 rounded-xl border-gray-200"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#1d1d1f] mb-2"
            >
              Work Email
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

          <div>
            <label
              htmlFor="companyName"
              className="block text-sm font-medium text-[#1d1d1f] mb-2"
            >
              Company Name
            </label>
            <Input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Corp"
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
                placeholder="Create a strong password"
                required={!useMagicLink}
                minLength={8}
                className="h-12 rounded-xl border-gray-200"
              />
              <p className="text-xs text-[#86868b] mt-1">
                Minimum 8 characters
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || magicLinkSent}
            className="w-full h-12 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full text-base font-semibold mt-6"
          >
            {loading ? (useMagicLink ? "Sending magic link..." : "Creating account...") : (useMagicLink ? "Send Magic Link" : "Create Account")}
          </Button>

          {/* Toggle Magic Link / Password */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setUseMagicLink(!useMagicLink)}
              className="text-sm text-[#0071e3] hover:underline"
            >
              {useMagicLink ? "Use password instead" : "Use magic link instead"}
            </button>
          </div>
        </form>

        {/* Terms */}
        <p className="text-xs text-center text-[#86868b] mt-4">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-[#86868b]">or</span>
          </div>
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-[#86868b]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#0071e3] hover:underline font-semibold"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </>
  );
}
