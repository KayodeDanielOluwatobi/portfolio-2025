'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase/client';

interface ViewCounterProps {
  slug: string;
  table: string;
  onUpdate?: (newCount: number) => void;
}

export default function ViewCounter({ slug, table, onUpdate }: ViewCounterProps) {
  const hasIncremented = useRef(false);

  useEffect(() => {
    // Safety checks
    if (!slug || !table || hasIncremented.current) return;

    const handleViewTracking = async () => {
      // 1. Lock the render cycle immediately
      hasIncremented.current = true;

      // 2. Check if this specific project was already viewed in this session
      const sessionKey = `viewed_${slug}`;
      const hasViewedThisSession = sessionStorage.getItem(sessionKey);

      try {
        // 3. ONLY increment if they haven't seen it this session
        if (!hasViewedThisSession) {
          const { error: rpcError } = await supabase.rpc('increment_views', {
            table_name: table,
            row_slug: slug,
          });

          if (rpcError) throw rpcError;
          
          // Mark as viewed so refresh doesn't count again
          sessionStorage.setItem(sessionKey, 'true');
        }

        // 4. ALWAYS fetch the most recent count to sync the UI
        const { data, error: fetchError } = await supabase
          .from(table)
          .select('views')
          .eq('slug', slug)
          .single();

        if (fetchError) throw fetchError;

        if (data && onUpdate) {
          onUpdate(data.views);
        }
      } catch (err) {
        console.error('View Counter Error:', err);
      }
    };

    handleViewTracking();
  }, [slug, table]); // Only re-run if we navigate to a different project

  return null;
}