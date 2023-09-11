import type { Parser } from '../util/Parser';
import { parseToArray } from '../util/parseToArray';

export const knownFeatures = [
  'AIRPLAY',
  'CHROMECAST',
  'CONTACT',
  'FULLSCREEN',
  'PIP',
  'SCRUBBER',
] as const;
export type Feature = (typeof knownFeatures)[number];

export class FeaturesParser implements Parser<Feature[]> {
  parse(value: unknown) {
    parseToArray(value, 'getFeatures');
    const features = new Set<Feature>();
    for (const feature of value as Array<unknown>) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      if (knownFeatures.includes(feature as Feature)) {
        features.add(feature as Feature);
      }
    }
    const sanitizedFeatureList: Feature[] = Array.from(features);
    return sanitizedFeatureList;
  }
}
