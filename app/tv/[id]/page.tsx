// app/tv/[id]/page.tsx

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { tmdbApi } from '@/lib/api/tmdb';
import TvShowDetailsClient from '@/components/media/TVDetailsClient';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface TVPageProps {
  params: Promise<{ id: string }>;
}

// ✅ STEP 1: Generate Static Paths (Pre-render popular TV shows at build time)
export async function generateStaticParams() {
  try {
    console.log('🔨 Building static TV show pages...');

    // Fetch multiple TV show lists to maximize pre-rendered pages
    const [popular, topRated, onTheAir, airingToday] = await Promise.all([
      tmdbApi.getPopularTVShows(1),
      tmdbApi.getTopRatedTVShows(1),
      tmdbApi.getOnTheAirTVShows(1),
      tmdbApi.getAiringTodayTVShows(1),
    ]);

    // Combine all TV shows
    const allShows = [
      ...popular.results,
      ...topRated.results,
      ...onTheAir.results,
      ...airingToday.results,
    ];

    // Remove duplicates by ID
    const uniqueShowIds = Array.from(
      new Set(allShows.map(show => show.id))
    );

    console.log(`📊 Pre-rendering ${uniqueShowIds.length} TV show pages at build time`);

    // Return TV show IDs as strings for static generation
    return uniqueShowIds.map((id) => ({
      id: id.toString(),
    }));
  } catch (error) {
    console.error('❌ Failed to generate static params:', error);
    return [];
  }
}

// ✅ STEP 2: Configure Static Rendering with ISR
export const dynamic = 'force-static';  // Force static generation
export const revalidate = 86400;        // Revalidate every 24 hours (ISR)
export const dynamicParams = true;      // Allow on-demand generation for shows not pre-rendered

// ✅ STEP 3: Fetch TV Show Data at Build Time
async function getTVShowData(id: string) {
  try {
    const tvId = parseInt(id);
    if (isNaN(tvId) || tvId <= 0) {
      console.error(`❌ Invalid TV show ID: ${id}`);
      return null;
    }

    console.log(`📥 Fetching data for TV show ID: ${tvId}`);

    // Fetch TV show details and genres in parallel
    const [tvDetails, genres] = await Promise.all([
      tmdbApi.getTVShowDetails(tvId),
      tmdbApi.getTVGenres(),
    ]);

    if (!tvDetails || !tvDetails.id) {
      console.error(`❌ TV show not found: ${tvId}`);
      return null;
    }

    console.log(`✅ Successfully fetched: ${tvDetails.name}`);

    // Fetch detailed season information with episodes
    const seasonsWithEpisodes = await Promise.allSettled(
      tvDetails.seasons?.map(async (season: any) => {
        if (season.season_number === 0) return null; // Skip specials
        try {
          const seasonDetails = await tmdbApi.getTVSeasonDetails(
            tvId, 
            season.season_number
          );
          return seasonDetails;
        } catch (error) {
          console.warn(`⚠️ Failed to fetch season ${season.season_number}:`, error);
          return season; // Return basic season info if detailed fetch fails
        }
      }) || []
    );

    const seasons = seasonsWithEpisodes
      .map(result => result.status === 'fulfilled' ? result.value : null)
      .filter(Boolean);

    return {
      tv: tvDetails,
      genres,
      seasons,
    };
  } catch (error) {
    console.error(`❌ Failed to fetch TV show data for ID ${id}:`, error);
    return null;
  }
}

// ✅ STEP 4: Generate SEO Metadata (Built at compile time)
export async function generateMetadata({ params }: TVPageProps) {
  const { id } = await params;
  const data = await getTVShowData(id);

  if (!data || !data.tv) {
    return {
      title: 'TV Show Not Found | Atto4',
      description: 'The requested TV show could not be found.',
    };
  }

  const { tv } = data;

  // Build direct TMDB image URLs (no API key needed for images)
  const posterUrl = tv.poster_path 
    ? `https://image.tmdb.org/t/p/w780${tv.poster_path}` 
    : undefined;
  
  const backdropUrl = tv.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${tv.backdrop_path}`
    : undefined;

  const firstAirYear = tv.first_air_date 
    ? new Date(tv.first_air_date).getFullYear() 
    : 'N/A';

  return {
    title: `${tv.name} (${firstAirYear}) | Watch Online - Atto4`,
    description: tv.overview || `Watch ${tv.name} online. ${tv.tagline || 'Stream all seasons on Atto4.'}`,
    keywords: [
      tv.name,
      'watch online',
      'stream tv show',
      'tv series',
      'Atto4',
      ...(tv.genres?.map(g => g.name) || []),
    ].join(', '),
    openGraph: {
      title: `${tv.name} (${firstAirYear})`,
      description: tv.overview,
      type: 'video.tv_show',
      url: `https://atto4.pro/tv/${tv.id}`,
      siteName: 'Atto4',
      images: [
        ...(backdropUrl ? [{
          url: backdropUrl,
          width: 1280,
          height: 720,
          alt: `${tv.name} backdrop`,
        }] : []),
        ...(posterUrl ? [{
          url: posterUrl,
          width: 780,
          height: 1170,
          alt: `${tv.name} poster`,
        }] : []),
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@Atto4',
      title: tv.name,
      description: tv.overview,
      images: [backdropUrl || posterUrl || ''],
    },
    alternates: {
      canonical: `https://atto4.pro/tv/${tv.id}`,
    },
  };
}

// ✅ STEP 5: Main TV Show Page Component (Statically Generated)
export default async function TVPage({ params }: TVPageProps) {
  const { id } = await params;
  const data = await getTVShowData(id);

  // Show 404 if TV show not found
  if (!data || !data.tv) {
    notFound();
  }

  console.log(`📺 Rendering static page for: ${data.tv.name}`);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <Suspense fallback={<LoadingSpinner />}>
        <TvShowDetailsClient 
          tv={data.tv} 
          genres={data.genres} 
          seasons={data.seasons}
        />
      </Suspense>
    </main>
  );
}
