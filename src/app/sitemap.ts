import { MetadataRoute } from 'next'
import { supabase } from '@/utils/supabase/client' // Assuming your supabase client is here

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://everdann.vercel.app'

  // Fetch your dynamic project slugs from Supabase
  // You might need to fetch from multiple tables if your projects are split
  const { data: projects } = await supabase
    .from('projects_table_name') // Replace with your actual project table name
    .select('slug, updated_at')

  const projectUrls = (projects || []).map((project) => ({
    url: `${baseUrl}/works/${project.slug}`,
    lastModified: project.updated_at || new Date(),
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...projectUrls,
  ]
}