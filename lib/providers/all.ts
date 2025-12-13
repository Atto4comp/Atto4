// lib/providers/all.ts
import { Sourcerer } from '@p-stream/providers';

// Import your scrapers here
import { vidzeeScraper } from './sources/vidzee';
//import { vidrockScraper } from './sources/vidrock';
// import { source3Scraper } from './sources/source3';
// ...

export function gatherAllSources(): Array<Sourcerer> {
  return [
    vidzeeScraper,
    vidrockScraper,
    // Add the rest here
  ];
}
