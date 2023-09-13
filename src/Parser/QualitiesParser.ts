import { InvalidTypeError } from '../errors';
import { fieldFromIfTypeWithDefault } from '../util/fieldFromIfTypeWithDefault';
import { parseToArray } from '../util/parseToArray';
import type { Parser } from './Parser';

export interface Quality {
  audio?: {
    bandwidth: number;
  };
  index: number;
  label: string;
  video?: {
    bandwidth: number;
    height: number;
    width: number;
  };
}

export class QualitiesParser implements Parser<Quality[]> {
  parse(value: unknown) {
    let array;
    try {
      array = parseToArray(value, 'subscribeQualities');
    } catch (error) {
      throw new InvalidTypeError(
        value,
        error instanceof Error
          ? error.message
          : 'Could not parse value. Expected type: Array',
      );
    }

    const qualityArray: Quality[] = [];
    for (let i = 0; i < array.length; i += 1) {
      if (array[i] === undefined) {
        continue;
      }
      const item = array[i];
      const label = fieldFromIfTypeWithDefault(
        'label',
        item,
        'string',
        String(i),
      );

      let audio: Quality['audio'];
      if (
        item instanceof Object &&
        'audio' in item &&
        item.audio instanceof Object
      ) {
        audio = {
          bandwidth: fieldFromIfTypeWithDefault(
            'bandwidth',
            item.audio,
            'number',
            NaN,
          ),
        };
      }

      let video: Quality['video'];
      if (
        item instanceof Object &&
        'video' in item &&
        item.video instanceof Object
      ) {
        video = {
          bandwidth: fieldFromIfTypeWithDefault(
            'bandwidth',
            item.video,
            'number',
            NaN,
          ),
          height: fieldFromIfTypeWithDefault(
            'height',
            item.video,
            'number',
            NaN,
          ),
          width: fieldFromIfTypeWithDefault('width', item.video, 'number', NaN),
        };
      }

      qualityArray.push({
        audio,
        index: i,
        label,
        video,
      });
    }
    return qualityArray;
  }
}
