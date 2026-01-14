import { supabase } from '@/utils/supabase/client';

export async function getProjectBySlug(slug: string) {
  // We check all tables to find where the project lives
  const tables = ['works_brands', 'works_socials', 'works_church'];
  
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('slug', slug)
      .single();

    if (data && !error) {
      // 🛑 READINESS CHECK: 
      // A project is "ready" only if it has case_study_data with at least one row.
      const hasContent = data.case_study_data?.rows && data.case_study_data.rows.length > 0;

      if (!hasContent) {
        return null; // Triggers the 404 in the page component
      }

      // Attach originTable for the RelatedProjects component
      return { ...data, originTable: table };
    }
  }
  return null;
}