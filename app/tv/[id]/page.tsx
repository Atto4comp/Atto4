// app/tv/[id]/page.tsx

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { tmdbApi } from '@/lib/api/tmdb';
import TvShowDetailsClient from '@/components/media/TVDetailsClient';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface TVPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  try {
    console.log('🔨 Building static TV show pages...');

    const [popular, topRated, onTheAir, airingToday] = await Promise.all([
      tmdbApi.getPopularTVShows(1),
      tmdbApi.getTopRatedTVShows(1),
      tmdbApi.getOnTheAirTVShows(1),
      tmdbApi.getAiringTodayTVShows(1),
    ]);

    const allShows = [
      ...popular.results,
      ...topRated.results,
      ...onTheAir.results,
      ...airingToday.results,
    ];

    const uniqueShowIds = Array.from(new Set(allShows.map(show => show.id)));

    console.log(`📊 Pre-rendering ${uniqueShowIds.length} TV show pages at build time`);

    return uniqueShowIds.map((id) => ({
      id: id.toString(),
    }));
  } catch (error) {
    console.error('❌ Failed to generate static params:', error);
    return [];
  }
}

export const dynamic = 'force-static';
export const revalidate = 86400;
export const dynamicParams = true;

async function getTVShowData(id: string) {
  try {
    const tvId = parseInt(id);
    if (isNaN(tvId) || tvId <= 0) {
      console.error(`❌ Invalid TV show ID: ${id}`);
      return null;
    }

    console.log(`📥 Fetching data for TV show ID: ${tvId}`);

    const [tvDetails, genres] = await Promise.all([
      tmdbApi.getTVShowDetails(tvId),
      tmdbApi.getTVGenres(),
    ]);

    if (!tvDetails || !tvDetails.id) {
      console.error(`❌ TV show not found: ${tvId}`);
      return null;
    }

    console.log(`✅ Successfully fetched: ${tvDetails.name}`);

    // Fetch season details
    const seasonsWithEpisodes = await Promise.allSettled(
      tvDetails.seasons?.map(async (season: any) => {
        if (season.season_number === 0) return null;
        try {
          const seasonDetails = await tmdbApi.getTVSeasonDetails(tvId, season.season_number);
          return seasonDetails;
        } catch (error) {
          console.warn(`⚠️ Failed to fetch season ${season.season_number}:`, error);
          return season;
        }
      }) || []
    );

    const seasons = seasonsWithEpisodes
      .map(result => result.status === 'fulfilled' ? result.value : null)
      .filter(Boolean);

    // Extract cast from credits
    const cast = tvDetails.credits?.cast || [];
    console.log(`👥 Cast members found: ${cast.length}`);

    return {
      tv: tvDetails,
      genres,
      seasons,
      cast: cast.slice(0, 15),
    };
  } catch (error) {
    console.error(`❌ Failed to fetch TV show data for ID ${id}:`, error);
    return null;
  }
}

export async function generateMetadata({ params }: TVPageProps) {
  const { id } = await params;
  const data = await getTVShowData(id);

  if (!data) {
    return {
      title: 'TV Show Not Found',
    };
  }

  return {
    title: `${data.tv.name} - Atto4`,
    description: data.tv.overview || `Watch ${data.tv.name}`,
  };
}

export default async function TVPage({ params }: TVPageProps) {
  const { id } = await params;
  const data = await getTVShowData(id);

  if (!data) {
    return notFound();
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TvShowDetailsClient
        tv={data.tv}
        genres={data.genres}
        seasons={data.seasons}
        cast={data.cast}
      />
    </Suspense>
  );
}
