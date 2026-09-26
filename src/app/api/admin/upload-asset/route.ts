import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { randomUUID } from 'crypto';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL or Key is missing. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
  }

  return createClient(url, key);
}

// POST /api/admin/upload-asset
// FormData fields: file, type ('image'|'video'), table, slug
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const formData = await request.formData();

    const file = formData.get('file') as File | null;
    const assetType = formData.get('type') as 'image' | 'video';
    const table = formData.get('table') as string;
    const slug = formData.get('slug') as string;

    if (!file || !assetType || !table || !slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const uuid = randomUUID();

    let uploadBuffer: Buffer;
    let contentType: string;
    let extension: string;

    if (assetType === 'image') {
      const isAlreadyAvif =
        file.type === 'image/avif' ||
        file.name.toLowerCase().endsWith('.avif');

      if (isAlreadyAvif) {
        uploadBuffer = rawBuffer;
        contentType = 'image/avif';
        extension = 'avif';
      } else {
        try {
          // Convert to AVIF server-side via sharp
          uploadBuffer = await sharp(rawBuffer)
            .avif({ quality: 80, effort: 4 })
            .toBuffer();
          contentType = 'image/avif';
          extension = 'avif';
        } catch (sharpError) {
          console.warn('[upload-asset] Sharp AVIF conversion fallback to original format:', sharpError);
          uploadBuffer = rawBuffer;
          contentType = file.type || 'image/jpeg';
          const originalExt = file.name.split('.').pop()?.toLowerCase();
          extension = originalExt || 'jpg';
        }
      }
    } else {
      // Videos pass through as-is
      uploadBuffer = rawBuffer;
      contentType = file.type || 'video/mp4';
      const originalExt = file.name.split('.').pop();
      extension = originalExt || 'mp4';
    }

    // Path convention: case-study/{table}/{slug}/{uuid}.{ext}
    const storagePath = `${table}/${slug}/${uuid}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('case-study')
      .upload(storagePath, uploadBuffer, {
        contentType,
        upsert: false,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from('case-study')
      .getPublicUrl(storagePath);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (err: any) {
    console.error('Upload handler error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
