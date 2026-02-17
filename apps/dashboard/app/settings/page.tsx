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
      <div className="mb-8">
        <h2 className="text-xl font-sans font-semibold text-foreground">
          Settings
        </h2>
        <p className="text-sm text-muted-foreground font-serif mt-1">
          Configure your ClaudeWatch instance.
        </p>
      </div>

      <div className="space-y-6">
        <div className="paper rounded p-6">
          <h3 className="text-[13px] font-sans font-medium text-foreground mb-4">
            Monthly Budget
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-muted-foreground font-sans mb-1.5">
                Budget limit (USD)
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="50.00"
                className="w-full px-3 py-2 text-sm font-serif border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
              />
            </div>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-sans font-medium bg-accent text-accent-foreground rounded hover:bg-accent-light transition-colors"
            >
              {saved ? "Saved" : "Save Budget"}
            </button>
          </div>
        </div>

        <div className="paper rounded p-6">
          <h3 className="text-[13px] font-sans font-medium text-foreground mb-4">
            Proxy Configuration
          </h3>
          <div className="space-y-0 divide-y divide-border text-[13px]">
            <div className="flex justify-between py-3">
              <span className="text-muted-foreground font-serif">Proxy URL</span>
              <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-ink-700">
                http://localhost:3001
              </code>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-muted-foreground font-serif">API Endpoint</span>
              <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-ink-700">
                POST /v1/messages
              </code>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-muted-foreground font-serif">Database</span>
              <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-ink-700">
                SQLite (local)
              </code>
            </div>
          </div>
        </div>

        <div className="paper rounded p-6">
          <h3 className="text-[13px] font-sans font-medium text-foreground mb-2">
            Quick Setup
          </h3>
          <p className="text-[13px] text-muted-foreground font-serif mb-4">
            Point your Anthropic client to the proxy to begin tracking:
          </p>
          <pre className="bg-muted p-4 rounded text-xs font-mono overflow-x-auto text-ink-700 leading-relaxed">
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
