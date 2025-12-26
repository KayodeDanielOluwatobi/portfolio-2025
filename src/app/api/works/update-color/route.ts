import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractDominantColor } from '@/lib/colorExtractor';

// ⚠️ CRITICAL CHANGE: Use SERVICE_ROLE_KEY here
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  // If this key is missing, it falls back to Anon and fails silently!
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { id, imageUrl, tableName } = await request.json();

    if (!id || !imageUrl || !tableName) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    console.log(`🎨 Extracting color for ID ${id}...`);
    const newColor = await extractDominantColor(imageUrl);
    console.log(`🎨 Extracted: ${newColor}`);

    // 2. Update Supabase AND check if it actually worked
    const { data, error, count } = await supabase
      .from(tableName)
      .update({ brand_color: newColor })
      .eq('id', id)
      .select(); // 👈 This is important to see what happened

    if (error) {
        console.error('❌ Database Error:', error);
        throw error;
    }

    // 🚨 THE GHOST DETECTOR
    if (!data || data.length === 0) {
        console.error('👻 Ghost Update Detected! RLS blocked the write.');
        return NextResponse.json({ 
            error: 'Database write failed silently. Check if SERVICE_ROLE_KEY is set correctly in .env' 
        }, { status: 403 });
    }

    console.log(`✅ Success! Updated ID ${id} with color ${newColor}`);
    
    return NextResponse.json({ success: true, color: newColor, data });

  } catch (error: any) {
    console.error('Update failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}