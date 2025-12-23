import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  // 1. Debugging: Check if keys exist
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("❌ Missing Supabase Environment Variables!");
    return NextResponse.json({ error: 'Internal Server Error: Missing Supabase Keys' }, { status: 500 });
  }

  // 2. Initialize
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data, error } = await supabase
    .from('reading_list')
    .select('*')
    .eq('is_active', true)
    .order('id', { ascending: false });

  if (error) {
    console.error("❌ Supabase Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}