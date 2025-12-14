import { vidlinkSource } from './sources/vidlink';
import { vidlinkEmbed } from './embeds/vidlink';

export function gatherAllSources() {
  return [
    vidlinkSource,
  ];
}

export function gatherAllEmbeds() {
  return [
    vidlinkEmbed,
  ];
}
