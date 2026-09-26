import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL or Key is missing. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
  }

  return createClient(url, key);
}

// POST /api/admin/save-case-study
// Body: { slug, table, rows }
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { slug, table, rows, hero_image, brand_logo, brand_logo_size } = body;

    if (!slug || !table || !Array.isArray(rows)) {
      return NextResponse.json({ error: 'Missing required fields: slug, table, rows' }, { status: 400 });
    }

    // Strip client-side `id` field before saving to DB — BentoRenderer doesn't use it
    const cleanRows = rows.map(({ id: _clientId, ...rest }: any) => rest);

    const updatePayload: Record<string, any> = {
      case_study_data: {
        rows: cleanRows,
        ...(hero_image !== undefined ? { hero_image } : {}),
        ...(brand_logo !== undefined ? { brand_logo } : {}),
        ...(brand_logo_size !== undefined ? { brand_logo_size: Number(brand_logo_size) } : {}),
      },
    };

    const { data, error } = await supabase
      .from(table)
      .update(updatePayload)
      .eq('slug', slug)
      .select('slug');

    if (error) {
      console.error('DB update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: `No row found for slug "${slug}" in ${table}. Check RLS or that the slug exists.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, rowCount: cleanRows.length });
  } catch (err: any) {
    console.error('Save handler error:', err);
    return NextResponse.json({ error: err.message || 'Save failed' }, { status: 500 });
  }
}
