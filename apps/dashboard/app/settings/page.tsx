"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [budget, setBudget] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">Configure your ClaudeWatch instance</p>
      </div>

      <div className="space-y-6">
        <div className="bg-card border border-border rounded-sm p-5">
          <h3 className="text-sm font-medium mb-4">Budget</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Monthly budget (USD)
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="50.00"
                className="w-full px-3 py-2 text-sm border border-border rounded-sm bg-background focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs bg-teal-600 text-white rounded-sm hover:bg-teal-700 transition-colors"
            >
              {saved ? "Saved" : "Save Budget"}
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-sm p-5">
          <h3 className="text-sm font-medium mb-4">Proxy Configuration</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Proxy URL</span>
              <code className="font-mono bg-muted px-2 py-0.5 rounded-sm">http://localhost:3001</code>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">API Endpoint</span>
              <code className="font-mono bg-muted px-2 py-0.5 rounded-sm">POST /v1/messages</code>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Database</span>
              <code className="font-mono bg-muted px-2 py-0.5 rounded-sm">SQLite (local)</code>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-sm p-5">
          <h3 className="text-sm font-medium mb-4">Quick Setup</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Point your Anthropic client to the proxy:
          </p>
          <pre className="bg-muted p-3 rounded-sm text-xs font-mono overflow-x-auto">
{`const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: 'http://localhost:3001',
});`}
          </pre>
        </div>
      </div>
    </div>
  );
}
