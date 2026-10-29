# Soundwave

A Spotify browser client built with Vue 3, Vite, and Pinia. Browsing and playback use the Spotify Web API; playback in the browser requires a Spotify Premium account.

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env` and set `VITE_SPOTIFY_CLIENT_ID` to your Spotify application's client ID. Keep `VITE_REDIRECT_URI` set to the callback URL you configure in the Spotify Developer Dashboard (the example uses `http://127.0.0.1:5173/callback`).
3. Add that exact redirect URL to the Spotify application's allowed redirect URIs.
4. Start the development server:

   ```sh
   npm run dev
   ```

## Production build

```sh
npm run build
npm run preview
```
