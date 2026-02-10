"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    const supabase = createClient();
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            company_name: companyName,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // User created successfully
        // The database trigger will handle creating the org and profile
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
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
            Create your DealPress account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

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
              required
              minLength={8}
              className="h-12 rounded-xl border-gray-200"
            />
            <p className="text-xs text-[#86868b] mt-1">
              Minimum 8 characters
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full text-base font-semibold mt-6"
          >
            {loading ? "Creating account..." : "Create Account"}
          </Button>
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
