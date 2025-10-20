// src/app/api/spotify/currently-playing/route.ts

import { NextRequest, NextResponse } from 'next/server';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
}

interface CurrentlyPlayingResponse {
  item: SpotifyTrack | null;
  is_playing: boolean;
  progress_ms: number;
}

// Get new access token using refresh token
async function getAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Spotify credentials in environment variables');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh Spotify token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Fetch currently playing track
async function getCurrentlyPlaying(accessToken: string) {
  const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // 204 No Content means nothing is playing
  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch currently playing: ${response.statusText}`);
  }

  return await response.json();
}

// Fetch recently played track (fallback if nothing currently playing)
async function getRecentlyPlayed(accessToken: string) {
  const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch recently played: ${response.statusText}`);
  }

  const data = await response.json();
  return data.items[0]?.track || null;
}

export async function GET(request: NextRequest) {
  try {
    // Get fresh access token
    const accessToken = await getAccessToken();

    // Get currently playing
    let currentlyPlaying = await getCurrentlyPlaying(accessToken);

    // If nothing playing, get recently played
    let track = null;
    let isPlaying = false;
    let progressMs = 0;

    if (currentlyPlaying && currentlyPlaying.item) {
      track = currentlyPlaying.item;
      isPlaying = currentlyPlaying.is_playing;
      progressMs = currentlyPlaying.progress_ms || 0;
    } else {
      track = await getRecentlyPlayed(accessToken);
    }

    if (!track) {
      return NextResponse.json(
        { error: 'No track found' },
        { status: 404 }
      );
    }

    // Extract relevant data
    const response = {
      track: {
        id: track.id,
        name: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        albumArt: track.album.images[0]?.url, // Highest quality image
        duration: track.duration_ms,
      },
      isPlaying,
      progressMs,
      timestamp: Date.now(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Spotify API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}