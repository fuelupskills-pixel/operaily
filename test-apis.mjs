import fs from 'fs';
import path from 'path';

// Minimal dotenv parser
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

console.log("--- Starting API Connectivity Checks ---\n");

async function checkSupabase() {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return console.log("❌ Supabase: Missing URL or Key");
  try {
    // Attempt to fetch from rest API
    const res = await fetch(`${url}/rest/v1/`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    if (res.ok) console.log("✅ Supabase: Connected successfully!");
    else console.log(`❌ Supabase: Connection failed (${res.status} ${res.statusText})`);
  } catch (e) {
    console.log("❌ Supabase: Error - " + e.message);
  }
}

async function checkGemini() {
  const key = env.GEMINI_API_KEY;
  if (!key) return console.log("❌ Gemini: Missing Key");
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
    });
    if (res.ok) console.log("✅ Gemini: Connected successfully!");
    else console.log(`❌ Gemini: Failed (${res.status} ${res.statusText})`);
  } catch (e) {
    console.log("❌ Gemini: Error - " + e.message);
  }
}

async function checkApollo() {
  const key = env.APOLLO_API_KEY;
  if (!key) return console.log("❌ Apollo: Missing Key");
  try {
    const res = await fetch('https://api.apollo.io/v1/auth/health', {
      headers: { 'Cache-Control': 'no-cache', 'Content-Type': 'application/json' }
    });
    // Apollo health endpoint doesn't strictly need auth, but let's check a protected one if health works.
    // Actually, let's just do a dummy search to verify auth.
    const authRes = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
      body: JSON.stringify({ api_key: key, q_keywords: "test", per_page: 1 })
    });
    if (authRes.ok) console.log("✅ Apollo: Authenticated successfully!");
    else console.log(`❌ Apollo: Auth failed (${authRes.status} ${authRes.statusText})`);
  } catch (e) {
    console.log("❌ Apollo: Error - " + e.message);
  }
}

async function checkResend() {
  const key = env.RESEND_API_KEY;
  if (!key) return console.log("❌ Resend: Missing Key");
  try {
    // Resend doesn't have a simple "whoami", but we can try to list domains or audiences to check auth.
    const res = await fetch('https://api.resend.com/domains', {
      headers: { 'Authorization': `Bearer ${key}` }
    });
    if (res.ok) console.log("✅ Resend: Authenticated successfully!");
    else console.log(`❌ Resend: Auth failed (${res.status} ${res.statusText}) - often 403/401 if invalid.`);
  } catch (e) {
    console.log("❌ Resend: Error - " + e.message);
  }
}

async function checkTelnyx() {
  const key = env.TELNYX_API_KEY;
  if (!key || key === 'your_telnyx_api_key') return console.log("❌ Telnyx: Missing Key");
  try {
    const res = await fetch('https://api.telnyx.com/v2/available_phone_numbers', {
      headers: { 'Authorization': `Bearer ${key}` }
    });
    if (res.ok) console.log("✅ Telnyx: Authenticated successfully!");
    else {
        const errData = await res.json().catch(()=>({}));
        console.log(`❌ Telnyx: Auth failed (${res.status} ${res.statusText}) - ${JSON.stringify(errData)}`);
    }
  } catch (e) {
    console.log("❌ Telnyx: Error - " + e.message);
  }
}

async function runAll() {
  await checkSupabase();
  await checkGemini();
  await checkApollo();
  await checkResend();
  await checkTelnyx();
  console.log("\n--- Checks Completed ---");
}

runAll();
