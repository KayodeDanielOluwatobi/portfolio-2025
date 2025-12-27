import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { table, id, color } = await req.json();

    // ⚠️ IMPORTANT: We use the SERVICE_ROLE_KEY here.
    // This gives this specific API route "Super Admin" powers to bypass RLS and write data.
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY! 
    );

    const { error } = await supabaseAdmin
      .from(table)
      .update({ extracted_color: color })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}