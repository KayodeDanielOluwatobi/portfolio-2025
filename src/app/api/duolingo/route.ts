import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// TEMPORARY: Set to 0 to debug, change back to 3600 later
export const revalidate = 3600; 

export async function GET() {
  const username = 'Everdann';

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Fetch Duolingo & Gradients in parallel
    const [duoRes, gradientRes] = await Promise.all([
      fetch(`https://www.duolingo.com/2017-06-30/users?username=${username}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      }),
      supabase.from('duo_gradients').select('*')
    ]);

    // --- DEBUGGING LOGS ---
    // Look at your VS Code terminal when you refresh the page
    if (gradientRes.error) {
        console.error("❌ SUPABASE ERROR:", gradientRes.error.message);
    } else {
        console.log("✅ Gradients found:", gradientRes.data?.length);
    }
    // ---------------------

    if (!duoRes.ok) throw new Error('Duolingo API Failed');
    
    const duoData = await duoRes.json();
    const user = duoData.users[0];

    const flagMap: Record<string, string> = {
      zh: 'china.svg',
      ko: 'korea.svg',
      en: 'english.svg', // Changed to match your JSON "english.svg" if needed, check filename
      ja: 'japan.svg',
      music: 'music.svg',
      math: 'math.svg',
      chess: 'chess.svg', 
      tr: 'turk.svg',

    };

    const courses = user.courses
      .map((course: any) => ({
        title: course.title,
        lang: course.learningLanguage,
        xp: course.xp,
        // Fallback logic to prevent empty flags
        flag: flagMap[course.learningLanguage] || `${course.learningLanguage}.svg` 
      }))
      .sort((a: any, b: any) => b.xp - a.xp);

    const streakEndDate = user.streakData?.currentStreak?.endDate;
    const today = new Date().toISOString().split('T')[0];
    const isLessonComplete = streakEndDate === today;

    // Gradient Logic
    const gradients = gradientRes.data || [];
    let dailyGradient = { from: '#015A3A', to: '#008A59' }; // Default Green
    
    if (gradients.length > 0) {
        // Calculate Day of Year (0-365)
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        
        // Pick based on day
        let index = dayOfYear % gradients.length;
        
        // DEBUG MODE: If revalidate is 0, pick RANDOM to prove it works
        if (revalidate === 3600) {
            index = Math.floor(Math.random() * gradients.length);
            console.log(`🎲 DEBUG MODE: Picked Random Gradient Index: ${index}`);
        } else {
            console.log(`📅 DAILY MODE: Day ${dayOfYear} -> Index ${index}`);
        }

        if (gradients[index]) {
            dailyGradient = { 
                from: gradients[index].color_from, 
                to: gradients[index].color_to 
            };
        }
    }

    return NextResponse.json({
      name: user.name,
      username: user.username,
      streak: user.streak,
      isLessonComplete,
      courses,
      dailyGradient
    });

  } catch (error) {
    console.error('Widget Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}