import { Subscriber } from '../util/Subscriber';
import { InvalidTypeError } from '../util/errors';
import { fieldFromIfTypeWithDefault } from '../util/fieldFromIfTypeWithDefault';

export const controls = [
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
export type Control = (typeof controls)[number];
export type Controls = Record<Control, boolean>;

export class ControlsSubscriber extends Subscriber<Controls, Controls> {
  protected command = 'subscribeControls';

  protected parse(value: unknown) {
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
    controls.forEach((control) => {
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
