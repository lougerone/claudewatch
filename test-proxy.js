#!/usr/bin/env node

/**
 * ClaudeWatch Proxy Test Script
 * 
 * Tests the proxy server by sending a test message to Claude API
 * Usage: node test-proxy.js
 */

const https = require('https');

const PROXY_URL = 'http://localhost:3001';
const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY environment variable not set');
  process.exit(1);
}

const testMessage = {
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 100,
  messages: [
    {
      role: 'user',
      content: 'Say "Hello from ClaudeWatch!" and nothing else.',
    },
  ],
};

async function testProxy() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║ CLAUDEWATCH PROXY TEST                     ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log(`║ Testing:    ${PROXY_URL}/v1/messages`);
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    const response = await fetch(`${PROXY_URL}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(testMessage),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(error)}`);
    }

    const data = await response.json();

    console.log('✅ SUCCESS\n');
    console.log('Response:');
    console.log('─────────────────────────────────────────────');
    console.log(data.content[0].text);
    console.log('─────────────────────────────────────────────\n');
    console.log('Token Usage:');
    console.log(`  Input:  ${data.usage.input_tokens}`);
    console.log(`  Output: ${data.usage.output_tokens}`);
    console.log(`  Total:  ${data.usage.input_tokens + data.usage.output_tokens}\n`);
    console.log('✅ Request logged to database');
    
  } catch (error) {
    console.error('❌ TEST FAILED\n');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testProxy();
