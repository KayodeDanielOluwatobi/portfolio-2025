import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const TABLES = ['works_brands', 'works_socials', 'works_church', 'works_publishing'] as const;
type TableName = (typeof TABLES)[number];

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL or Key is missing. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
  }

  return createClient(url, key);
}

// GET /api/admin/projects
//   → returns all projects (list view, no full case_study_data)
// GET /api/admin/projects?slug=xxx&table=works_brands
//   → returns single project's full case_study_data
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const table = searchParams.get('table') as TableName | null;

  // ── Single project fetch (for loading into the builder) ──────────────────
  if (slug && table) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 });
    }

    const defaultMedia = Array.isArray(data.media) ? data.media[0] : data.media;

    return NextResponse.json({
      caseStudyData: data.case_study_data || null,
      heroImage: data.case_study_data?.hero_image || defaultMedia || '',
      brandLogo: data.case_study_data?.brand_logo || data.case_study_data?.logo || '',
      brandLogoSize: Number(data.case_study_data?.brand_logo_size) || 100,
    });
  }

  // ── All projects list ─────────────────────────────────────────────────────
  const results = await Promise.allSettled(
    TABLES.map(async (t) => {
      // Use select('*') — safer than listing specific columns that may not
      // exist on every table (e.g. brand_name or rank).
      const { data, error } = await supabase
        .from(t)
        .select('*');

      if (error) {
        console.error(`[admin/projects] Error fetching ${t}:`, error.message);
        return [] as any[];
      }
      if (!data) return [] as any[];

      return data.map((row) => ({
        id: row.id,
        slug: row.slug || String(row.id),
        // brand_name takes priority (brands table uses it), title is fallback
        title: row.brand_name || row.title || row.slug || `Project #${row.id}`,
        table: t,
        hasCaseStudy: !!(row.case_study_data?.rows?.length > 0),
        rowCount: row.case_study_data?.rows?.length ?? 0,
      }));
    })
  );

  const projects = results.flatMap((r) => {
    if (r.status === 'rejected') {
      console.error('[admin/projects] Promise rejected:', r.reason);
      return [];
    }
    return r.value;
  });

    return NextResponse.json({ projects });
  } catch (err: any) {
    console.error('[admin/projects] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch projects', projects: [] },
      { status: 500 }
    );
  }
}
