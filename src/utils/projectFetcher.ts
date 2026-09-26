import { supabase } from '@/utils/supabase/client';

export async function getProjectBySlug(slug: string) {
  // We check all tables to find where the project lives
  const tables = ['works_brands', 'works_socials', 'works_church', 'works_publishing'];
  
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('slug', slug)
      .single();

    if (data && !error) {
      // 🛑 READINESS CHECK: 
      // A project is "ready" if it has case study bento rows, a custom hero image,
      // a brand logo, or editorial description content.
      const hasContent =
        (Array.isArray(data.case_study_data?.rows) && data.case_study_data.rows.length > 0) ||
        Boolean(data.case_study_data?.hero_image) ||
        Boolean(data.case_study_data?.brand_logo || data.case_study_data?.logo) ||
        Boolean(data.description || data.about_brand);

      if (!hasContent) {
        return null; // Triggers the 404 in the page component
      }

      // Attach originTable for the RelatedProjects component
      return { ...data, originTable: table };
    }
  }
  return null;
}