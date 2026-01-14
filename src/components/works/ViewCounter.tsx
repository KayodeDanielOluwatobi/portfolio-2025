'use client';

import { useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';

export default function ViewCounter({ 
  slug, 
  table 
}: { 
  slug: string; 
  table: string; 
}) {
  useEffect(() => {
    if (!slug || !table) return;

    const incrementViews = async () => {
      // Calls the PostgreSQL function you created in the Supabase SQL editor
      const { error } = await supabase.rpc('increment_views', { 
        table_name: table, 
        row_slug: slug 
      });

      if (error) console.error('View Tracking Error:', error.message);
    };

    incrementViews();
  }, [slug, table]);

  return null; // This component stays invisible
}