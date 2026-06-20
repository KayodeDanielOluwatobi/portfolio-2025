const fs = require('fs');
const readline = require('readline');

// Parse .env.local file manually
function loadEnv() {
  const envPath = '.env.local';
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local file not found!');
    process.exit(1);
  }
  const fileContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  fileContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      env[key] = val;
    }
  });
  return env;
}

const env = loadEnv();
const clientId = env.SPOTIFY_CLIENT_ID;
const clientSecret = env.SPOTIFY_CLIENT_SECRET;
const redirectUri = env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:8888/callback';

if (!clientId || !clientSecret) {
  console.error("Error: SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET is missing in .env.local");
  process.exit(1);
}

// Scopes required for player reading
const scopes = 'user-read-currently-playing user-read-recently-played';

// Generate authorization URL
const authUrl = `https://accounts.spotify.com/authorize?` + new URLSearchParams({
  response_type: 'code',
  client_id: clientId,
  scope: scopes,
  redirect_uri: redirectUri
}).toString();

console.log("\n========================================================");
console.log("SPOTIFY REFRESH TOKEN GENERATOR (Zero Dependencies)");
console.log("========================================================\n");
console.log("STEP 1: Open the following URL in your browser and click Authorize:");
console.log("\n" + authUrl + "\n");
console.log("STEP 2: After authorizing, your browser will redirect you to a page.");
console.log("Copy the redirect URL or code from your browser's address bar.");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('\nSTEP 3: Paste the redirect URL or raw code here and press Enter:\n> ', async (input) => {
  rl.close();
  try {
    const trimmedInput = input.trim();
    let code = null;

    // Robust extraction using RegExp
    const codeMatch = trimmedInput.match(/[?&]code=([^&]+)/);
    if (codeMatch) {
      code = codeMatch[1];
    } else if (trimmedInput.includes('code=')) {
      code = trimmedInput.split('code=')[1].split('&')[0];
    } else if (trimmedInput.length > 20) {
      // Assume they pasted the raw code directly
      code = trimmedInput;
    }

    if (!code) {
      throw new Error("Could not find or extract the authorization 'code'. Please make sure you copy the entire redirect URL or the raw code starting with 'AQ'.");
    }

    console.log("\nExchanging code for Spotify tokens...");
    
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      }).toString()
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to exchange code: ${response.statusText} (${errText})`);
    }

    const data = await response.json();
    console.log("\n========================================================");
    console.log("SUCCESS! HERE ARE YOUR SPOTIFY TOKENS:");
    console.log("========================================================\n");
    console.log("New Refresh Token:");
    console.log("\x1b[36m%s\x1b[0m", data.refresh_token);
    console.log("\nSTEP 4: Copy this refresh token and update:");
    console.log("1. SPOTIFY_REFRESH_TOKEN in your .env.local file");
    console.log("2. SPOTIFY_REFRESH_TOKEN in your Vercel Project Environment Variables");
    console.log("\n========================================================\n");

  } catch (error) {
    console.error("\n❌ Error:", error.message);
  }
});
