//watch-list/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Missing Supabase Keys' }, { status: 500 });
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing TMDB_API_KEY' }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // 1. Fetch list from Supabase
  const { data: watchList, error } = await supabase
    .from('watch_list')
    .select('*')
    .eq('is_active', true)
    .order('id', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const enrichedList = [];

  // 2. Loop through and enrich
  for (const item of watchList || []) {
    if (!item.type || !item.query) continue;

    try {
      // A. SEARCH
      const searchUrl = `https://api.themoviedb.org/3/search/${item.type}?api_key=${apiKey}&query=${encodeURIComponent(item.query)}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      const show = searchData.results?.[0];

      if (show) {
        // B. IMAGES (Logos)
        const imagesUrl = `https://api.themoviedb.org/3/${item.type}/${show.id}/images?api_key=${apiKey}&include_image_language=en,null`;
        const imagesRes = await fetch(imagesUrl);
        const imagesData = await imagesRes.json();
        const logoPath = imagesData.logos?.[0]?.file_path;

        // C. PROVIDERS (Streaming Services)
        const providersUrl = `https://api.themoviedb.org/3/${item.type}/${show.id}/watch/providers?api_key=${apiKey}`;
        const providersRes = await fetch(providersUrl);
        const providersData = await providersRes.json();
        // Get US provider, fallback to first available if needed, or specific region
        const provider = providersData.results?.NG?.flatrate?.[0] || providersData.results?.US?.flatrate?.[0];
        const providerLogo = provider?.logo_path;

        // --- D. CUSTOM OVERRIDES ---
        let finalTitle = show.name || show.title;
        if (item.season) {
            finalTitle = `${finalTitle}: Season ${item.season}`;
        }

        let finalBackdrop = show.backdrop_path 
            ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}` 
            : null;
            
        if (item.custom_image) {
            finalBackdrop = item.custom_image;
        }

        enrichedList.push({
          id: show.id,
          title: finalTitle,
          backdrop: finalBackdrop,
          logo: logoPath ? `https://image.tmdb.org/t/p/w500${logoPath}` : null,
          provider_logo: providerLogo ? `https://image.tmdb.org/t/p/w92${providerLogo}` : null, // Small size is enough
          progress: item.progress,
          myrating: item.myrating // <--- ADDED: Passing the rating to the frontend
        });
      }
    } catch (err) {
      console.error(`Failed to fetch data for ${item.query}`, err);
    }
  }

  return NextResponse.json(enrichedList);
}