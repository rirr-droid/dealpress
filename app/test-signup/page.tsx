"use client";

import { createClient } from '@supabase/supabase-js';
import { useState } from "react";

export default function TestSignup() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testHardcodedSignup = async () => {
    setLoading(true);
    setResult("");

    try {
      // Hardcoded credentials to test
      const supabase = createClient(
        'https://almsovwytbnkdsrfanab.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsbXNvdnd5dGJua2RzcmZhbmFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzMyMDMsImV4cCI6MjA4NjUwOTIwM30.1G0Sykiy5eGLcB5zqldMbp_D1DixSgsGN3_2JDdU7JA'
      );

      console.log('Hardcoded client created');

      const { data, error } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword123',
        options: {
          data: {
            name: 'Test User',
            company_name: 'Test Company',
          },
        },
      });

      console.log('Response:', { data, error });

      if (error) {
        setResult(`❌ Error: ${error.message}`);
      } else if (data.user) {
        setResult(`✅ Success! User created: ${data.user.email}`);
      } else {
        setResult(`⚠️ No error, but no user returned`);
      }
    } catch (err) {
      console.error('Exception:', err);
      setResult(`❌ Exception: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Signup (Hardcoded)</h1>
      <p className="mb-4 text-gray-600">
        This test uses hardcoded Supabase credentials to eliminate any environment variable issues.
      </p>
      <button
        onClick={testHardcodedSignup}
        disabled={loading}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Testing...' : 'Test Hardcoded Signup'}
      </button>
      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm font-mono whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  );
}
