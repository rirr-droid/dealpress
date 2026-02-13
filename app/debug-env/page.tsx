"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function DebugEnv() {
  const [testResult, setTestResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const testSupabaseConnection = async () => {
    setLoading(true);
    setTestResult("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setTestResult(`❌ Error: ${error.message}`);
      } else {
        setTestResult(`✅ Success! Supabase client working. Session: ${data.session ? 'Active' : 'None'}`);
      }
    } catch (err) {
      setTestResult(`❌ Exception: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Debug</h1>
      <div className="space-y-4">
        <div className="border p-4 rounded">
          <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong></p>
          <p className="font-mono text-sm break-all">{url || 'UNDEFINED'}</p>
          <p className="text-xs text-gray-500">Length: {url.length} chars</p>
          <p className="text-xs text-gray-500">Starts with https: {url.startsWith('https://') ? 'YES' : 'NO'}</p>
        </div>

        <div className="border p-4 rounded">
          <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong></p>
          <p className="font-mono text-sm break-all">{key || 'UNDEFINED'}</p>
          <p className="text-xs text-gray-500">Length: {key.length} chars</p>
          <p className="text-xs text-gray-500">Starts with eyJ: {key.startsWith('eyJ') ? 'YES' : 'NO'}</p>
        </div>

        <div className="border p-4 rounded">
          <p><strong>NEXT_PUBLIC_APP_URL:</strong></p>
          <p className="font-mono text-sm">{process.env.NEXT_PUBLIC_APP_URL || 'UNDEFINED'}</p>
        </div>

        <div className="border p-4 rounded bg-blue-50">
          <p className="font-bold mb-2">Test Supabase Connection:</p>
          <button
            onClick={testSupabaseConnection}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test Connection'}
          </button>
          {testResult && (
            <p className="mt-4 p-2 bg-white rounded text-sm">{testResult}</p>
          )}
        </div>
      </div>
    </div>
  );
}
