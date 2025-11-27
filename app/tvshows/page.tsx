// app/tvshows/page.tsx

import { Suspense } from 'react';
import { tmdbApi } from '@/lib/api/tmdb';
import TVShowsPageClient from '@/components/pages/TVShowsPageClient';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// ✅ STEP 1: Configure Static Generation with ISR
export const dynamic = 'force-static';  // Force static generation
export const revalidate = 3600;         // Revalidate every hour

// ✅ STEP 2: Generate Metadata
export const metadata = {
  title: 'TV Shows - Discover Amazing Series & Documentaries | Atto4',
  description: 'Browse thousands of TV shows including dramas, comedies, documentaries, and more. Filter by genre, sort by popularity, and discover your next binge-worthy series.',
  keywords: 'tv shows, series, documentaries, drama, comedy, watch tv online, Atto4',
  openGraph: {
    title: 'TV Shows | Atto4',
    description: 'Discover amazing series and documentaries',
    type: 'website',
    url: 'https://atto4.pro/tvshows',
  },
};

// ✅ STEP 3: Fetch Initial Data at Build Time
async function getTVShowsPageData() {
  try {
    console.log('📥 Fetching TV shows page data at build time...');

    // Fetch genres and initial popular shows in parallel
    const [genres, popularShows] = await Promise.all([
      tmdbApi.getTVGenres(),
      tmdbApi.getPopularTVShows(1),
    ]);

    console.log(`✅ Fetched ${popularShows.results?.length || 0} shows and ${genres?.length || 0} genres`);

    return {
      genres: genres || [],
      initialShows: popularShows.results || [],
      totalPages: popularShows.total_pages || 1,
    };
  } catch (error) {
    console.error('❌ Failed to fetch TV shows page data:', error);
    return {
      genres: [],
      initialShows: [],
      totalPages: 0,
    };
  }
}

// ✅ STEP 4: Main TV Shows Page Component (Statically Generated)
export default async function TVShowsPage() {
  const data = await getTVShowsPageData();

  console.log('📺 Rendering static TV shows page');

  return (
    <div className="min-h-screen bg-black text-white">
      <Suspense fallback={<LoadingSpinner />}>
        <TVShowsPageClient 
          initialGenres={data.genres}
          initialShows={data.initialShows}
          initialTotalPages={data.totalPages}
        />
      </Suspense>
    </div>
  );
}
