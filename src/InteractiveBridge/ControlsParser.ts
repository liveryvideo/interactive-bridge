import type { Parser } from '../util/Parser';
import { InvalidTypeError } from '../util/errors';
import { fieldFromIfTypeWithDefault } from '../util/fieldFromIfTypeWithDefault';

export const knownControls = [
  'cast',
  'contact',
  'error',
  'fullscreen',
  'mute',
  'pip',
  'play',
  'quality',
  'scrubber',
] as const;
export type Control = (typeof knownControls)[number];
export type Controls = Record<Control, boolean>;

export class ControlsParser implements Parser<Controls> {
  parse(value: unknown) {
    if (typeof value !== 'object') {
      throw new InvalidTypeError(
        value,
        `getLiveryParams value type: ${typeof value}, should be: object`,
      );
    }
    if (value === null) {
      throw new InvalidTypeError(
        value,
        `getLiveryParams value type: null, should be: object`,
      );
    }
    if (value instanceof Array) {
      throw new InvalidTypeError(
        value,
        `getLiveryParams value type: Array, should be: Object`,
      );
    }
    const output: Record<string, boolean> = {};
    knownControls.forEach((control) => {
      output[control] = fieldFromIfTypeWithDefault(
        control,
        value,
        'boolean',
        false,
      );
    });

    return output as Controls;
  }
}
