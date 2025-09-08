# ChronoSnap

Time-travel selfie booth built for the Nano Banana hackathon.

## Development

This project is designed for Cloudflare Pages + Functions.

### Environment Variables
- `GEMINI_API_KEY` – Gemini API key.
- `ELEVEN_API_KEY` – ElevenLabs API key (optional for voice narration).

### Local Testing
```
# Run from project root
npx wrangler pages dev public
```

### Testing
Install Playwright and other dependencies before executing the test suite:
```
npm install
npm test
```

### Deploying
1. Push this folder to a Git repository.
2. Create a Cloudflare Pages project pointing at this directory.
3. Add the environment variables above in the Pages settings.

### Usage
Open the site, upload a selfie, select one or more scenarios, and click **Generate**. The worker searches Unsplash for a public background photo for each scenario, then returns edited images using Gemini along with optional audio narrations.
