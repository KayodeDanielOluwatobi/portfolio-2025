import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { table, id, color } = body; 

    // Admin Client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );

    // 👇 SIMPLIFIED LOGIC: Always match by ID
    // Since you fixed the GET API, 'id' is now the correct Supabase ID (1, 2, 3...)
    // This works perfectly for watch_list, featuredbrands, etc.
    const { data, error } = await supabaseAdmin
      .from(table)
      .update({ extracted_color: color })
      .eq('id', id) // 👈 Always match the Primary Key
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      console.warn(`⚠️ No rows updated for ${table} ID: ${id}.`);
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}